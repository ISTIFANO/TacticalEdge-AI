import cv2
import gc
import pandas as pd
import os
import warnings
import google.generativeai as genai
import json

warnings.filterwarnings("ignore", category=FutureWarning)

from utils import initialize_dataframe, initialize_team_df, read_video_in_batches, save_tracks_to_csv, install_requirements
from trackers import Tracker
from team_assigner import TeamAssigner
from camera_movement_estimator import CameraMovementEstimator
from view_transformer import ViewTransformer
from speed_and_distance_estimator import SpeedAndDistance_Estimator
from player_ball_assigner import PlayerBallAssigner
from pass_detector import PassDetector
from new_data_handler import YOLOVideoProcessor
from event_process import EventProcessor
from goal_and_line_processor import GoalAndLineProcessor
from shot_detector import ShotDetector
from player_number_detector import PlayerShirtNumberTracker
from formation_detector import FormationDetector
from substitution_detector import SubstitutionDetector
from player_stats import PlayerStats
from team_stats import SoccerMatchDataProcessorFullWithSubs
from recommendation_systems import MyPlayerStats, FirstModel, SecondModel
from utils import clean_team_color, find_closest_player_dataset, find_closest_match
from pipeline_config import PipelineConfig
from utils.interim_stats import write_interim_csvs
from api.coach_reports import run_coach_reports

