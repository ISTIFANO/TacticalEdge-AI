#!/usr/bin/env python3
"""Seed realistic match statistics for Morocco squad CSVs used by the dashboard."""
from __future__ import annotations

import csv
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROSTER = ROOT / "recommendation_systems_input_files" / "morocco_roster.csv"
REC_DIR = ROOT / "output_files_recommendation_systems"
OUT_MOBILE1 = REC_DIR / "closest_player_data_mobile1.csv"

# Per-player realistic 90-min match profile:
# (goals, assists, total_shots, sot, passes, pass_%, key_passes, dribbles_att, dribbles_won, dribble_%,
#  tackles_att, tackle_%, clearances, interceptions, aerials, aerial_%, saved_shots, distance_m, avg_speed, max_speed)
MATCH_PROFILES: dict[int, tuple] = {
    1:  (0, 0, 0, 0, 31, 83.9, 0, 0, 0, 0, 0, 0, 1, 0, 2, 100, 6, 5480, 6.2, 28.4),   # Bounou GK
    2:  (0, 1, 2, 1, 72, 90.3, 4, 5, 3, 60, 4, 75, 2, 3, 1, 50, 0, 10920, 8.9, 35.2),  # Hakimi
    3:  (0, 0, 1, 0, 58, 86.2, 2, 3, 2, 67, 3, 67, 3, 2, 2, 50, 0, 10450, 8.4, 32.8),  # Mazraoui
    4:  (0, 0, 0, 0, 52, 88.5, 1, 1, 1, 100, 3, 67, 6, 2, 5, 60, 0, 9780, 7.8, 30.1),   # Diop
    5:  (0, 0, 1, 0, 48, 85.4, 0, 0, 0, 0, 2, 50, 7, 1, 6, 67, 0, 9520, 7.6, 29.5),     # Aguerd
    6:  (0, 0, 1, 1, 78, 91.0, 3, 2, 1, 50, 5, 80, 2, 4, 3, 67, 0, 10180, 8.2, 31.4),   # Amrabat
    7:  (0, 0, 0, 0, 42, 84.8, 1, 1, 0, 0, 4, 75, 1, 3, 2, 50, 0, 8920, 7.5, 29.8),     # El Aynaoui
    8:  (1, 0, 3, 2, 86, 89.5, 5, 4, 3, 75, 3, 67, 0, 2, 1, 100, 0, 11240, 9.1, 33.6),  # Ounahi
    9:  (0, 1, 4, 2, 44, 81.8, 3, 7, 4, 57, 2, 50, 0, 1, 1, 100, 0, 9680, 8.7, 34.1),   # Abde
    10: (1, 0, 5, 3, 28, 78.6, 1, 2, 1, 50, 1, 100, 1, 0, 8, 50, 0, 9340, 8.0, 32.2),   # En-Nesyri
    11: (1, 2, 4, 2, 62, 87.1, 6, 8, 5, 62, 2, 50, 0, 1, 0, 0, 0, 9850, 8.5, 33.0),     # Brahim
    12: (0, 0, 0, 0, 12, 75.0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 100, 2, 1240, 5.1, 26.8),     # Munir (sub)
    13: (0, 0, 0, 0, 34, 82.4, 1, 2, 1, 50, 2, 50, 2, 1, 1, 100, 0, 6120, 7.2, 30.5),    # Belammari (sub)
    14: (0, 1, 2, 1, 51, 86.3, 4, 5, 3, 60, 3, 67, 0, 1, 0, 0, 0, 8740, 8.3, 32.6),     # Saibari
    15: (0, 0, 1, 0, 46, 84.8, 2, 2, 1, 50, 3, 67, 3, 2, 1, 100, 0, 10210, 8.6, 33.8),   # El Ouahdi
    16: (0, 0, 0, 0, 38, 81.6, 1, 3, 2, 67, 2, 50, 2, 1, 1, 100, 0, 7890, 7.9, 31.2),   # Salah-Eddine
    17: (0, 1, 2, 1, 74, 90.5, 4, 3, 2, 67, 4, 75, 1, 3, 2, 50, 0, 10680, 8.8, 32.4),   # El Khannouss
    18: (0, 0, 1, 0, 68, 88.2, 3, 4, 3, 75, 3, 67, 1, 2, 1, 100, 0, 10420, 8.4, 31.9),  # Bouaddi
    19: (0, 0, 3, 1, 22, 77.3, 1, 1, 0, 0, 1, 100, 0, 0, 4, 50, 0, 8560, 7.7, 31.0),    # Rahimi
    20: (0, 0, 0, 0, 44, 86.4, 0, 0, 0, 0, 2, 50, 5, 1, 4, 75, 0, 9180, 7.5, 29.2),     # Riad
    21: (0, 0, 0, 0, 36, 83.3, 0, 0, 0, 0, 2, 50, 4, 1, 3, 67, 0, 8420, 7.3, 28.9),     # Halhal
    22: (2, 0, 6, 4, 24, 79.2, 2, 1, 1, 100, 0, 0, 0, 0, 7, 57, 0, 9120, 7.9, 32.5),    # El Kaabi
    23: (0, 0, 0, 0, 8, 62.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 680, 4.8, 25.5),         # Tagnaouti (sub)
    24: (0, 0, 2, 1, 35, 80.0, 2, 4, 2, 50, 1, 100, 0, 0, 0, 0, 0, 7980, 8.2, 33.2),    # Ben Seghir
    25: (0, 1, 3, 2, 41, 82.9, 3, 6, 4, 67, 2, 50, 0, 1, 1, 100, 0, 9240, 8.6, 34.0),   # Talbi
    26: (0, 0, 0, 0, 29, 79.3, 1, 1, 1, 100, 3, 67, 1, 2, 2, 50, 0, 7680, 7.4, 29.6),   # El Mourabet
}

