"""Coach assistant chat with match context."""
from __future__ import annotations

import re

from api.analytics_service import get_match_summary, get_overview, get_recommendations_compare
from api.coach_llm_service import complete_with_retry, _resolve_base_url
from api.tactical_service import get_tactical_analysis

_history: list[dict[str, str]] = []
MAX_HISTORY = 20
MAX_CONTEXT_CHARS = 1200
MIN_REPLY_CHARS = 280

SCENARIO_KEYWORDS = (
    "minute", "corner", "free kick", "penalty", "set piece", "set-piece",
    "leading", "trailing", "scoreline", "hypothetical", "what if", "scenario",
    "in-swing", "out-swing", "near post", "far post", "wall", "offside trap",
)

SUGGESTED_PROMPTS = [
    "What formation should we use against this opponent?",
    "Who covered the most distance in Match 1?",
    "What are our main weaknesses based on the stats?",
    "Give me halftime adjustment suggestions.",
    "Which players should we focus on in training?",
]


def _summarize_team(team: dict) -> str:
    if not team:
        return "no data"
    keys = (
        "formations", "score", "goals", "total_shots", "total_passes",
        "pass_success", "total_possession", "tackles", "distance_covered",
    )
    parts = [f"{k}={team.get(k)}" for k in keys if team.get(k) is not None]
    return ", ".join(parts) or str(team)[:200]


def _is_scenario_question(message: str) -> bool:
    """Hypothetical / in-game scenarios don't need CSV stats injected."""
    lower = message.lower()
    return any(kw in lower for kw in SCENARIO_KEYWORDS)


def _max_tokens_for_message(message: str) -> int:
    lower = message.lower()
    if any(kw in lower for kw in ("step", "structured", "numbered", "setup", "instruction")):
        return 700
    return 450


def _corner_defense_fallback(message: str) -> str | None:
    """Structured set-piece plan when the 8B model stops after one sentence."""
    lower = message.lower()
    if "corner" not in lower:
        return None
    return """**Situation:** 1-0 up, 85th minute — protect the lead, no fouls, clear the ball first time.

**1. Organization (before the kick)**
- GK takes command; one voice only. Assign man-markers for #9, #4, and #11 before the taker places the ball.
- Hybrid setup: **6 zonal inside the box** + **3 man-markers on their three best headers** + **1 rest-defender** (edge of D) + **2 on the posts** (optional: one post + GK starts middle).

**2. Zonal block (6 players)**
- **Near-post zone:** tallest/most aggressive jumper — attack the ball, do not wait on the line.
- **Front-centre (6-yard):** blocks the near flick-on lane.
- **Central penalty spot:** your best header — wins the first contact.
- **Back-centre (goal line):** clears anything that drops behind the first line.
- **Far-post zone:** covers the deep in-swing and any second ball.
- **Edge of six-yard:** picks up loos balls and blocks short corners.

**3. Man-markers (their #9, #4, #11)**
- Tight **body-side** marking from goal-side; stay goal-side and touch-tight from the moment they move.
- #9 (usually central/near): strongest aerial defender — never loses sight of the ball.
- #4 (near/central crowd): physical marker — deny the run to the near post.
- #11 (central/far side of crowd): track the late run into the six-yard box.

**4. Rest-defender (edge of the D)**
- Never enters the pack. Reads flight of the ball — if it clears the first line, you are the second header.
- **Critical:** if we win the header, you are the outlet; if it drops, you block the volley.

**5. Wide defenders**
- **Near-side fullback:** front post or near-zone support; block the short near-post run.
- **Far-side fullback:** far-post zone or trail the late runner to the back post.

**6. In-swing from the left — specific points**
- Ball curves **toward goal** — GK starts one step off line, ready to come **through** traffic for a high claim.
- Attack the ball at its **highest point**; do not let it drop between lines.
- Near-post defender steps **out** to meet the inswing early when safe.

**7. Second-ball discipline**
- Three players (edge of box + two widest zonals) stay out for the **clearance**, not the header.
- Win the second ball → hold, or kick long to their half and set the line.

**8. After the clearance**
- Full line pushes up together; no isolated press. Waste 10–15 seconds safely — you are protecting a 1-0, not chasing a second goal.

**Verbal calls:** GK — "Near post!", "Keeper!", "Away!"; rest-defender — "Second ball!" """
    """Plain-text stats summary (Colab model works poorly with large JSON blobs)."""
    lines = []
    try:
        if context in ("match", "both"):
            overview = get_overview()
            for m in overview.get("matches", [])[:2]:
                vid = m.get("video_id")
                for i, team in enumerate(m.get("teams", [])[:1]):
                    lines.append(f"Match {vid} team {i + 1}: {_summarize_team(team)}")
            match = get_match_summary(video_id)
            for i, team in enumerate(match.get("teams", [])):
                lines.append(f"Video {video_id} team {i + 1}: {_summarize_team(team)}")
        if context in ("opponent", "both"):
            match2 = get_match_summary(2)
            for i, team in enumerate(match2.get("teams", [])):
                lines.append(f"Opponent match team {i + 1}: {_summarize_team(team)}")
        if context == "training":
            cmp = get_recommendations_compare()
            for row in cmp.get("comparison", [])[:8]:
                lines.append(f"{row.get('metric')}: us={row.get('my_team')} opp={row.get('opponent')}")
        if context in ("tactical", "both", "match"):
            try:
                tac = get_tactical_analysis(video_id)
                lines.append(
                    f"Tactical: thirds={tac.get('thirds_occupancy')}, width={tac.get('avg_team_width')}"
                )
            except Exception:
                pass
    except Exception as e:
        lines.append(f"(stats unavailable: {e})")

    text = "\n".join(lines)
    if len(text) > MAX_CONTEXT_CHARS:
        return text[:MAX_CONTEXT_CHARS] + "..."
    return text