def main(mode: str = "full"):
    config = PipelineConfig.from_mode(mode if mode in ("full", "halftime", "live_lite") else "full")
    print(f"Pipeline mode: {config.mode}")

    video_paths = [
        'input_videos/team_match.mp4',
        'input_videos/opponent_match.mp4',
    ]

    for video_path in video_paths:
        if not os.path.isfile(video_path):
            raise FileNotFoundError(
                f"Missing video: {video_path}\n"
                "Place 1080p+ broadcast match videos in input_videos/ or run download_sample_videos.py"
            )

    # Loop through each video
    for video_index, video_path in enumerate(video_paths):
        print(f"\n=== Processing video {video_index + 1}/{len(video_paths)}: {video_path} ===")
        # Initialize DataFrames and persistent objects for each video
        df = initialize_dataframe()  # Initialize empty DataFrame for players
        team_df = initialize_team_df()  # Initialize empty DataFrame for teams
        tracker = Tracker('models/old_data.pt')  # Initialize tracker
        team_assigner = TeamAssigner()
        
        batch_size = config.batch_size
        video_reader = cv2.VideoCapture(video_path)

        raw_total = int(video_reader.get(cv2.CAP_PROP_FRAME_COUNT))
        total_frames = config.effective_total_frames(raw_total)
        print(f"Frames: {total_frames} (of {raw_total}) | Batches of {batch_size}")
        try:
            from api.live_state import LiveState
            LiveState.total_frames = total_frames
            LiveState.current_video = video_index + 1
        except Exception:
            pass

        # Define possible formations
        possible_formations = ['4-3-3', '4-2-3-1', '4-3-2-1', '4-1-4-1', '3-5-2', '3-4-1-2', 
                               '4-4-2', '4-4-1-1', '5-4-1', '3-4-3', '4-1-2-1-2', '3-1-4-2', 
                               '3-4-2-1', '4-5-1', '4-3-1-2', '4-2-2-2', '3-5-1-1', '4-1-3-2', 
                               '5-3-2', '3-3-3-1', '4-2-4']
        i = 0
        # Loop through the video, processing batch_size frames at a time
        for start_frame in range(0, total_frames, batch_size):
            i += 1
            print(f"  Batch {i} — frames {start_frame}-{min(start_frame + batch_size, total_frames)}")
            # Read a batch of frames
            video_frames = read_video_in_batches(video_reader, start_frame, batch_size)

            # If no frames were read, break the loop
            if len(video_frames) == 0:
                break

            # Process batch: Initialize per-batch objects and perform operations
            tracks = tracker.get_object_tracks(video_frames)  # Get object tracks for batch
            tracker.add_position_to_tracks(tracks)  # Add position to tracks

            # Interpolate Ball Positions (before camera adjustment, same as end_points.py)
            tracks["ball"] = tracker.interpolate_ball_positions(tracks["ball"])

            # Camera movement estimator
            camera_movement_estimator = CameraMovementEstimator(video_frames[0])
            camera_movement_per_frame = camera_movement_estimator.get_camera_movement(video_frames)
            camera_movement_estimator.add_adjust_positions_to_tracks(tracks, camera_movement_per_frame)

            # View Transformer
            view_transformer = ViewTransformer()
            view_transformer.add_transformed_position_to_tracks(tracks)

            # Speed and Distance Estimation
            speed_and_distance_estimator = SpeedAndDistance_Estimator()
            df = speed_and_distance_estimator.update_df_with_speed_and_distance(tracks, df)

            # Team Assignment
            if i == 1:
                team_assigner.assign_team_color(video_frames[0], tracks['players'][0])
            
            for frame_num, player_track in enumerate(tracks['players']):
                for player_id, track in player_track.items():
                    team = team_assigner.get_player_team(video_frames[frame_num], track['bbox'], player_id)
                    tracks['players'][frame_num][player_id]['team'] = team
                    tracks['players'][frame_num][player_id]['team_color'] = team_assigner.team_colors[team]
                    
                    # Update DataFrame with team and team color
                    if player_id in df.index:
                        df.at[player_id, 'team'] = team
                        df.at[player_id, 'team_color'] = str(team_assigner.team_colors[team])
                    else:
                        df.loc[player_id] = {'team': team, 'team_color': str(team_assigner.team_colors[team])}

            # Ball Assignment
            player_assigner = PlayerBallAssigner()
            for frame_num, player_track in enumerate(tracks['players']):
                if frame_num < len(tracks['ball']):
                    ball_data_for_frame = tracks['ball'][frame_num]
                    if len(ball_data_for_frame) > 0 and 1 in ball_data_for_frame:
                        ball_bbox = ball_data_for_frame[1]['bbox']
                        assigned_player = player_assigner.assign_ball_to_player(player_track, ball_bbox)

                        if assigned_player != -1:
                            tracks['players'][frame_num][assigned_player]['has_ball'] = True

            # Pass Detection
            pass_detector = PassDetector(tracks, df)
            df = pass_detector.process_game_in_batches(batch_size=20)

            # YOLO Processor and Event Processing
            class_thresholds = {0: 0.8, 1: 0.7, 2: 0.3, 3: 0.1, 4: 0.7, 5: 0.6, 6: 0.85}
            yolo_processor = YOLOVideoProcessor('models/new_data.pt', class_thresholds)
            filtered_detections, detections_classes_2_and_3 = yolo_processor.process_frames_combined(video_frames)
            
            # Detect other events
            event_processor = EventProcessor(tracks, filtered_detections, df)
            df = event_processor.process_frames_in_batches()

            # Process Goal and Line Points
            processor = GoalAndLineProcessor()
            goals_and_lines_annotations = processor.get_goal_and_line_data(video_frames, detections_classes_2_and_3)

            # Detect shots, corners, saves, goals
            shot_detector = ShotDetector(tracks, df, team_df, goals_and_lines_annotations)
            df, team_df = shot_detector.process_frames_in_batches()

            # Initialize OCR
            player_number_tracker = PlayerShirtNumberTracker(video_frames, tracks, df,
                                           'models/playershirt.pt')

            # OCR: Detect player shirt numbers and update DataFrame
            df = player_number_tracker.run()

            # Initialize FormationDetector for each batch
            formation_detector = FormationDetector(tracks, possible_formations, team_df)

            # Formation Detection
            team_df = formation_detector.process_frames_in_batches()
            
            # Initialize SubstitutionDetector
            detector = SubstitutionDetector(class_thresholds, 'models/Substitution.pt', team_df)
            # Run the extraction process
            ocr_results, team_df = detector.extract_annotation(video_frames, filtered_detections, tracks)
            
            # Delete batch-specific objects and free up memory
            del video_frames, camera_movement_estimator, view_transformer, speed_and_distance_estimator
            del player_assigner, pass_detector, yolo_processor, event_processor, processor, shot_detector
            del filtered_detections, player_number_tracker, formation_detector, detector, ocr_results

            # Force garbage collection
            gc.collect()
            if config.should_snapshot(i):
                write_interim_csvs(df, team_df, video_index)
            try:
                from api.live_state import LiveState
                LiveState.update_progress(min(start_frame + batch_size, total_frames), total_frames, video_index + 1)
            except Exception:
                pass

        video_reader.release()

        # After processing all batches, fill in any missing data in DataFrames
        df = df.fillna(0)

        # Final statistics processing for teams and players
        player_stats = PlayerStats(df)
        team_1_df, team_2_df = player_stats.process_data()

        processor = SoccerMatchDataProcessorFullWithSubs(team_1_df, team_2_df, team_df)
        final_df = processor.process_match_data()

        # Save tracks and DataFrames to CSV files with unique names for each video
        output_suffix = f"_video_{video_index+1}"
        save_tracks_to_csv(tracks, csv_path=f'output_files_computer_vision/tracks_csv{output_suffix}.csv')
        df.to_csv(f'output_files_computer_vision/player_statistics{output_suffix}.csv', index=True)
        team_df.to_csv(f'output_files_computer_vision/team_statistics{output_suffix}.csv', index=True)
        team_1_df.to_csv(f'output_files_computer_vision/team_1_player_statistics{output_suffix}.csv', index=True)
        team_2_df.to_csv(f'output_files_computer_vision/team_2_player_statistics{output_suffix}.csv', index=True)
        final_df.to_csv(f'output_files_computer_vision/teams_final_statistics{output_suffix}.csv', index=True)
        print(f"Saved outputs for video {video_index + 1}")

    from run_post_processing import run_recommendations

    try:
        from api.live_state import LiveState
        LiveState.set_phase("recsys")
    except Exception:
        pass
    run_recommendations()
    try:
        from api.live_state import LiveState
        LiveState.set_phase("reports")
    except Exception:
        pass
    report_mode = "halftime" if config.mode == "halftime" else "full"
    run_coach_reports(mode=report_mode)
    print("Done.")

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', choices=['full', 'halftime', 'live_lite'], default='full')
    args = parser.parse_args()
    main(mode=args.mode)

    # Combine teams1 and teams2 into a single DataFrame
    combined_teams = pd.concat([teams1, teams2], ignore_index=True)

    # Load the data
    mobile_data1 = pd.read_csv('recommendation_systems_input_files/mobile_data.csv')
    mobile_data2 = pd.read_csv('recommendation_systems_input_files/mobile_data_2.csv')