COLUMNS = [
    "position", "goals", "assists", "total_shots", "shots_on_target", "shots_off_target",
    "blocked_shots", "saved_shots", "total_passes", "accurate_passes", "%_pass_success",
    "key_passes", "dribbles_attempted", "dribbles", "%_dribbles_success", "dribbles_past",
    "aerial_duels", "%_aerial_success", "offensive_aerials", "defensive_aerials",
    "tackles_attempted", "tackles_won", "%_tackles_success", "clearances", "interceptions",
    "injuries", "distance_covered", "avg_speed", "highest_speed", "Shirt_Number", "shirt_number",
]


def build_row(shirt: int, position: str, p: tuple) -> dict:
    (
        goals, assists, shots, sot, passes, pass_pct, key_p, drib_att, drib_won, drib_pct,
        tack_att, tack_pct, clearances, interceptions, aerials, aerial_pct, saves,
        distance, avg_spd, max_spd,
    ) = p

    accurate = round(passes * pass_pct / 100)
    off_target = max(0, shots - sot)
    blocked = 0
    tack_won = round(tack_att * tack_pct / 100) if tack_att else 0
    off_aerial = aerials // 2
    def_aerial = aerials - off_aerial

    return {
        "position": position,
        "goals": float(goals),
        "assists": float(assists),
        "total_shots": float(shots),
        "shots_on_target": float(sot),
        "shots_off_target": float(off_target),
        "blocked_shots": float(blocked),
        "saved_shots": float(saves),
        "total_passes": float(passes),
        "accurate_passes": float(accurate),
        "%_pass_success": round(pass_pct, 1),
        "key_passes": float(key_p),
        "dribbles_attempted": int(drib_att),
        "dribbles": int(drib_won),
        "%_dribbles_success": int(drib_pct),
        "dribbles_past": int(max(0, drib_att - drib_won)),
        "aerial_duels": int(aerials),
        "%_aerial_success": int(aerial_pct),
        "offensive_aerials": int(off_aerial),
        "defensive_aerials": int(def_aerial),
        "tackles_attempted": int(tack_att),
        "tackles_won": int(tack_won),
        "%_tackles_success": int(tack_pct),
        "clearances": float(clearances),
        "interceptions": float(interceptions),
        "injuries": 0,
        "distance_covered": round(distance, 1),
        "avg_speed": round(avg_spd, 1),
        "highest_speed": round(max_spd, 1),
        "Shirt_Number": shirt,
        "shirt_number": shirt,
    }


def main() -> None:
    REC_DIR.mkdir(parents=True, exist_ok=True)
    rows: list[dict] = []

    with open(ROSTER, newline="", encoding="utf-8") as f:
        roster = list(csv.DictReader(f))

    for player in roster:
        shirt = int(player["Shirt_Number"])
        position = player["Position"]
        profile = MATCH_PROFILES.get(shirt)
        if not profile:
            print(f"Warning: no profile for #{shirt} {player['Player_Name']}")
            continue
        rows.append(build_row(shirt, position, profile))

    rows.sort(key=lambda r: r["shirt_number"])

    with open(OUT_MOBILE1, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} players -> {OUT_MOBILE1}")

    # Starting XI + subs for recommendations page
    starters = [1, 2, 3, 4, 5, 6, 8, 11, 15, 17, 22]
    combined_path = REC_DIR / "combined_team.csv"
    import pandas as pd

    df_start = pd.DataFrame([r for r in rows if r["shirt_number"] in starters])
    df_start["status"] = "Starting 11"
    df_sub = pd.DataFrame([r for r in rows if r["shirt_number"] not in starters][:7])
    df_sub["status"] = "Substitute"
    pd.concat([df_start, df_sub], ignore_index=True).to_csv(combined_path, index=False)
    print(f"Updated {combined_path}")


if __name__ == "__main__":
    main()
