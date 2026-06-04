"""Live pipeline state for incremental dashboard updates."""
from __future__ import annotations

from api.analytics_service import AnalyticsState


class LiveState:
    frames_processed: int = 0
    total_frames: int = 0
    current_video: int = 1
    phase: str = "idle"  # idle | cv | recsys | reports | done
    progress_pct: float = 0.0
    partial_ready: bool = False
    mode: str = "full"

    @classmethod
    def reset(cls, mode: str = "full") -> None:
        cls.frames_processed = 0
        cls.total_frames = 0
        cls.current_video = 1
        cls.phase = "cv"
        cls.progress_pct = 0.0
        cls.partial_ready = False
        cls.mode = mode

    @classmethod
    def update_progress(cls, frames_done: int, total: int, video: int = 1) -> None:
        cls.frames_processed = frames_done
        cls.total_frames = total
        cls.current_video = video
        cls.progress_pct = round(min(100.0, (frames_done / total * 100) if total else 0), 1)
        cls.partial_ready = True

    @classmethod
    def set_phase(cls, phase: str) -> None:
        cls.phase = phase

    @classmethod
    def to_dict(cls) -> dict:
        return {
            "frames_processed": cls.frames_processed,
            "total_frames": cls.total_frames,
            "current_video": cls.current_video,
            "phase": cls.phase,
            "progress_pct": cls.progress_pct,
            "partial_ready": cls.partial_ready,
            "mode": cls.mode,
            "processing": AnalyticsState.processing,
            "analytics_ready": AnalyticsState.analytics_ready,
            "last_updated": AnalyticsState.last_updated,
        }
