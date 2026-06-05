# Tactic Zone Analytics Dashboard

Multi-page React dashboard for Tactic Zone CV pipeline outputs, coach reports, and live monitoring.

## Prerequisites

- Node.js 18+
- Python 3.10+ with project dependencies
- Football Coach LLM: **local Ollama** or **remote ngrok** instance
- Completed pipeline run (CSVs in `output_files_*`)

## Football Coach LLM Setup

Copy [`.env.example`](../.env.example) to `.env` in `Tactic_Zone/`:

**Remote ngrok:**
```bash
COACH_LLM_PROVIDER=ngrok
COACH_LLM_BASE_URL=https://lashonda-overfoul-demandingly.ngrok-free.dev
```

**Local Ollama:**
```bash
ollama pull ALIENTELLIGENCE/footballcoachassistant
COACH_LLM_PROVIDER=ollama
COACH_LLM_BASE_URL=http://localhost:11434
```

**Auto (default):** uses `COACH_LLM_BASE_URL` if set, else `localhost:11434`.

Generate reports from existing CSVs:
```bash
cd Tactic_Zone
python run_post_processing.py --reports-only
```

## Quick Start

**Terminal 1 — API:**
```bash
cd Tactic_Zone
python api_server.py
```

**Terminal 2 — Dashboard:**
```bash
cd Tactic_Zone/dashboard
npm install
npm run dev
```

Open `http://localhost:5173`.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Overview KPIs and charts |
| `/match` … `/recommendations` | Analytics (CV + rec CSVs) |
| `/reports` | AI coach reports (generate + markdown view) |
| `/assistant` | Interactive coach chat grounded in match data |
| `/live` | Live Lite monitor during pipeline processing |
| `/tactical` | Thirds occupancy, width, compactness |
| `/timeline` | Frame scrubber + event markers on pitch SVG |

## Pipeline Modes

Send optional `mode` with `POST /process_videos`:

| Mode | Behavior |
|------|----------|
| `full` | Complete match analysis (default) |
| `halftime` | First half only + halftime brief report |
| `live_lite` | Smaller batches, skip OCR some batches, interim CSV snapshots |

CLI: `python main.py --mode halftime` (when using main.py directly).

## Production

```bash
cd dashboard && npm run build
cd .. && python api_server.py
```

Open `http://localhost:8000`.

## API Highlights

- `GET /api/reports` — load `coach_reports.json`
- `POST /api/reports/generate` — `{ "mode": "full\|halftime" }`
- `POST /api/assistant/chat` — `{ "message", "context", "video_id" }`
- `GET /api/live/snapshot` — progress + rolling stats
- `GET /api/analytics/tactical/{1\|2}`
- `GET /api/analytics/timeline/{1\|2}`
- `GET /api/matches` — match library

## Stack

React 18, TypeScript, Vite, TanStack Query, Recharts, Tailwind v4, react-markdown, Football Coach LLM (Ollama/ngrok).
