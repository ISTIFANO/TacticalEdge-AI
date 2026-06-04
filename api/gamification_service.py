"""Tactical puzzle generation and coach XP gamification."""
from __future__ import annotations

import json
import os
import random
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Any, Literal

from api.analytics_service import get_match_summary, get_players, get_recommendations_compare
from api.tactical_service import get_tactical_analysis

DB_PATH = os.path.join("data", "gamification.db")

Difficulty = Literal["Easy", "Medium", "Hard", "Elite"]
Category = Literal[
    "attack",
    "counter_attack",
    "corner_kick",
    "free_kick",
    "defensive_transition",
    "pressing",
    "formation_adjustment",
]

XP_BY_DIFFICULTY = {"Easy": 50, "Medium": 100, "Hard": 150, "Elite": 250}
LEVEL_XP_STEP = 500

CATEGORIES: list[Category] = [
    "attack",
    "counter_attack",
    "corner_kick",
    "free_kick",
    "defensive_transition",
    "pressing",
    "formation_adjustment",
]


def _conn() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    c.executescript("""
        CREATE TABLE IF NOT EXISTS coach_profile (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            xp INTEGER NOT NULL DEFAULT 0,
            puzzles_solved INTEGER NOT NULL DEFAULT 0,
            puzzles_correct INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT
        );
        INSERT OR IGNORE INTO coach_profile (id, xp, puzzles_solved, puzzles_correct) VALUES (1, 0, 0, 0);

        CREATE TABLE IF NOT EXISTS puzzle_sessions (
            puzzle_id TEXT PRIMARY KEY,
            payload_json TEXT NOT NULL,
            solved INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );
    """)
    return c


