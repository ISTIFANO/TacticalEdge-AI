"""Load, normalize, and aggregate Tactic Zone CSV outputs for the analytics API."""
from __future__ import annotations

import ast
import os
from datetime import datetime, timezone
from typing import Any

import numpy as np
import pandas as pd

CV_DIR = "output_files_computer_vision"
REC_DIR = "output_files_recommendation_systems"

MAX_SPEED = 500.0
VIDEO_LABELS = {1: "my_team", 2: "opponent"}


class AnalyticsState:
    processing: bool = False
    analytics_ready: bool = False
    last_updated: str | None = None

    @classmethod
    def mark_processing(cls) -> None:
        cls.processing = True
        cls.analytics_ready = False

    @classmethod
    def mark_ready(cls) -> None:
        cls.processing = False
        cls.analytics_ready = True
        cls.last_updated = datetime.now(timezone.utc).isoformat()


def _exists(path: str) -> bool:
    return os.path.isfile(path)


def _read_csv(path: str) -> pd.DataFrame:
    if not _exists(path):
        return pd.DataFrame()
    return pd.read_csv(path)


def parse_team_color(value: Any) -> dict[str, int] | None:
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return None
    if isinstance(value, dict):
        return value
    text = str(value).strip().replace(",", " ")
    text = text.strip("[]")
    try:
        parts = [float(x) for x in text.split() if x]
        if len(parts) >= 3:
            return {"r": int(parts[0]), "g": int(parts[1]), "b": int(parts[2])}
    except (ValueError, TypeError):
        pass
    return None


def _sanitize_speed(val: Any) -> float:
    try:
        v = float(val)
        if np.isnan(v) or v < 0 or v > MAX_SPEED:
            return 0.0
        return round(v, 2)
    except (TypeError, ValueError):
        return 0.0


def _df_records(df: pd.DataFrame) -> list[dict]:
    if df.empty:
        return []
    out = df.replace({np.nan: None}).to_dict(orient="records")
    return out


