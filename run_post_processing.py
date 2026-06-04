"""Run recommendation systems + Football Coach LLM reports using existing CV output CSVs."""
import argparse
import os
import warnings

import pandas as pd

warnings.filterwarnings("ignore", category=FutureWarning)

from recommendation_systems import MyPlayerStats, FirstModel, SecondModel
from utils import clean_team_color, find_closest_player_dataset, find_closest_match
from api.coach_reports import run_coach_reports

REC_DIR = "output_files_recommendation_systems"


def run_recommendations():
    print("=== Recommendation systems ===")
    teams1 = pd.read_csv("output_files_computer_vision/teams_final_statistics_video_1.csv")
    teams2 = pd.read_csv("output_files_computer_vision/teams_final_statistics_video_2.csv")
    combined_teams = pd.concat([teams1, teams2], ignore_index=True)

    mobile_data1 = pd.read_csv("recommendation_systems_input_files/mobile_data.csv")
    mobile_data2 = pd.read_csv("recommendation_systems_input_files/mobile_data_2.csv")

    correct_shirt_numbers = [str(num) for num in mobile_data1["Shirt_Number"]]
    correct_shirt_numbers2 = [str(num) for num in mobile_data2["Shirt_Number"]]

    player_data_dict = {
        "player_data1": pd.read_csv("output_files_computer_vision/team_1_player_statistics_video_1.csv"),
        "player_data2": pd.read_csv("output_files_computer_vision/team_2_player_statistics_video_1.csv"),
        "player_data3": pd.read_csv("output_files_computer_vision/team_1_player_statistics_video_2.csv"),
        "player_data4": pd.read_csv("output_files_computer_vision/team_2_player_statistics_video_2.csv"),
    }

    first_team_color_mobile1 = clean_team_color(mobile_data1.iloc[0]["Team_Color "])
    first_team_color_mobile2 = clean_team_color(mobile_data2.iloc[0]["Team_Color "])

    closest_player_data_1_2 = []
    for key in ["player_data1", "player_data2"]:
        match = find_closest_player_dataset(player_data_dict[key], first_team_color_mobile1, key)
        if match:
            closest_player_data_1_2.append(player_data_dict[match])
    closest_player_data_mobile1 = MyPlayerStats(
        pd.concat(closest_player_data_1_2, ignore_index=True),
        correct_shirt_numbers,
        mobile_data1,
    ).process_data()
    closest_player_data_mobile1["shirt_number"] = closest_player_data_mobile1["corrected_shirt_number"]
    closest_player_data_mobile1.drop(columns=["corrected_shirt_number"], inplace=True)
    closest_player_data_mobile1.to_csv(f"{REC_DIR}/closest_player_data_mobile1.csv", index=False)

    # Enrich with full Morocco demo stats when roster is configured (fills sparse CV output)
    roster_path = "recommendation_systems_input_files/morocco_roster.csv"
    seed_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts", "seed_morocco_match_stats.py")
    if os.path.isfile(roster_path) and os.path.isfile(seed_script):
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location("seed_morocco_match_stats", seed_script)
            if spec and spec.loader:
                mod = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(mod)
                mod.main()
                print("Applied Morocco match stat profiles to closest_player_data_mobile1.csv")
        except Exception as exc:
            print(f"Morocco stat seed skipped: {exc}")

    closest_player_data_3_4 = []
    for key in ["player_data3", "player_data4"]:
        match = find_closest_player_dataset(player_data_dict[key], first_team_color_mobile2, key)
        if match:
            closest_player_data_3_4.append(player_data_dict[match])
    closest_player_data_mobile2 = MyPlayerStats(
        pd.concat(closest_player_data_3_4, ignore_index=True),
        correct_shirt_numbers2,
        mobile_data2,
    ).process_data()
    closest_player_data_mobile2["shirt_number"] = closest_player_data_mobile2["corrected_shirt_number"]
    closest_player_data_mobile2.drop(columns=["corrected_shirt_number"], inplace=True)
    closest_player_data_mobile2.to_csv(f"{REC_DIR}/closest_player_data_mobile2.csv", index=False)

    closest_row_team1 = find_closest_match(combined_teams, first_team_color_mobile1)
    closest_row_team2 = find_closest_match(combined_teams, first_team_color_mobile2)

    pd.DataFrame([closest_row_team1]).to_csv(f"{REC_DIR}/my_team.csv", index=False)
    pd.DataFrame([closest_row_team2]).to_csv(f"{REC_DIR}/opponent_team.csv", index=False)

    player_data = closest_player_data_mobile1.copy()
    player_data["shirt_number"] = player_data.pop("Shirt_Number")
    player_data["pass_success"] = player_data.pop("%_pass_success")
    player_data["dribbles_success"] = player_data.pop("%_dribbles_success")
    player_data["aerial_success"] = player_data.pop("%_aerial_success")
    player_data["tackles_success"] = player_data.pop("%_tackles_success")

    model1 = FirstModel(pd.DataFrame([closest_row_team1, closest_row_team2]), pd.read_csv("recommendation_systems_input_files/data_cleaned.csv"))
    recommended_formations = model1.find_winning_rows(model1.find_similar_rows())
    recommended_formations.to_csv(f"{REC_DIR}/recommended_formations.csv", index=False)

    for i in range(min(10, len(recommended_formations))):
        input_row = recommended_formations.iloc[i].to_dict()
        input_row["tackles_success"] = input_row.pop("tackle_success")
        selected_players, _ = SecondModel(input_row, player_data).recommend_team()
        if selected_players is not None:
            selected_players = selected_players.copy()
            selected_players["status"] = "Starting 11"
            remaining = player_data[~player_data["shirt_number"].isin(selected_players["shirt_number"].tolist())]
            selected_substitutes, _ = SecondModel(input_row, remaining).recommend_team()
            if selected_substitutes is not None:
                selected_substitutes = selected_substitutes.copy()
                selected_substitutes["status"] = "Substitute"
                pd.concat([selected_players, selected_substitutes], ignore_index=True).to_csv(
                    f"{REC_DIR}/combined_team.csv", index=False
                )
            else:
                selected_players.to_csv(f"{REC_DIR}/combined_team.csv", index=False)
            return

    print("Warning: could not build starting XI from player data.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--reports-only", action="store_true", help="Skip recommendations, run coach reports only")
    parser.add_argument("--recommendations-only", action="store_true", help="Run recommendations only, no reports")
    parser.add_argument("--report", choices=["all", "halftime"], default="all", help="Which reports to generate")
    parser.add_argument("--llm-only", action="store_true", help="Alias for --reports-only")
    args = parser.parse_args()

    reports_only = args.reports_only or args.llm_only
    mode = "halftime" if args.report == "halftime" else "full"

    if not reports_only:
        run_recommendations()

    if not args.recommendations_only:
        run_coach_reports(mode=mode)

    print("\nDone.")


if __name__ == "__main__":
    main()
