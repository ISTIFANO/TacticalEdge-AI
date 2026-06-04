"""Generate and persist Football Coach LLM reports from recommendation CSVs."""
from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone
from typing import Literal

import pandas as pd

from api.coach_llm_service import complete_with_retry
from generate_prompt.coach_prompts import (
    REPORT_TITLES,
    halftime_brief_prompt,
    lineup_recommendations_prompt,
    match_summary_prompt,
    opponent_analysis_prompt,
    training_plan_prompt,
)

REC_DIR = "output_files_recommendation_systems"
REPORTS_PATH = os.path.join(REC_DIR, "coach_reports.json")

ReportMode = Literal["full", "halftime"]
ReportId = Literal[
    "match_summary",
    "opponent_analysis",
    "lineup_recommendations",
    "training_plan",
    "halftime_brief",
]

ALL_REPORTS: list[ReportId] = [
    "match_summary",
    "opponent_analysis",
    "lineup_recommendations",
    "training_plan",
    "halftime_brief",
]

HALFTIME_REPORTS: list[ReportId] = ["halftime_brief"]


def _load_csv_str(path: str) -> str:
    if not os.path.isfile(path):
        return f"(no data: {path})"
    return pd.read_csv(path).to_string(index=False)


def load_reports() -> dict:
    if os.path.isfile(REPORTS_PATH):
        with open(REPORTS_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {
        "generated_at": None,
        "model": None,
        "provider": None,
        "mode": None,
        "reports": {},
    }


def save_reports(payload: dict) -> None:
    os.makedirs(REC_DIR, exist_ok=True)
    with open(REPORTS_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)


def _make_report_entry(result: dict | None, report_id: str) -> dict:
    if not result or not result.get("text"):
        return {
            "title": REPORT_TITLES.get(report_id, report_id),
            "markdown": "*Report generation failed. Check COACH_LLM_BASE_URL and try again.*",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "error": True,
        }
    return {
        "title": REPORT_TITLES.get(report_id, report_id),
        "markdown": result["text"],
        "generated_at": result["created_at"],
        "model": result.get("model"),
        "provider": result.get("provider"),
    }


def run_coach_reports(
    mode: ReportMode = "full",
    report_ids: list[str] | None = None,
    delay: float = 3.0,
) -> dict:
    """Generate coach reports and save to coach_reports.json."""
    my_team = _load_csv_str(f"{REC_DIR}/my_team.csv")
    opponent = _load_csv_str(f"{REC_DIR}/opponent_team.csv")
    my_squad = _load_csv_str(f"{REC_DIR}/closest_player_data_mobile1.csv")
    opp_squad = _load_csv_str(f"{REC_DIR}/closest_player_data_mobile2.csv")
    formations = _load_csv_str(f"{REC_DIR}/recommended_formations.csv")
    lineup = _load_csv_str(f"{REC_DIR}/combined_team.csv")

    if report_ids is None:
        report_ids = HALFTIME_REPORTS if mode == "halftime" else ALL_REPORTS

    existing = load_reports()
    reports: dict = dict(existing.get("reports", {}))
    model_name = None
    provider = None

    opponent_analysis_text = reports.get("opponent_analysis", {}).get("markdown", "")

    for rid in report_ids:
        print(f"=== Generating report: {rid} ===")
        result = None
        if rid == "match_summary":
            result = complete_with_retry(match_summary_prompt(my_team, opponent))
        elif rid == "opponent_analysis":
            result = complete_with_retry(opponent_analysis_prompt(opponent, opp_squad))
            if result:
                opponent_analysis_text = result["text"]
        elif rid == "lineup_recommendations":
            result = complete_with_retry(lineup_recommendations_prompt(formations, lineup))
        elif rid == "training_plan":
            if not opponent_analysis_text:
                opp_res = complete_with_retry(opponent_analysis_prompt(opponent, opp_squad))
                opponent_analysis_text = (opp_res or {}).get("text", "")
            result = complete_with_retry(
                training_plan_prompt(my_squad, my_team, opponent_analysis_text)
            )
        elif rid == "halftime_brief":
            result = complete_with_retry(halftime_brief_prompt(my_team, opponent))

        reports[rid] = _make_report_entry(result, rid)
        if result:
            model_name = result.get("model")
            provider = result.get("provider")
        time.sleep(delay)

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "model": model_name,
        "provider": provider,
        "mode": mode,
        "reports": reports,
    }
    save_reports(payload)
    print(f"Saved coach reports to {REPORTS_PATH}")
    return payload


def get_report(report_id: str) -> dict | None:
    data = load_reports()
    return data.get("reports", {}).get(report_id)
