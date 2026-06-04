"""Pipeline run modes: full, halftime, live_lite."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

PipelineMode = Literal["full", "halftime", "live_lite"]


@dataclass
class PipelineConfig:
    mode: PipelineMode = "full"
    batch_size: int = 200
    snapshot_every_batches: int = 1
    max_frame: int | None = None
    skip_ocr_every_n_batches: int = 1

    @classmethod
    def from_mode(cls, mode: PipelineMode = "full") -> "PipelineConfig":
        if mode == "halftime":
            return cls(mode=mode, batch_size=200, snapshot_every_batches=1)
        if mode == "live_lite":
            return cls(mode=mode, batch_size=100, snapshot_every_batches=1, skip_ocr_every_n_batches=3)
        return cls(mode=mode)

    def effective_total_frames(self, total_frames: int) -> int:
        if self.max_frame is not None:
            return min(total_frames, self.max_frame)
        if self.mode == "halftime":
            return total_frames // 2
        return total_frames

    def should_snapshot(self, batch_index: int) -> bool:
        return batch_index % self.snapshot_every_batches == 0

    def should_run_ocr(self, batch_index: int) -> bool:
        return batch_index % self.skip_ocr_every_n_batches == 0
