"""Markdown-oriented prompts for Football Coach LLM reports."""

REPORT_TITLES = {
    "match_summary": "Match Summary",
    "opponent_analysis": "Opponent Analysis",
    "lineup_recommendations": "Lineup Recommendations",
    "training_plan": "Training Plan",
    "halftime_brief": "Halftime Brief",
}


def match_summary_prompt(my_team_info_str: str, opponent_info_str: str) -> str:
    return f"""## Match Summary Request

Analyze the match using the statistics below.

**My Team:**
{my_team_info_str}

**Opponent:**
{opponent_info_str}

Write a coach report with these markdown sections:
## Executive Summary
## My Team Performance
## Opponent Performance
## Key Moments & Patterns
## Tactical Adjustments

Use bullet points and cite specific stats from the data."""


def opponent_analysis_prompt(opponent_info_str: str, opponent_players_str: str) -> str:
    return f"""## Opponent Scouting Report

**Opponent Team Stats:**
{opponent_info_str}

**Opponent Player Stats:**
{opponent_players_str}

Write a scouting report with:
## Strengths to Respect
## Weaknesses to Exploit
## Key Players to Mark
## Counter Strategies
## Set Piece Notes

Be specific and actionable for match preparation."""


def lineup_recommendations_prompt(best_formations_str: str, match_players_str: str) -> str:
    return f"""## Lineup Recommendation Request

**Historical Winning Formations:**
{best_formations_str}

**Recommended Squad:**
{match_players_str}

Write a lineup brief with:
## Recommended Formation
## Starting XI Rationale
## Substitutes & When to Use Them
## Tactical Instructions
## Risk Factors

Reference shirt numbers and positions from the data."""


def training_plan_prompt(
    my_team_players_str: str,
    my_team_info_str: str,
    opponent_analysis_text: str,
) -> str:
    return f"""## Training Plan Request

**My Team Stats:**
{my_team_info_str}

**My Squad Player Stats:**
{my_team_players_str}

**Opponent Analysis (from scouting report):**
{opponent_analysis_text}

Write a training plan with:
## Team Session (60 min outline)
## Focus Areas Based on Opponent
## Individual Drills (top 4 players by priority)
## Weekly Progression
## Match-Day Preparation Tips

Each player drill should name the shirt number and specific weakness to address."""


def halftime_brief_prompt(my_team_info_str: str, opponent_info_str: str, period: str = "first half") -> str:
    return f"""## Halftime Brief ({period})

**My Team (partial match stats):**
{my_team_info_str}

**Opponent (partial match stats):**
{opponent_info_str}

Write a concise halftime dressing-room brief with:
## 5 Talking Points
## One Tactical Fix for 2nd Half
## Substitution Suggestions
## Motivation & Focus

Keep it under 400 words — coaches read this quickly."""
