"""Derived tactical metrics from existing CSV/track data."""
from __future__ import annotations

import ast
import os
from typing import Any

import numpy as np
import pandas as pd

from api.analytics_service import _read_csv, get_match_summary, get_players

CV_DIR = "output_files_computer_vision"
PITCH_W = 1920
PITCH_H = 1080


def _parse_bbox(raw: Any) -> list[float] | None:
    if raw is None or (isinstance(raw, float) and np.isnan(raw)):
        return None
    try:
        if isinstance(raw, str):
            return [float(x) for x in ast.literal_eval(raw)]
        if isinstance(raw, (list, tuple)):
            return [float(x) for x in raw]
    except (ValueError, SyntaxError, TypeError):
        pass
    return None


def _third(x: float) -> str:
    if x < PITCH_W / 3:
        return "defensive"
    if x < 2 * PITCH_W / 3:
        return "middle"
    return "attacking"


def get_tactical_analysis(video_id: int) -> dict:
    path = f"{CV_DIR}/tracks_csv_video_{video_id}.csv"
    df = _read_csv(path)
    match = get_match_summary(video_id)
    players = get_players(video_id)

    thirds = {"defensive": 0, "middle": 0, "attacking": 0}
    widths: list[float] = []
    compactness_vals: list[float] = []
    max_frame = 0

    if not df.empty and "Class Label" in df.columns:
        players_df = df[df["Class Label"] == "player"]
        if "Frame Number" in players_df.columns:
            max_frame = int(players_df["Frame Number"].max())
            sample_frames = players_df["Frame Number"].unique()[::10]
            for frame in sample_frames:
                frame_rows = players_df[players_df["Frame Number"] == frame]
                xs = []
                ys = []
                for _, row in frame_rows.iterrows():
                    bbox = _parse_bbox(row.get("Bounding Box (x1, y1, x2, y2)"))
                    if bbox:
                        cx = (bbox[0] + bbox[2]) / 2
                        cy = (bbox[1] + bbox[3]) / 2
                        xs.append(cx)
                        ys.append(cy)
                        thirds[_third(cx)] += 1
                if len(xs) >= 2:
                    widths.append(float(np.std(xs)))
                    dists = []
                    for i in range(len(xs)):
                        for j in range(i + 1, len(xs)):
                            dists.append(((xs[i] - xs[j]) ** 2 + (ys[i] - ys[j]) ** 2) ** 0.5)
                    compactness_vals.append(float(np.mean(dists)))

    total_third = sum(thirds.values()) or 1
    thirds_pct = {k: round(v / total_third * 100, 1) for k, v in thirds.items()}

    period_mid = max_frame // 2 if max_frame else 0
    first_half_players = [p for p in players if True]  # proxy: use aggregate player stats
    team_stats = match.get("teams", [{}])
    t0 = team_stats[0] if team_stats else {}

    return {
        "video_id": video_id,
        "thirds_occupancy": thirds_pct,
        "avg_team_width": round(float(np.mean(widths)), 1) if widths else 0,
        "avg_compactness": round(float(np.mean(compactness_vals)), 1) if compactness_vals else 0,
        "max_frame": max_frame,
        "period_split_frame": period_mid,
        "team_summary": {
            "goals": t0.get("goals", 0),
            "total_shots": t0.get("total_shots", 0),
            "total_passes": t0.get("total_passes", 0),
            "pass_success": t0.get("pass_success", 0),
            "total_possession": t0.get("total_possession", 0),
        },
        "top_distance_players": sorted(
            players,
            key=lambda p: float(p.get("Distance_covered") or 0),
            reverse=True,
        )[:5],
    }


def get_timeline_events(video_id: int) -> dict:
    """Approximate event markers from team/player aggregate stats."""
    match = get_match_summary(video_id)
    players = get_players(video_id)
    path = f"{CV_DIR}/tracks_csv_video_{video_id}.csv"
    tracks = _read_csv(path)
    max_frame = int(tracks["Frame Number"].max()) if not tracks.empty and "Frame Number" in tracks.columns else 0

    events = []
    for team in match.get("teams", []):
        if float(team.get("goals") or 0) > 0:
            events.append({
                "type": "goal",
                "label": f"Goals: {team.get('goals')}",
                "frame": max_frame // 2,
                "team": team.get("formations", "Team"),
            })
        if float(team.get("total_shots") or 0) > 0:
            events.append({
                "type": "shots",
                "label": f"Shots: {team.get('total_shots')}",
                "frame": max_frame // 3,
            })
        if int(team.get("corners") or 0) > 0:
            events.append({
                "type": "corner",
                "label": f"Corners: {team.get('corners')}",
                "frame": max_frame // 4,
            })

    top_scorer = max(players, key=lambda p: float(p.get("Goals") or 0), default=None)
    if top_scorer and float(top_scorer.get("Goals") or 0) > 0:
        events.append({
            "type": "player_goal",
            "label": f"#{top_scorer.get('shirt_number')} scored",
            "frame": max_frame // 2,
        })

    events.sort(key=lambda e: e["frame"])
    return {"video_id": video_id, "max_frame": max_frame, "events": events}
