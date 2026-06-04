"""Interim CSV checkpoint during batch processing."""
from __future__ import annotations

import os

from player_stats import PlayerStats
from team_stats import SoccerMatchDataProcessorFullWithSubs


def write_interim_csvs(
    df,
    team_df,
    video_index: int,
    output_dir: str = "output_files_computer_vision",
) -> None:
    """Write partial stats so dashboard can poll live updates."""
    os.makedirs(output_dir, exist_ok=True)
    suffix = f"_video_{video_index + 1}"
    df_filled = df.fillna(0)
    try:
        player_stats = PlayerStats(df_filled)
        team_1_df, team_2_df = player_stats.process_data()
        processor = SoccerMatchDataProcessorFullWithSubs(team_1_df, team_2_df, team_df)
        final_df = processor.process_match_data()
        df_filled.to_csv(f"{output_dir}/player_statistics{suffix}.csv", index=True)
        team_df.to_csv(f"{output_dir}/team_statistics{suffix}.csv", index=True)
        team_1_df.to_csv(f"{output_dir}/team_1_player_statistics{suffix}.csv", index=True)
        team_2_df.to_csv(f"{output_dir}/team_2_player_statistics{suffix}.csv", index=True)
        final_df.to_csv(f"{output_dir}/teams_final_statistics{suffix}.csv", index=True)
    except Exception as e:
        print(f"Interim stats write skipped: {e}")