def _clean_player_df(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    df = df.copy()
    if "shirt_number" in df.columns:
        df["shirt_number"] = pd.to_numeric(df["shirt_number"], errors="coerce").fillna(0).astype(int)
    if "Shirt_Number" in df.columns:
        df["Shirt_Number"] = pd.to_numeric(df["Shirt_Number"], errors="coerce").fillna(0).astype(int)
    for col in ("highest_speed", "Highest_speed", "avg_speed", "Avg_speed"):
        if col in df.columns:
            df[col] = df[col].apply(_sanitize_speed)
    if "team_color" in df.columns:
        df["team_color_rgb"] = df["team_color"].apply(parse_team_color)

    activity_cols = [
        c for c in [
            "Goals", "goals", "Total_passes", "total_passes", "Total_shots", "total_shots",
            "Distance_covered", "distance_covered", "Pass_Success", "accurate_passes",
        ]
        if c in df.columns
    ]
    if activity_cols and "shirt_number" in df.columns:
        activity = df[activity_cols].fillna(0).sum(axis=1)
        df = df[(df["shirt_number"] != 0) | (activity > 0)]

    if "Total_passes" in df.columns and "Pass_Success" in df.columns:
        df["pass_success_rate"] = np.where(
            df["Total_passes"] > 0,
            (df["Pass_Success"] / df["Total_passes"] * 100).round(1),
            0,
        )
    if "total_passes" in df.columns and "accurate_passes" in df.columns:
        df["pass_success_rate"] = np.where(
            df["total_passes"] > 0,
            (df["accurate_passes"] / df["total_passes"] * 100).round(1),
            0,
        )
    if "Total_shots" in df.columns and "Shots_on_Target" in df.columns:
        df["shot_accuracy"] = np.where(
            df["Total_shots"] > 0,
            (df["Shots_on_Target"] / df["Total_shots"] * 100).round(1),
            0,
        )
    if "total_shots" in df.columns and "shots_on_target" in df.columns:
        df["shot_accuracy"] = np.where(
            df["total_shots"] > 0,
            (df["shots_on_target"] / df["total_shots"] * 100).round(1),
            0,
        )
    return df


def get_videos_ready() -> list[int]:
    ready = []
    for vid in (1, 2):
        if _exists(f"{CV_DIR}/teams_final_statistics_video_{vid}.csv"):
            ready.append(vid)
    return ready


def get_status() -> dict:
    return {
        "processing": AnalyticsState.processing,
        "analytics_ready": AnalyticsState.analytics_ready or len(get_videos_ready()) > 0,
        "videos_ready": get_videos_ready(),
        "last_updated": AnalyticsState.last_updated,
    }


def _team_summary_row(row: pd.Series, video_id: int) -> dict:
    d = row.replace({np.nan: None}).to_dict()
    d["video_id"] = video_id
    d["team_label"] = VIDEO_LABELS.get(video_id, f"video_{video_id}")
    d["team_color_rgb"] = parse_team_color(d.get("team_color"))
    if d.get("formations") in (0, "0", None):
        d["formations"] = "Unknown"
    return d


def get_match_summary(video_id: int) -> dict:
    final_df = _read_csv(f"{CV_DIR}/teams_final_statistics_video_{video_id}.csv")
    team_df = _read_csv(f"{CV_DIR}/team_statistics_video_{video_id}.csv")
    teams = []
    if not final_df.empty:
        for _, row in final_df.iterrows():
            teams.append(_team_summary_row(row, video_id))
    return {
        "video_id": video_id,
        "team_label": VIDEO_LABELS.get(video_id, f"video_{video_id}"),
        "teams": teams,
        "team_statistics": _df_records(team_df),
    }


def get_players(video_id: int, team: int | None = None, min_distance: float = 0) -> list[dict]:
    df = _clean_player_df(_read_csv(f"{CV_DIR}/player_statistics_video_{video_id}.csv"))
    if df.empty:
        return []
    if team is not None and "team" in df.columns:
        df = df[df["team"] == team]
    if min_distance > 0 and "Distance_covered" in df.columns:
        df = df[df["Distance_covered"].fillna(0) >= min_distance]
    df["video_id"] = video_id
    return _df_records(df)


def get_squad(video_id: int, team_id: int) -> list[dict]:
    path = f"{CV_DIR}/team_{team_id}_player_statistics_video_{video_id}.csv"
    df = _clean_player_df(_read_csv(path))
    if "shirtNumber" in df.columns and "shirt_number" not in df.columns:
        df["shirt_number"] = df["shirtNumber"]
    df["video_id"] = video_id
    df["team_id"] = team_id
    return _df_records(df)


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


def get_tracking(
    video_id: int,
    frame: int | None = None,
    class_label: str | None = None,
    limit: int = 500,
    offset: int = 0,
) -> dict:
    path = f"{CV_DIR}/tracks_csv_video_{video_id}.csv"
    df = _read_csv(path)
    if df.empty:
        return {"total": 0, "items": [], "max_frame": 0}

    if frame is not None and "Frame Number" in df.columns:
        df = df[df["Frame Number"] == frame]
    if class_label and "Class Label" in df.columns:
        df = df[df["Class Label"] == class_label]

    total = len(df)
    chunk = df.iloc[offset : offset + limit]
    items = []
    for _, row in chunk.iterrows():
        bbox = _parse_bbox(row.get("Bounding Box (x1, y1, x2, y2)"))
        cx = cy = None
        if bbox and len(bbox) == 4:
            cx = round((bbox[0] + bbox[2]) / 2, 1)
            cy = round((bbox[1] + bbox[3]) / 2, 1)
        items.append({
            "frame": int(row.get("Frame Number", 0)),
            "class_label": row.get("Class Label"),
            "track_id": int(row.get("Track ID", 0)),
            "bbox": bbox,
            "center_x": cx,
            "center_y": cy,
        })

    max_frame = int(_read_csv(path)["Frame Number"].max()) if _exists(path) else 0
    return {"total": total, "items": items, "max_frame": max_frame, "offset": offset, "limit": limit}


def get_tracking_heatmap(video_id: int, sample_every: int = 10) -> list[dict]:
    path = f"{CV_DIR}/tracks_csv_video_{video_id}.csv"
    df = _read_csv(path)
    if df.empty:
        return []
    df = df[df["Class Label"] == "player"] if "Class Label" in df.columns else df
    if "Frame Number" in df.columns:
        df = df[df["Frame Number"] % sample_every == 0]
    points = []
    for _, row in df.iterrows():
        bbox = _parse_bbox(row.get("Bounding Box (x1, y1, x2, y2)"))
        if bbox:
            points.append({
                "x": round((bbox[0] + bbox[2]) / 2, 1),
                "y": round((bbox[1] + bbox[3]) / 2, 1),
            })
    return points[:2000]


def _aggregate_team_from_players(video_id: int, team_idx: int) -> dict:
    players = get_players(video_id, team=team_idx)
    if not players:
        return {}
    return {
        "goals": sum(float(p.get("Goals") or p.get("goals") or 0) for p in players),
        "total_shots": sum(float(p.get("Total_shots") or p.get("total_shots") or 0) for p in players),
        "total_passes": sum(float(p.get("Total_passes") or p.get("total_passes") or 0) for p in players),
        "distance_covered": round(sum(float(p.get("Distance_covered") or p.get("distance_covered") or 0) for p in players), 1),
        "player_count": len(players),
    }


def get_overview() -> dict:
    matches = []
    for vid in get_videos_ready():
        summary = get_match_summary(vid)
        teams = summary.get("teams", [])
        for i, team in enumerate(teams):
            agg = _aggregate_team_from_players(vid, i + 1)
            team.update(agg)
        top_distance = sorted(
            get_players(vid),
            key=lambda p: float(p.get("Distance_covered") or p.get("distance_covered") or 0),
            reverse=True,
        )[:5]
        matches.append({
            "video_id": vid,
            "team_label": VIDEO_LABELS.get(vid, f"video_{vid}"),
            "teams": teams,
            "top_distance_players": top_distance,
        })

    comparison = []
    if len(matches) >= 2:
        for metric in ("goals", "total_shots", "total_passes", "distance_covered"):
            comparison.append({
                "metric": metric,
                "match_1": matches[0]["teams"][0].get(metric, 0) if matches[0]["teams"] else 0,
                "match_2": matches[1]["teams"][0].get(metric, 0) if matches[1]["teams"] else 0,
            })

    return {
        "matches": matches,
        "comparison": comparison,
        "recommendations_available": _exists(f"{REC_DIR}/recommended_formations.csv"),
    }


def get_recommendations_formations() -> list[dict]:
    return _df_records(_read_csv(f"{REC_DIR}/recommended_formations.csv"))


def get_recommendations_lineup() -> dict:
    df = _read_csv(f"{REC_DIR}/combined_team.csv")
    if df.empty:
        return {"starting_11": [], "substitutes": []}
    records = _df_records(df)
    starting = [r for r in records if r.get("status") == "Starting 11"]
    subs = [r for r in records if r.get("status") == "Substitute"]
    if not starting and not subs:
        starting = records
    return {"starting_11": starting, "substitutes": subs}


def get_recommendations_teams() -> dict:
    my = _df_records(_read_csv(f"{REC_DIR}/my_team.csv"))
    opp = _df_records(_read_csv(f"{REC_DIR}/opponent_team.csv"))
    for row in my + opp:
        row["team_color_rgb"] = parse_team_color(row.get("team_color"))
    return {
        "my_team": my[0] if my else None,
        "opponent_team": opp[0] if opp else None,
    }


def get_recommendations_squads() -> dict:
    my = _clean_player_df(_read_csv(f"{REC_DIR}/closest_player_data_mobile1.csv"))
    opp = _clean_player_df(_read_csv(f"{REC_DIR}/closest_player_data_mobile2.csv"))
    return {
        "my_squad": _df_records(my),
        "opponent_squad": _df_records(opp),
    }


def get_recommendations_compare() -> dict:
    teams = get_recommendations_teams()
    my = teams.get("my_team") or {}
    opp = teams.get("opponent_team") or {}
    metrics = [
        "goals", "total_shots", "shots_on_target", "total_passes", "pass_success",
        "tackles", "interceptions", "clearances", "corners", "total_possession",
    ]
    rows = []
    for m in metrics:
        rows.append({"metric": m, "my_team": my.get(m), "opponent": opp.get(m)})
    return {"comparison": rows, "my_team": my, "opponent_team": opp}
