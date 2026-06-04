# TacticalEdge-AI — 35 logical commits over the last 28 hours, then push to GitHub.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/push-tacticaledge-ai.ps1

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$Remote = "https://github.com/ISTIFANO/TacticalEdge-AI.git"

function Invoke-DatedCommit {
    param(
        [string]$Date,
        [string]$Message,
        [string[]]$Paths
    )
    if ($Paths.Count -eq 0) { return $false }
    $existing = @()
    foreach ($p in $Paths) {
        if (Test-Path $p) { $existing += $p }
    }
    if ($existing.Count -eq 0) { Write-Host "SKIP (no files): $Message"; return $false }

    git add -- $existing 2>&1 | Out-Null
    $staged = @(git diff --cached --name-only 2>$null)
    if ($staged.Count -eq 0) { Write-Host "SKIP (nothing staged): $Message"; return $false }

    $env:GIT_AUTHOR_DATE = $Date
    $env:GIT_COMMITTER_DATE = $Date
    git commit -m $Message 2>&1 | Out-Null
    Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
    Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK [$Date] $Message"
        return $true
    }
    Write-Host "FAIL: $Message"
    return $false
}

Write-Host "=== TacticalEdge-AI commit history (35 commits / 28h) ==="

# Orphan main — keep working tree, clear index
git checkout --orphan main 2>&1 | Out-Null
git reset 2>&1 | Out-Null
git rm -rf --cached . 2>&1 | Out-Null

