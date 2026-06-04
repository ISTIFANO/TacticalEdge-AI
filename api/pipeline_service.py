"""Video upload, URL download, and background pipeline execution."""
from __future__ import annotations

import os
import shutil
import threading
import urllib.error
import urllib.request
from typing import Literal

from fastapi import HTTPException, UploadFile

from api.analytics_service import AnalyticsState
from api.live_state import LiveState

INPUT_DIR = "input_videos"
TEAM_PATH = os.path.join(INPUT_DIR, "team_match.mp4")
OPPONENT_PATH = os.path.join(INPUT_DIR, "opponent_match.mp4")

_pipeline_lock = threading.Lock()
_pipeline_running = False

VideoSlot = Literal["team", "opponent"]


def _paths() -> dict[str, str]:
    return {"team": TEAM_PATH, "opponent": OPPONENT_PATH}


def get_upload_status() -> dict:
    team_ok = os.path.isfile(TEAM_PATH) and os.path.getsize(TEAM_PATH) > 0
    opp_ok = os.path.isfile(OPPONENT_PATH) and os.path.getsize(OPPONENT_PATH) > 0
    return {
        "team_video_ready": team_ok,
        "opponent_video_ready": opp_ok,
        "team_path": TEAM_PATH,
        "opponent_path": OPPONENT_PATH,
        "pipeline_running": _pipeline_running,
        "ready_to_run": team_ok and opp_ok and not _pipeline_running,
    }


async def save_upload(file: UploadFile, slot: VideoSlot) -> str:
    if not file.filename:
        raise HTTPException(400, "Missing filename")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".mp4", ".mov", ".avi", ".mkv", ".webm"):
        raise HTTPException(400, "Video must be mp4, mov, avi, mkv, or webm")

    os.makedirs(INPUT_DIR, exist_ok=True)
    dest = _paths()[slot]
    try:
        with open(dest, "wb") as out:
            while chunk := await file.read(1024 * 1024):
                out.write(chunk)
    finally:
        await file.close()

    if os.path.getsize(dest) < 1024:
        raise HTTPException(400, "Uploaded file is too small or empty")
    return dest


def download_video_url(url: str, slot: VideoSlot) -> str:
    url = url.strip()
    if not url:
        raise HTTPException(400, "URL is empty")

    os.makedirs(INPUT_DIR, exist_ok=True)
    dest = _paths()[slot]

    try:
        if "drive.google.com" in url or "docs.google.com" in url:
            import gdown
            gdown.download(url, dest, quiet=False, fuzzy=True)
        else:
            req = urllib.request.Request(url, headers={"User-Agent": "TacticZone/1.0"})
            with urllib.request.urlopen(req, timeout=600) as resp:
                with open(dest, "wb") as out:
                    shutil.copyfileobj(resp, out)
    except Exception as e:
        raise HTTPException(400, f"Could not download video: {e}") from e

    if not os.path.isfile(dest) or os.path.getsize(dest) < 1024:
        raise HTTPException(400, "Download failed or file is too small")
    return dest


def _run_pipeline(mode: str) -> None:
    global _pipeline_running
    try:
        AnalyticsState.mark_processing()
        LiveState.reset(mode=mode if mode in ("full", "halftime", "live_lite") else "full")
        LiveState.set_phase("cv")

        from main import main as run_main

        run_main(mode=LiveState.mode)
        LiveState.set_phase("done")
        AnalyticsState.mark_ready()
    except Exception as e:
        LiveState.set_phase("idle")
        AnalyticsState.processing = False
        print(f"Pipeline failed: {e}")
    finally:
        with _pipeline_lock:
            _pipeline_running = False


def start_pipeline(mode: str = "full") -> dict:
    global _pipeline_running

    status = get_upload_status()
    if not status["team_video_ready"] or not status["opponent_video_ready"]:
        raise HTTPException(
            400,
            "Upload or provide URLs for both videos (team + opponent) before starting.",
        )

    with _pipeline_lock:
        if _pipeline_running or AnalyticsState.processing:
            raise HTTPException(409, "Pipeline is already running.")
        _pipeline_running = True

    thread = threading.Thread(target=_run_pipeline, args=(mode,), daemon=True)
    thread.start()

    return {
        "message": "Pipeline started",
        "mode": mode,
        "team_video": TEAM_PATH,
        "opponent_video": OPPONENT_PATH,
    }
