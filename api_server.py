"""Lightweight FastAPI server for the analytics dashboard (no YOLO/model startup)."""
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.analytics_routes import router as analytics_router
from api.analytics_service import AnalyticsState, get_videos_ready

app = FastAPI(title="Tactic Zone Analytics API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(analytics_router)

_dist = Path(__file__).parent / "dashboard" / "dist"
_news = Path(__file__).parent / "dashboard" / "public" / "news"
if _news.is_dir():
    app.mount("/news", StaticFiles(directory=str(_news)), name="news-images")
if _dist.is_dir():
    app.mount("/", StaticFiles(directory=str(_dist), html=True), name="dashboard")


@app.on_event("startup")
def on_startup():
    if get_videos_ready():
        AnalyticsState.mark_ready()


if __name__ == "__main__":
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)