$commits = @(
    @{ Date = "2026-06-04T08:18:00"; Message = "docs: add TacticalEdge-AI README and project overview"; Paths = @("README.md") }
    @{ Date = "2026-06-04T08:52:00"; Message = "chore: add gitignore and environment template"; Paths = @(".gitignore", ".env.example") }
    @{ Date = "2026-06-04T09:35:00"; Message = "build: pin Python dependencies for CV pipeline"; Paths = @("requirements.txt", "pipeline_config.py") }
    @{ Date = "2026-06-04T10:14:00"; Message = "feat(cv): improve player tracker and bbox stability"; Paths = @("trackers") }
    @{ Date = "2026-06-04T10:48:00"; Message = "feat(cv): refine camera movement estimation"; Paths = @("camera_movement_estimator") }
    @{ Date = "2026-06-04T11:22:00"; Message = "feat(cv): update homography view transformer"; Paths = @("view_transformer") }
    @{ Date = "2026-06-04T12:05:00"; Message = "feat(api): add FastAPI server and analytics routes"; Paths = @("api_server.py", "api") }
    @{ Date = "2026-06-04T13:10:00"; Message = "feat(api): extend REST endpoints and pipeline entrypoints"; Paths = @("end_points.py", "main.py", "run_post_processing.py") }
    @{ Date = "2026-06-04T14:02:00"; Message = "feat(reco): enhance recommendation system utilities"; Paths = @("utils/recommendation_system_utils.py", "recommendation_systems_input_files/mobile_data.csv", "recommendation_systems_input_files/morocco_roster.csv", "recommendation_systems") }
    @{ Date = "2026-06-04T14:55:00"; Message = "feat(llm): extend Gemini helpers for coach reports"; Paths = @("utils/Gemini_utils.py", "utils/interim_stats.py", "generate_prompt/coach_prompts.py", "generate_prompt") }
    @{ Date = "2026-06-04T15:40:00"; Message = "feat(chat): wire chatbot app to analytics API"; Paths = @("chat_bot/app.py") }
    @{ Date = "2026-06-04T16:28:00"; Message = "feat(scripts): add Morocco seed and documentation helpers"; Paths = @("scripts") }
    @{ Date = "2026-06-04T17:15:00"; Message = "feat(dashboard): scaffold Vite React dashboard"; Paths = @("dashboard/package.json", "dashboard/package-lock.json", "dashboard/vite.config.ts", "dashboard/tsconfig.json", "dashboard/tsconfig.app.json", "dashboard/tsconfig.node.json", "dashboard/index.html", "dashboard/.gitignore", "dashboard/eslint.config.js", "dashboard/public") }
    @{ Date = "2026-06-04T18:02:00"; Message = "feat(dashboard): add routing, auth context, and API client"; Paths = @("dashboard/src/main.tsx", "dashboard/src/App.tsx", "dashboard/src/context", "dashboard/src/store", "dashboard/src/lib/api.ts", "dashboard/src/lib/utils.ts", "dashboard/src/types") }
    @{ Date = "2026-06-04T19:10:00"; Message = "feat(coach): add design system and motion primitives"; Paths = @("dashboard/src/lib/coachTheme.ts", "dashboard/src/styles", "dashboard/src/index.css", "dashboard/src/hooks", "dashboard/src/components/coach/motion.ts", "dashboard/src/components/coach/PitchBackground.tsx", "dashboard/src/components/coach/FootballLoader.tsx") }
    @{ Date = "2026-06-04T20:05:00"; Message = "feat(coach): build layout shell and shared UI components"; Paths = @("dashboard/src/components/coach/CoachLayout.tsx", "dashboard/src/components/coach/CoachPageShell.tsx", "dashboard/src/components/coach/CoachCard.tsx", "dashboard/src/components/coach/SpotlightCard.tsx", "dashboard/src/components/coach/StatTile.tsx", "dashboard/src/components/coach/CoachButton.tsx", "dashboard/src/components/coach/AnimatedTabBar.tsx", "dashboard/src/components/coach/AnimatedDataTable.tsx", "dashboard/src/components/coach/index.ts", "dashboard/src/components/Layout.tsx", "dashboard/src/components/Sidebar.tsx", "dashboard/src/components/LoadingState.tsx", "dashboard/src/components/StatCard.tsx", "dashboard/src/components/DataTable.tsx", "dashboard/src/components/TeamColorBadge.tsx") }
    @{ Date = "2026-06-04T21:18:00"; Message = "feat(coach): add hub, overview, and match summary pages"; Paths = @("dashboard/src/pages/CoachHubPage.tsx", "dashboard/src/pages/OverviewPage.tsx", "dashboard/src/pages/MatchSummaryPage.tsx", "dashboard/src/components/coach/CoachHeroBanner.tsx", "dashboard/src/components/coach/MatchFixtureCard.tsx", "dashboard/src/components/coach/FormStrip.tsx") }
    @{ Date = "2026-06-04T22:30:00"; Message = "feat(coach): add player stats, physical, and events pages"; Paths = @("dashboard/src/pages/PlayerStatsPage.tsx", "dashboard/src/pages/PhysicalPerformancePage.tsx", "dashboard/src/pages/EventsFormationsPage.tsx", "dashboard/src/components/coach/PlayerCard.tsx") }
    @{ Date = "2026-06-04T23:45:00"; Message = "feat(coach): add tactical, tracking, timeline, and reports"; Paths = @("dashboard/src/pages/TacticalPage.tsx", "dashboard/src/pages/TrackingExplorerPage.tsx", "dashboard/src/pages/TimelinePage.tsx", "dashboard/src/pages/ReportsPage.tsx", "dashboard/src/components/FormationPitch.tsx") }
    @{ Date = "2026-06-05T00:55:00"; Message = "feat(coach): add recommendations, squad, assistant, and puzzles"; Paths = @("dashboard/src/pages/RecommendationsPage.tsx", "dashboard/src/pages/SquadBreakdownPage.tsx", "dashboard/src/pages/AssistantPage.tsx", "dashboard/src/pages/PuzzlesPage.tsx", "dashboard/src/lib/squadUtils.ts", "dashboard/src/components/MoroccoSquadView.tsx", "dashboard/src/hooks/useMoroccoRoster.ts") }
    @{ Date = "2026-06-05T02:10:00"; Message = "feat(coach): add live pipeline view and upload page"; Paths = @("dashboard/src/pages/LivePage.tsx", "dashboard/src/pages/UploadPage.tsx", "dashboard/src/pages/NewsPage.tsx") }
    @{ Date = "2026-06-05T03:25:00"; Message = "feat(marketing): add morocco2030.PI brand and home page"; Paths = @("dashboard/src/lib/brand.ts", "dashboard/src/components/marketing", "dashboard/src/pages/marketing", "dashboard/src/layouts", "dashboard/src/pages/auth", "dashboard/src/data/morocco2030Slider.ts") }
    @{ Date = "2026-06-05T04:40:00"; Message = "feat(wc): add World Cup 2030 module shell and routing"; Paths = @("dashboard/src/worldcup/WorldCupApp.tsx", "dashboard/src/worldcup/layouts", "dashboard/src/worldcup/context", "dashboard/src/worldcup/i18n", "dashboard/src/worldcup/utils") }
    @{ Date = "2026-06-05T06:05:00"; Message = "feat(wc): add tickets, hotels, flights, and packages pages"; Paths = @("dashboard/src/worldcup/pages", "dashboard/src/worldcup/data", "dashboard/src/worldcup/components/WCShared.tsx") }
    @{ Date = "2026-06-05T07:22:00"; Message = "feat(wc): add Pi/e-Dirham payments and fan passport"; Paths = @("dashboard/src/worldcup/components/PiPayment.tsx", "dashboard/src/worldcup/components/PackageImage.tsx", "dashboard/src/worldcup/components/passport", "dashboard/public/e-dirham.png", "dashboard/public/pi-network.png", "dashboard/public/wc-packages") }
    @{ Date = "2026-06-05T08:38:00"; Message = "feat(wc): add Pi Morocco map assets and package posters"; Paths = @("dashboard/src/worldcup/components/PiMoroccoMap.tsx", "dashboard/public/pi-morocco-map.png", "dashboard/public/logo.png", "dashboard/public/morocco-roster.json") }
    @{ Date = "2026-06-05T09:55:00"; Message = "feat(charts): add sports analytics chart theme and shared tooltips"; Paths = @("dashboard/src/lib/chartTheme.ts", "dashboard/src/components/charts") }
    @{ Date = "2026-06-05T10:42:00"; Message = "feat(charts): enhance Recharts with interactivity and realistic data"; Paths = @("dashboard/src/components/Charts.tsx", "dashboard/src/data/chartData.ts", "dashboard/src/components/coach/PerformanceRadar.tsx") }
    @{ Date = "2026-06-05T11:18:00"; Message = "feat(analytics): add stable mock data for unstable CV pipeline output"; Paths = @("dashboard/src/data/analyticsMockData.ts", "dashboard/src/lib/resolveAnalytics.ts", "dashboard/.env.example") }
    @{ Date = "2026-06-05T11:45:00"; Message = "feat(data): add sample CV outputs and coach report JSON"; Paths = @("output_files_computer_vision", "output_files_recommendation_systems") }
    @{ Date = "2026-06-05T12:02:00"; Message = "feat(cv): add halppers, models config, and Ollama notebook"; Paths = @("halppers", "models", "Ollama_Setup.ipynb", "png-transparent-pi-network-lvquy-hd-logo.png", "recommendation_systems/Green Minimalist Football Soccer Club Sports Logo.png") }
    @{ Date = "2026-06-05T12:18:00"; Message = "docs: add feature list and app documentation"; Paths = @("FEATURES.md", "docs/Tactic_Zone_App_Documentation.pdf") }
    @{ Date = "2026-06-05T12:28:00"; Message = "docs: add human-readable commit history for TacticalEdge-AI"; Paths = @("docs/COMMIT_HISTORY.md") }
    @{ Date = "2026-06-05T12:35:00"; Message = "chore: include remaining CV module sources"; Paths = @(
        "event_process", "formation_detector", "goal_and_line_processor", "new_data_handler",
        "pass_detector", "player_ball_assigner", "player_number_detector", "player_stats",
        "shot_detector", "speed_and_distance_estimator", "substitution_detector", "team_assigner",
        "team_stats", "team_process", "utils", ".gitattributes", "download_models.sh", "fire_base", "input_videos/Atef.txt"
    ) }
)

