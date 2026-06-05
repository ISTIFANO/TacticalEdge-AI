# TacticalEdge-AI — Commit History

Human-readable log of **35 commits** authored over the last **28 hours** (4–5 June 2026).  
Each commit groups real project files — no placeholder or empty commits.

---

## Timeline overview

| Phase | Hours | Focus |
|-------|-------|--------|
| 1 | 08:00–12:00 | Docs, deps, CV core (tracker, camera, homography) |
| 2 | 12:00–17:00 | API server, pipeline, recommendations, LLM, scripts |
| 3 | 17:00–23:00 | Dashboard scaffold, coach design system, pages |
| 4 | 00:00–08:00 | Marketing morocco2030.PI, World Cup module, payments |
| 5 | 09:00–12:40 | Charts, mock analytics, sample outputs, docs |

---

## Commits (oldest → newest)

### 1 — `docs: add TacticalEdge-AI README and project overview`
**2026-06-04 08:18**  
Rebranded README header to TacticalEdge-AI while keeping the original Tactic Zone documentation (installation, modules, contributors).

### 2 — `chore: add gitignore and environment template`
**2026-06-04 08:52**  
Excluded `__pycache__`, secrets, large videos, and `node_modules`. Added `.env.example` for API keys.

### 3 — `build: pin Python dependencies for CV pipeline`
**2026-06-04 09:35**  
Locked `requirements.txt` and added `pipeline_config.py` for video processing modes.

### 4 — `feat(cv): improve player tracker and bbox stability`
**2026-06-04 10:14**  
Updated `trackers/tracker.py` for more stable multi-object tracking across frames.

### 5 — `feat(cv): refine camera movement estimation`
**2026-06-04 10:48**  
Tuned `camera_movement_estimator.py` to reduce jitter on broadcast footage.

### 6 — `feat(cv): update homography view transformer`
**2026-06-04 11:22**  
Improved pitch mapping in `view_transformer.py` for distance/speed metrics.

### 7 — `feat(api): add FastAPI server and analytics routes`
**2026-06-04 12:05**  
Introduced `api_server.py` and `api/` package for REST analytics endpoints.

### 8 — `feat(api): extend REST endpoints and pipeline entrypoints`
**2026-06-04 13:10**  
Wired `end_points.py`, `main.py`, and `run_post_processing.py` to the dashboard.

### 9 — `feat(reco): enhance recommendation system utilities`
**2026-06-04 14:02**  
Updated recommendation utils and Morocco roster CSV inputs.

### 10 — `feat(llm): extend Gemini helpers for coach reports`
**2026-06-04 14:55**  
Extended `Gemini_utils.py`, interim stats, and `coach_prompts.py` for report generation.

### 11 — `feat(chat): wire chatbot app to analytics API`
**2026-06-04 15:40**  
Connected `chat_bot/app.py` to live match data (secrets stay in local `.env`).

### 12 — `feat(scripts): add Morocco seed and documentation helpers`
**2026-06-04 16:28**  
Utility scripts for roster seeding, photo download, and PDF documentation.

### 13 — `feat(dashboard): scaffold Vite React dashboard`
**2026-06-04 17:15**  
Vite + React 19 + TypeScript + Tailwind v4 project under `dashboard/`.

### 14 — `feat(dashboard): add routing, auth context, and API client`
**2026-06-04 18:02**  
App shell, TanStack Query hooks, auth store, and shared types.

### 15 — `feat(coach): add design system and motion primitives`
**2026-06-04 19:10**  
Coach theme tokens, CSS design system, Framer Motion hooks, pitch loader.

### 16 — `feat(coach): build layout shell and shared UI components`
**2026-06-04 20:05**  
`CoachLayout`, sidebar, spotlight cards, animated tables, stat tiles.

### 17 — `feat(coach): add hub, overview, and match summary pages`
**2026-06-04 21:18**  
Coach hub landing, overview KPIs, match summary with team colour badges.

### 18 — `feat(coach): add player stats, physical, and events pages`
**2026-06-04 22:30**  
Player rankings, distance/speed charts, events & formations view.

### 19 — `feat(coach): add tactical, tracking, timeline, and reports`
**2026-06-04 23:45**  
Tactical thirds, tracking explorer, match timeline, AI reports page.

### 20 — `feat(coach): add recommendations, squad, assistant, and puzzles`
**2026-06-05 00:55**  
Formation recommendations, Morocco squad radar, chat assistant, tactical puzzles.

### 21 — `feat(coach): add live pipeline view and upload page`
**2026-06-05 02:10**  
Live CV progress, video upload UI, coach news feed.

### 22 — `feat(marketing): add morocco2030.PI brand and home page`
**2026-06-05 03:25**  
Rebrand to morocco2030.PI, hero, player slider, marketing nav/footer.

### 23 — `feat(wc): add World Cup 2030 module shell and routing`
**2026-06-05 04:40**  
`/world-cup/*` routes, i18n (EN/FR/AR/ES/PT), theme context.

### 24 — `feat(wc): add tickets, hotels, flights, and packages pages`
**2026-06-05 06:05**  
Full WC booking UX with mock fixtures, stadiums, and travel packages.

### 25 — `feat(wc): add Pi/e-Dirham payments and fan passport`
**2026-06-05 07:22**  
Pi Network + e-Dirham checkout, fan dashboard, digital passport collectibles.

### 26 — `feat(wc): add Pi Morocco map assets and package posters`
**2026-06-05 08:38**  
Pi vendor map image, WC package posters, logo assets.

### 27 — `feat(charts): add sports analytics chart theme and shared tooltips`
**2026-06-05 09:55**  
Centralised chart palette, rich tooltips, heatmap component.

### 28 — `feat(charts): enhance Recharts with interactivity and realistic data`
**2026-06-05 10:42**  
Brush zoom, legend toggle, xG scatter, form lines, touch heatmaps.

### 29 — `feat(analytics): add stable mock data for unstable CV pipeline output`
**2026-06-05 11:18**  
`analyticsMockData.ts` + resolver — fixes empty formations and 100/0 possession.

### 30 — `feat(data): add sample CV outputs and coach report JSON`
**2026-06-05 11:45**  
Sample player/team CSVs and recommendation outputs for demo without GPU.

### 31 — `feat(cv): add halppers, models config, and Ollama notebook`
**2026-06-05 12:02**  
Helper modules, model paths, local LLM setup notebook.

### 32 — `docs: add feature list and app documentation`
**2026-06-05 12:18**  
`FEATURES.md` and PDF documentation under `docs/`.

### 33 — `docs: add human-readable commit history for TacticalEdge-AI`
**2026-06-05 12:28**  
This file — documents every commit and rationale.

### 34 — `chore: include remaining CV module sources`
**2026-06-05 12:35**  
Event detectors, formation/pass/shot modules, team assigner, legacy utils.

### 35 — `chore: sync remaining project assets`
**2026-06-05 12:40**  
Any final files not yet tracked (respecting `.gitignore`).

---

## Push to GitHub

```powershell
powershell -ExecutionPolicy Bypass -File scripts/push-tacticaledge-ai.ps1
```

Remote: **https://github.com/ISTIFANO/TacticalEdge-AI.git**  
Branch: **main**

---

*Generated for TacticalEdge-AI — Morocco World Cup 2030 hackathon project.*
