from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from pydantic import BaseModel

from api.analytics_service import (
    AnalyticsState,
    get_match_summary,
    get_overview,
    get_players,
    get_recommendations_compare,
    get_recommendations_formations,
    get_recommendations_lineup,
    get_recommendations_squads,
    get_recommendations_teams,
    get_squad,
    get_status,
    get_tracking,
    get_tracking_heatmap,
)
from api.assistant_service import chat, clear_history, get_history, SUGGESTED_PROMPTS
from api.coach_llm_service import complete_with_retry, _resolve_base_url
from api.coach_reports import get_report, load_reports, run_coach_reports
from api.live_state import LiveState
from api.match_library import get_match, get_trends, list_matches, save_snapshot
from api.tactical_service import get_tactical_analysis, get_timeline_events
from api.gamification_service import (
    generate_puzzle,
    get_profile,
    list_categories,
    submit_answer,
)
from api.news_service import get_article, list_articles
from api.pipeline_service import (
    download_video_url,
    get_upload_status,
    save_upload,
    start_pipeline,
)

router = APIRouter(prefix="/api", tags=["analytics"])


class GenerateReportsBody(BaseModel):
    reports: list[str] = ["all"]
    mode: str = "full"


class ChatBody(BaseModel):
    message: str
    context: str = "match"
    video_id: int = 1


class SaveMatchBody(BaseModel):
    label: str
    opponent: str = ""
    mode: str = "full"


class PuzzleSubmitBody(BaseModel):
    puzzle_id: str
    answer: str


@router.get("/status")
def api_status():
    status = get_status()
    status["live"] = LiveState.to_dict()
    return status


@router.get("/live/snapshot")
def api_live_snapshot():
    overview = {}
    try:
        overview = get_overview()
    except Exception:
        pass
    return {
        "live": LiveState.to_dict(),
        "status": get_status(),
        "overview_summary": overview,
    }


@router.get("/analytics/overview")
def api_overview():
    return get_overview()


@router.get("/analytics/matches/{video_id}")
def api_match(video_id: int):
    if video_id not in (1, 2):
        raise HTTPException(400, "video_id must be 1 or 2")
    return get_match_summary(video_id)


@router.get("/analytics/players/{video_id}")
def api_players(
    video_id: int,
    team: int | None = Query(None),
    min_distance: float = Query(0),
):
    if video_id not in (1, 2):
        raise HTTPException(400, "video_id must be 1 or 2")
    return get_players(video_id, team=team, min_distance=min_distance)


@router.get("/analytics/squads/{video_id}/{team_id}")
def api_squad(video_id: int, team_id: int):
    if video_id not in (1, 2) or team_id not in (1, 2):
        raise HTTPException(400, "video_id and team_id must be 1 or 2")
    return get_squad(video_id, team_id)


@router.get("/analytics/tracking/{video_id}")
def api_tracking(
    video_id: int,
    frame: int | None = Query(None),
    class_label: str | None = Query(None),
    limit: int = Query(500, le=2000),
    offset: int = Query(0, ge=0),
):
    if video_id not in (1, 2):
        raise HTTPException(400, "video_id must be 1 or 2")
    return get_tracking(video_id, frame=frame, class_label=class_label, limit=limit, offset=offset)


@router.get("/analytics/tracking/{video_id}/heatmap")
def api_heatmap(video_id: int, sample_every: int = Query(10, ge=1, le=100)):
    if video_id not in (1, 2):
        raise HTTPException(400, "video_id must be 1 or 2")
    return get_tracking_heatmap(video_id, sample_every=sample_every)


@router.get("/analytics/tactical/{video_id}")
def api_tactical(video_id: int):
    if video_id not in (1, 2):
        raise HTTPException(400, "video_id must be 1 or 2")
    return get_tactical_analysis(video_id)


@router.get("/analytics/timeline/{video_id}")
def api_timeline(video_id: int):
    if video_id not in (1, 2):
        raise HTTPException(400, "video_id must be 1 or 2")
    return get_timeline_events(video_id)


@router.get("/recommendations/formations")
def api_rec_formations():
    return get_recommendations_formations()


@router.get("/recommendations/lineup")
def api_rec_lineup():
    return get_recommendations_lineup()


@router.get("/recommendations/teams")
def api_rec_teams():
    return get_recommendations_teams()


@router.get("/recommendations/squads")
def api_rec_squads():
    return get_recommendations_squads()


@router.get("/recommendations/compare")
def api_rec_compare():
    return get_recommendations_compare()