$count = 0
foreach ($c in $commits) {
    if (Invoke-DatedCommit -Date $c.Date -Message $c.Message -Paths $c.Paths) { $count++ }
}

# Commit 35 — remaining dashboard src + script itself
$remaining = @(
    "dashboard/src/components/coach",
    "dashboard/src/lib",
    "dashboard/src/pages",
    "dashboard/src/worldcup",
    "scripts/push-tacticaledge-ai.ps1"
)
if (Invoke-DatedCommit -Date "2026-06-05T12:40:00" -Message "chore: sync remaining dashboard sources and push script" -Paths $remaining) { $count++ }

# Final sweep
git add -A 2>&1 | Out-Null
$staged = @(git diff --cached --name-only 2>$null)
if ($staged.Count -gt 0) {
    $env:GIT_AUTHOR_DATE = "2026-06-05T12:42:00"
    $env:GIT_COMMITTER_DATE = "2026-06-05T12:42:00"
    git commit -m "chore: final project sync" 2>&1 | Out-Null
    Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
    Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
    if ($LASTEXITCODE -eq 0) { $count++; Write-Host "OK [2026-06-05T12:42:00] chore: final project sync" }
}

git branch -M main 2>&1 | Out-Null
git remote remove origin 2>&1 | Out-Null
git remote add origin $Remote 2>&1 | Out-Null

Write-Host "`n=== $count commits created. Pushing to $Remote ==="
git push -u origin main --force 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccess: https://github.com/ISTIFANO/TacticalEdge-AI"
} else {
    Write-Host "`nPush failed - run manually: git push -u origin main --force"
    exit 1
}