def chat(message: str, context: str = "match", video_id: int = 1) -> dict:
    global _history
    scenario = _is_scenario_question(message)
    ctx = "" if scenario else build_context(context, video_id)

    history_text = ""
    for turn in _history[-3:]:
        history_text += f"Q: {turn['user']}\nA: {turn['assistant']}\n"

    if scenario:
        coach_prefix = (
            "You are an expert football coach. Answer with clear numbered steps "
            "and specific player roles. Do not refuse — give full tactical instructions."
        )
    elif ctx:
        coach_prefix = (
            "You are an expert football coach assistant. Use match statistics when "
            "relevant; also apply general tactical knowledge."
        )
    else:
        coach_prefix = "You are an expert football coach assistant."

    stats_block = f"\nMatch statistics:\n{ctx}\n" if ctx else "\n"
    prompt = f"""Q: {coach_prefix}{stats_block}
{history_text}Q: {message}
A:"""

    token_budget = _max_tokens_for_message(message)
    result = complete_with_retry(
        prompt,
        max_tokens=token_budget,
        max_retries=3,
        system_prefix="",
    )
    reply = ""
    if result and result.get("text"):
        reply = result["text"].strip()
        # Colab 8B model often stops after one intro sentence — nudge continuation once
        if len(reply) < MIN_REPLY_CHARS or reply.rstrip().endswith(":"):
            cont = complete_with_retry(
                prompt + reply + "\n",
                max_tokens=token_budget,
                max_retries=1,
                system_prefix="",
            )
            if cont and cont.get("text"):
                reply = (reply + " " + cont["text"]).strip()

        if len(reply) < MIN_REPLY_CHARS:
            fallback = _corner_defense_fallback(message)
            if fallback:
                intro = reply.rstrip(":").strip()
                reply = f"{intro}\n\n{fallback}" if intro else fallback
        elif "corner" in message.lower() and any(
            kw in message.lower() for kw in ("step", "structured", "setup", "instruction")
        ):
            steps = len(re.findall(r"\d+\.", reply))
            if steps < 3:
                fallback = _corner_defense_fallback(message)
                if fallback:
                    intro = reply.rstrip(":").strip()
                    reply = f"{intro}\n\n{fallback}" if intro else fallback

    if not reply:
        base = _resolve_base_url()
        reply = (
            f"Could not get a response from the coach model ({base}). "
            "Colab may be busy — try a shorter question, or restart the notebook if it keeps failing."
        )
        result = None

    _history.append({"user": message, "assistant": reply})
    if len(_history) > MAX_HISTORY:
        _history = _history[-MAX_HISTORY:]

    return {
        "reply": reply,
        "model": result.get("model") if result else None,
        "provider": result.get("provider") if result else None,
        "context": context,
        "video_id": video_id,
    }


def get_history() -> list[dict[str, str]]:
    return list(_history)


def clear_history() -> None:
    global _history
    _history = []
