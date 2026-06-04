"""SQLite match library for saving and comparing runs."""
from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime, timezone
from typing import Any

from api.analytics_service import get_overview
from api.coach_reports import load_reports

DB_PATH = os.path.join("data", "matches.db")


def _conn() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    c.execute("""
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            label TEXT NOT NULL,
            opponent TEXT,
            played_at TEXT,
            video_id INTEGER DEFAULT 1,
            mode TEXT DEFAULT 'full',
            stats_json TEXT,
            reports_json TEXT,
            created_at TEXT NOT NULL
        )
    """)
    return c


def list_matches() -> list[dict]:
    with _conn() as c:
        rows = c.execute("SELECT id, label, opponent, played_at, mode, created_at FROM matches ORDER BY id DESC").fetchall()
    return [dict(r) for r in rows]


def save_snapshot(label: str, opponent: str = "", mode: str = "full") -> dict:
    overview = get_overview()
    reports = load_reports()
    now = datetime.now(timezone.utc).isoformat()
    with _conn() as c:
        cur = c.execute(
            "INSERT INTO matches (label, opponent, played_at, mode, stats_json, reports_json, created_at) VALUES (?,?,?,?,?,?,?)",
            (label, opponent, now, mode, json.dumps(overview, default=str), json.dumps(reports, default=str), now),
        )
        match_id = cur.lastrowid
    return {"id": match_id, "label": label, "created_at": now}


def get_match(match_id: int) -> dict | None:
    with _conn() as c:
        row = c.execute("SELECT * FROM matches WHERE id = ?", (match_id,)).fetchone()
    if not row:
        return None
    d = dict(row)
    d["stats"] = json.loads(d.pop("stats_json") or "{}")
    d["reports"] = json.loads(d.pop("reports_json") or "{}")
    return d


def get_trends() -> dict:
    with _conn() as c:
        rows = c.execute("SELECT id, label, stats_json, created_at FROM matches ORDER BY id DESC LIMIT 10").fetchall()
    comparisons = []
    for row in rows:
        stats = json.loads(row["stats_json"] or "{}")
        for m in stats.get("matches", []):
            teams = m.get("teams", [])
            if teams:
                t = teams[0]
                comparisons.append({
                    "match_id": row["id"],
                    "label": row["label"],
                    "created_at": row["created_at"],
                    "goals": t.get("goals", 0),
                    "total_shots": t.get("total_shots", 0),
                    "total_passes": t.get("total_passes", 0),
                    "distance_covered": t.get("distance_covered", 0),
                })
                break
    return {"matches": comparisons}