@router.get("/reports")
def api_reports():
    return load_reports()


@router.get("/reports/{report_id}")
def api_report(report_id: str):
    report = get_report(report_id)
    if not report:
        raise HTTPException(404, f"Report '{report_id}' not found")
    return report


@router.post("/reports/generate")
def api_generate_reports(body: GenerateReportsBody):
    report_ids = None
    if body.reports != ["all"]:
        report_ids = body.reports
    mode = body.mode if body.mode in ("full", "halftime") else "full"
    try:
        return run_coach_reports(mode=mode, report_ids=report_ids)
    except Exception as e:
        raise HTTPException(500, str(e)) from e


@router.get("/assistant/health")
def api_assistant_health():
    base = _resolve_base_url()
    try:
        result = complete_with_retry("Reply with exactly: Coach online.", max_tokens=10, max_retries=1)
        return {
            "ok": bool(result and result.get("text")),
            "base_url": base,
            "model": result.get("model") if result else None,
            "sample": (result or {}).get("text", "")[:100],
        }
    except Exception as e:
        return {"ok": False, "base_url": base, "error": str(e)}


@router.post("/assistant/chat")
def api_assistant_chat(body: ChatBody):
    if not body.message.strip():
        raise HTTPException(400, "message is required")
    return chat(body.message, context=body.context, video_id=body.video_id)


@router.get("/assistant/history")
def api_assistant_history():
    return {"history": get_history(), "suggested_prompts": SUGGESTED_PROMPTS}


@router.delete("/assistant/history")
def api_clear_history():
    clear_history()
    return {"ok": True}


@router.get("/matches")
def api_matches_list():
    return {"matches": list_matches()}


@router.post("/matches/snapshot")
def api_matches_snapshot(body: SaveMatchBody):
    return save_snapshot(body.label, body.opponent, body.mode)


@router.get("/matches/trends")
def api_matches_trends():
    return get_trends()


@router.get("/matches/{match_id}")
def api_match_detail(match_id: int):
    m = get_match(match_id)
    if not m:
        raise HTTPException(404, "Match not found")
    return m


@router.get("/gamification/profile")
def api_gamification_profile():
    return get_profile()


@router.get("/gamification/categories")
def api_gamification_categories():
    return {"categories": list_categories()}


@router.get("/gamification/puzzle")
def api_gamification_puzzle(
    video_id: int = Query(1),
    category: str | None = Query(None),
    difficulty: str | None = Query(None),
):
    if video_id not in (1, 2):
        raise HTTPException(400, "video_id must be 1 or 2")
    return generate_puzzle(video_id, category, difficulty)


@router.post("/gamification/puzzle/submit")
def api_gamification_submit(body: PuzzleSubmitBody):
    try:
        return submit_answer(body.puzzle_id, body.answer)
    except LookupError as e:
        raise HTTPException(404, str(e)) from e
    except ValueError as e:
        raise HTTPException(400, str(e)) from e


@router.get("/news")
def api_news_list():
    return {"articles": list_articles()}


@router.get("/news/{article_id}")
def api_news_article(article_id: str):
    article = get_article(article_id)
    if not article:
        raise HTTPException(404, "Article not found")
    return article


@router.get("/pipeline/status")
def api_pipeline_status():
    return get_upload_status()


@router.post("/pipeline/upload")
async def api_pipeline_upload(
    team_video: UploadFile = File(...),
    opponent_video: UploadFile = File(...),
):
    team_path = await save_upload(team_video, "team")
    opp_path = await save_upload(opponent_video, "opponent")
    return {
        "message": "Videos uploaded",
        "team_path": team_path,
        "opponent_path": opp_path,
        **get_upload_status(),
    }


class PipelineUrlBody(BaseModel):
    team_url: str
    opponent_url: str
    mode: str = "full"


@router.post("/pipeline/download-urls")
def api_pipeline_download_urls(body: PipelineUrlBody):
    download_video_url(body.team_url, "team")
    download_video_url(body.opponent_url, "opponent")
    return {"message": "Videos downloaded", **get_upload_status()}


class PipelineStartBody(BaseModel):
    mode: str = "full"
    team_url: str | None = None
    opponent_url: str | None = None


@router.post("/pipeline/start")
def api_pipeline_start(body: PipelineStartBody):
    if body.team_url:
        download_video_url(body.team_url, "team")
    if body.opponent_url:
        download_video_url(body.opponent_url, "opponent")
    return start_pipeline(body.mode)


def mark_analytics_ready():
    AnalyticsState.mark_ready()