def _level_from_xp(xp: int) -> int:
    return max(1, 1 + xp // LEVEL_XP_STEP)


def _title_for_level(level: int) -> str:
    titles = ["Assistant", "Analyst", "Strategist", "Head Coach", "Elite Coach"]
    return titles[min(level - 1, len(titles) - 1)]


def get_profile() -> dict[str, Any]:
    with _conn() as c:
        row = c.execute("SELECT * FROM coach_profile WHERE id = 1").fetchone()
    xp = int(row["xp"])
    level = _level_from_xp(xp)
    next_level_xp = level * LEVEL_XP_STEP
    return {
        "xp": xp,
        "level": level,
        "title": _title_for_level(level),
        "xp_to_next_level": next_level_xp - xp,
        "next_level_xp": next_level_xp,
        "puzzles_solved": int(row["puzzles_solved"]),
        "puzzles_correct": int(row["puzzles_correct"]),
        "accuracy_pct": round(row["puzzles_correct"] / row["puzzles_solved"] * 100, 1)
        if row["puzzles_solved"] else 0,
    }


def _match_context(video_id: int) -> dict[str, Any]:
    match = get_match_summary(video_id)
    team = (match.get("teams") or [{}])[0]
    players = get_players(video_id)
    tac = {}
    try:
        tac = get_tactical_analysis(video_id)
    except Exception:
        pass
    rec = {}
    try:
        rec = get_recommendations_compare()
    except Exception:
        pass

    top_dist = sorted(players, key=lambda p: float(p.get("Distance_covered") or 0), reverse=True)
    top_scorer = max(players, key=lambda p: float(p.get("Goals") or 0), default={})

    formation = str(team.get("formations") or "4-2-3-1")
    possession = float(team.get("total_possession") or 50)
    pass_success = float(team.get("pass_success") or 75)
    corners = int(float(team.get("corners") or 0))
    interceptions = int(float(team.get("interceptions") or 0))
    tackles = int(float(team.get("tackles") or 0))
    goals = float(team.get("goals") or 0)
    shots = float(team.get("total_shots") or 0)

    thirds = tac.get("thirds_occupancy") or {"defensive": 33, "middle": 34, "attacking": 33}
    rec_form = "4-2-3-1"
    try:
        import pandas as pd
        path = "output_files_recommendation_systems/recommended_formations.csv"
        if os.path.isfile(path):
            df = pd.read_csv(path)
            if not df.empty and "formations" in df.columns:
                rec_form = str(df.iloc[0]["formations"])
    except Exception:
        pass

    return {
        "video_id": video_id,
        "formation": formation,
        "recommended_formation": rec_form,
        "possession": round(possession, 1),
        "pass_success": round(pass_success, 1),
        "corners": corners,
        "interceptions": interceptions,
        "tackles": tackles,
        "goals": goals,
        "shots": shots,
        "thirds": thirds,
        "top_runner": top_dist[0].get("shirt_number") if top_dist else "?",
        "top_scorer": top_scorer.get("shirt_number") if top_scorer else "?",
        "avg_width": tac.get("avg_team_width", 0),
    }


def _pick_category(ctx: dict, preferred: str | None) -> Category:
    if preferred and preferred in CATEGORIES:
        return preferred  # type: ignore[return-value]
    weighted: list[Category] = []
    if ctx["corners"] > 0:
        weighted.extend(["corner_kick"] * 3)
    if ctx["possession"] > 55:
        weighted.extend(["attack", "formation_adjustment"])
    if ctx["possession"] < 45:
        weighted.extend(["counter_attack", "defensive_transition"])
    if ctx["interceptions"] + ctx["tackles"] > 5:
        weighted.extend(["pressing"] * 2)
    if ctx["goals"] == 0 and ctx["shots"] < 3:
        weighted.extend(["attack", "free_kick"])
    if not weighted:
        weighted = list(CATEGORIES)
    return random.choice(weighted)


def _pick_difficulty(preferred: str | None) -> Difficulty:
    if preferred in XP_BY_DIFFICULTY:
        return preferred  # type: ignore[return-value]
    return random.choices(
        ["Easy", "Medium", "Hard", "Elite"],
        weights=[30, 40, 22, 8],
        k=1,
    )[0]  # type: ignore[return-value]


def _build_puzzle(category: Category, difficulty: Difficulty, ctx: dict) -> dict[str, Any]:
    f = ctx["formation"]
    rf = ctx["recommended_formation"]
    pos = ctx["possession"]
    ps = ctx["pass_success"]
    att = ctx["thirds"].get("attacking", 33)
    def_third = ctx["thirds"].get("defensive", 33)

    builders: dict[Category, list] = {
        "corner_kick": [
            {
                "scenario": (
                    f"78th minute, score level at 0-0. Your team ({f}) has earned a corner. "
                    f"Match data shows {ctx['corners']} corners so far and {ps}% pass accuracy. "
                    "The opponent leaves three tall centre-backs on the near post and man-marks your best header."
                ),
                "question": "What is the best attacking corner routine to create a high-quality chance?",
                "options": {
                    "A": "Four players attack the near post in a cluster to win the first ball",
                    "B": "Near-post flick-on with runners attacking the back post and penalty spot",
                    "C": "Short corner to retain possession and reset the attack",
                    "D": "Leave only two in the box and play everyone else on the edge for a volley",
                },
                "correct_answer": "B",
                "explanation": (
                    "With man-marking on your main target, a near-post flick-on creates chaos and frees "
                    "runners at the back post and central zone. Short corners (C) waste time when you need a goal; "
                    "clustering at the near post (A) plays into their setup."
                ),
            },
            {
                "scenario": (
                    "85th minute, you lead 1-0. The opponent takes an in-swinging corner from the left. "
                    "Their best three headers are crowding the near and central penalty spot."
                ),
                "question": "Which defensive corner setup best protects your lead?",
                "options": {
                    "A": "Pure man-marking on all opponents in the box",
                    "B": "Hybrid: zonal block inside the box plus tight man-markers on their three best headers",
                    "C": "All players on the goal line inside the six-yard box",
                    "D": "Press the corner taker and leave the box empty",
                },
                "correct_answer": "B",
                "explanation": (
                    "A hybrid setup covers zones for second balls while man-markers neutralize the main aerial threats. "
                    "Pure man-marking (A) loses structure on flick-ons; everyone on the line (C) invites deep inswingers."
                ),
            },
        ],
        "counter_attack": [
            {
                "scenario": (
                    f"Your team ({f}) is at {pos}% possession but sitting in a mid-block. "
                    f"You win the ball in the middle third after an opponent turnover. "
                    f"Your #{ctx['top_runner']} is making a run in behind the right channel."
                ),
                "question": "What is the best immediate decision to maximize the counter-attack?",
                "options": {
                    "A": "Secure possession with a safe pass back to the centre-backs",
                    "B": "Play a vertical first pass into the runner's channel within 3 seconds",
                    "C": "Switch play to the far side with three or more passes",
                    "D": "Hold the ball and wait for all ten outfield players to join the attack",
                },
                "correct_answer": "B",
                "explanation": (
                    "Counter-attacks succeed when you attack space before the defence reorganises. "
                    "A vertical first pass within 3 seconds exploits the runner; recycling (A) or slow switches (C) kill momentum."
                ),
            },
        ],
        "attack": [
            {
                "scenario": (
                    f"You dominate with {pos}% possession in {f}. "
                    f"Your attacking third occupancy is {att}% but you have only {ctx['shots']} shots. "
                    "Opponents sit in a compact 4-5-1 low block."
                ),
                "question": "How should you adjust to break the block?",
                "options": {
                    "A": "More central one-twos through the congested middle",
                    "B": "Switch play quickly, fullback overlaps, and early crosses from wide areas",
                    "C": "Long balls over the top on every possession",
                    "D": "Remove a midfielder and add another centre-back",
                },
                "correct_answer": "B",
                "explanation": (
                    "Against a low block, width and switch of play stretch the block and create crossing angles. "
                    "Central congestion (A) plays into their strength; long balls (C) are low-percentage without targets."
                ),
            },
        ],
        "free_kick": [
            {
                "scenario": (
                    "Dangerous free kick 22 metres out, central-left. Wall of four. "
                    f"Your team has {ps}% pass success this match — set pieces are a key chance to score."
                ),
                "question": "What is the highest-percentage free kick strategy?",
                "options": {
                    "A": "Direct shot over the wall to the top corner",
                    "B": "Decoy runner over the ball; short lay-off for a shot from a better angle",
                    "C": "Chip to the back post for a header",
                    "D": "Pass back to the centre-back and rebuild possession",
                },
                "correct_answer": "B",
                "explanation": (
                    "A short lay-off shifts the wall, opens a shooting lane, and creates a cleaner angle. "
                    "Direct shots (A) are low percentage from 22m; going back (D) wastes a prime scoring situation."
                ),
            },
        ],
        "defensive_transition": [
            {
                "scenario": (
                    "You lose possession in the attacking third with five players committed forward. "
                    f"Opponent triggers an immediate vertical pass into space. "
                    f"Your defensive third occupancy is only {def_third}%."
                ),
                "question": "What is the priority action for the nearest players?",
                "options": {
                    "A": "Sprint back to the penalty spot and delay the attack — do not dive in",
                    "B": "Immediate high press on the ball carrier in your half",
                    "C": "All outfield players run to the goal line",
                    "D": "Foul the attacker to stop the break",
                },
                "correct_answer": "A",
                "explanation": (
                    "After losing the ball high, the first defender must delay and protect the central corridor "
                    "while teammates recover shape. Diving in (B) opens space; fouling (D) is a last resort."
                ),
            },
        ],
        "pressing": [
            {
                "scenario": (
                    f"Opponent builds from the goalkeeper in a 3-2 shape. "
                    f"Your match stats: {ctx['interceptions']} interceptions and {ctx['tackles']} tackles. "
                    "You want to force a turnover in their defensive third."
                ),
                "question": "Which pressing trigger is most effective?",
                "options": {
                    "A": "Press when the ball travels to the fullback facing their own goal",
                    "B": "Press only after they enter your final third",
                    "C": "Man-mark every player across the entire pitch from kick-off",
                    "D": "Never press — drop into a 5-4-1 block immediately",
                },
                "correct_answer": "A",
                "explanation": (
                    "Pressing the fullback on a back-facing touch traps them on the sideline and limits passing options. "
                    "Waiting (B) gives them rhythm; man-marking everywhere (C) is unsustainable for 90 minutes."
                ),
            },
        ],
        "formation_adjustment": [
            {
                "scenario": (
                    f"You started in {f} but recommendation data suggests {rf} suits this opponent profile. "
                    f"You trail 0-1 at halftime with {pos}% possession and low penetration ({att}% time in attacking third)."
                ),
                "question": "What halftime adjustment gives the best balance of structure and attacking threat?",
                "options": {
                    "A": f"Switch to {rf} with wingers higher and one pivot screening the back line",
                    "B": "Move to 5-4-1 and eliminate all attacking width",
                    "C": "Play with no recognised striker and two attacking midfielders only",
                    "D": "Keep the same shape and only change motivational team talk",
                },
                "correct_answer": "A",
                "explanation": (
                    f"Moving toward {rf} adds width and a screening pivot — matching the recommended profile while fixing "
                    "lack of penetration. A pure low block (B) surrenders initiative when you need a goal."
                ),
            },
        ],
    }

    pool = builders.get(category, builders["attack"])
    if difficulty in ("Hard", "Elite"):
        pool = pool + builders.get("pressing", []) + builders.get("defensive_transition", [])
    template = random.choice(pool)

    puzzle_id = str(uuid.uuid4())
    xp = XP_BY_DIFFICULTY[difficulty]

    return {
        "id": puzzle_id,
        "category": category,
        "scenario": template["scenario"],
        "question": template["question"],
        "options": template["options"],
        "correct_answer": template["correct_answer"],
        "difficulty": difficulty,
        "xp_reward": xp,
        "explanation": template["explanation"],
        "match_context": {
            "video_id": ctx["video_id"],
            "formation": ctx["formation"],
            "possession": ctx["possession"],
        },
    }


def generate_puzzle(
    video_id: int = 1,
    category: str | None = None,
    difficulty: str | None = None,
) -> dict[str, Any]:
    ctx = _match_context(video_id)
    cat = _pick_category(ctx, category)
    diff = _pick_difficulty(difficulty)
    puzzle = _build_puzzle(cat, diff, ctx)

    now = datetime.now(timezone.utc).isoformat()
    with _conn() as c:
        c.execute(
            "INSERT OR REPLACE INTO puzzle_sessions (puzzle_id, payload_json, solved, created_at) VALUES (?,?,0,?)",
            (puzzle["id"], json.dumps(puzzle), now),
        )

    public = {k: v for k, v in puzzle.items() if k not in ("correct_answer", "explanation")}
    return public


def submit_answer(puzzle_id: str, answer: str) -> dict[str, Any]:
    answer = answer.strip().upper()
    if answer not in ("A", "B", "C", "D"):
        raise ValueError("answer must be A, B, C, or D")

    with _conn() as c:
        row = c.execute(
            "SELECT payload_json, solved FROM puzzle_sessions WHERE puzzle_id = ?",
            (puzzle_id,),
        ).fetchone()
        if not row:
            raise LookupError("Puzzle not found or expired")
        if row["solved"]:
            raise ValueError("Puzzle already submitted")

        puzzle = json.loads(row["payload_json"])
        correct = answer == puzzle["correct_answer"]
        xp_earned = puzzle["xp_reward"] if correct else max(10, puzzle["xp_reward"] // 5)

        c.execute("UPDATE puzzle_sessions SET solved = 1 WHERE puzzle_id = ?", (puzzle_id,))
        c.execute(
            """UPDATE coach_profile SET
               xp = xp + ?,
               puzzles_solved = puzzles_solved + 1,
               puzzles_correct = puzzles_correct + ?,
               updated_at = ?
               WHERE id = 1""",
            (xp_earned, 1 if correct else 0, datetime.now(timezone.utc).isoformat()),
        )

    profile = get_profile()
    return {
        "correct": correct,
        "your_answer": answer,
        "correct_answer": puzzle["correct_answer"],
        "explanation": puzzle["explanation"],
        "xp_earned": xp_earned,
        "xp_reward": puzzle["xp_reward"],
        "difficulty": puzzle["difficulty"],
        "category": puzzle["category"],
        "profile": profile,
    }


def list_categories() -> list[dict[str, str]]:
    labels = {
        "attack": "Attack",
        "counter_attack": "Counter Attack",
        "corner_kick": "Corner Kick",
        "free_kick": "Free Kick",
        "defensive_transition": "Defensive Transition",
        "pressing": "Pressing",
        "formation_adjustment": "Formation Adjustment",
    }
    return [{"id": c, "label": labels[c]} for c in CATEGORIES]
