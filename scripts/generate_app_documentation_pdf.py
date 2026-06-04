#!/usr/bin/env python3
"""Generate Tactic Zone + World Cup 2030 application documentation PDF."""

from pathlib import Path
from fpdf import FPDF

OUT = Path(__file__).resolve().parent.parent / "docs" / "Tactic_Zone_App_Documentation.pdf"


class DocPDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "Tactic Zone & FIFA World Cup 2030 - Application Documentation", align="C")
        self.ln(4)
        self.set_text_color(0, 0, 0)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def section_title(self, title: str):
        self.ln(4)
        self.set_font("Helvetica", "B", 14)
        self.set_fill_color(26, 60, 46)
        self.set_text_color(255, 255, 255)
        self.cell(0, 10, f"  {title}", ln=True, fill=True)
        self.set_text_color(0, 0, 0)
        self.ln(2)

    def sub_title(self, title: str):
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(26, 60, 46)
        self.cell(0, 7, title, ln=True)
        self.set_text_color(0, 0, 0)

    def body(self, text: str):
        self.set_font("Helvetica", "", 9)
        self.multi_cell(0, 5, text)
        self.ln(1)

    def bullet(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 9)
        self.multi_cell(0, 5, f"  - {text}")

    def table(self, headers: list[str], rows: list[list[str]], col_widths: list[int] | None = None):
        if not col_widths:
            w = 190 // len(headers)
            col_widths = [w] * len(headers)
        self.set_font("Helvetica", "B", 8)
        self.set_fill_color(220, 230, 220)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, h, border=1, fill=True)
        self.ln()
        self.set_font("Helvetica", "", 7)
        fill = False
        for row in rows:
            if self.get_y() > 270:
                self.add_page()
            self.set_x(self.l_margin)
            max_h = 7
            for i, cell in enumerate(row):
                self.cell(col_widths[i], max_h, cell[:80], border=1, fill=fill)
            self.ln()
            fill = not fill
        self.ln(2)


def build():
    pdf = DocPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # Cover
    pdf.ln(30)
    pdf.set_font("Helvetica", "B", 28)
    pdf.set_text_color(26, 60, 46)
    pdf.cell(0, 15, "Tactic Zone", ln=True, align="C")
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "Application Documentation", ln=True, align="C")
    pdf.ln(8)
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 8, "Fields, Features, Roles & Data Structures", ln=True, align="C")
    pdf.ln(20)
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 6, (
        "This document describes all modules of the Tactic Zone platform:\n"
        "  1. Tactic Zone Analytics (coaching dashboard)\n"
        "  2. FIFA World Cup 2030 portal (bookings, Pi payments, Fan Passport)\n"
        "  3. Backend API and CSV data pipeline\n\n"
        "Includes form fields, user roles, feature matrices, and demo credentials."
    ), align="C")
    pdf.set_text_color(0, 0, 0)

    # --- 1. Global ---
    pdf.add_page()
    pdf.section_title("1. Global Features Overview")
    pdf.body(
        "The platform combines football analytics (computer vision + AI coaching) with a "
        "FIFA World Cup 2030 fan experience (hotels, flights, tickets, Pi Network payments, "
        "and NFT-inspired Fan Passport collectibles)."
    )
    pdf.table(
        ["Feature", "Module", "Description"],
        [
            ["Marketing site", "Main", "Landing, About, pricing, testimonials"],
            ["Client-side auth", "Main + WC", "Demo users + localStorage; no server auth"],
            ["Match analytics", "Main", "15+ pages backed by CV CSV pipeline"],
            ["Video upload pipeline", "Main", "Upload files/URLs -> CV + recommendations + reports"],
            ["AI Coach Assistant", "Main", "LLM chat grounded in match context"],
            ["Coach Reports", "Main", "5 report types; full/halftime modes"],
            ["Tactical Puzzles + XP", "Main", "Gamification with levels and accuracy"],
            ["Live pipeline monitor", "Main", "Real-time CV progress"],
            ["World Cup 2030 portal", "WC", "Hotels, flights, tickets, packages, teams"],
            ["Pi Network payments", "WC", "USD or Pi checkout (demo wallet)"],
            ["Fan Passport", "WC", "Auto-mint collectibles from bookings"],
            ["i18n + theme", "WC", "EN/FR/AR/ES/PT; dark/light mode"],
        ],
        [45, 25, 120],
    )

    # --- 2. Main App Roles ---
    pdf.add_page()
    pdf.section_title("2. Tactic Zone Main App")
    pdf.sub_title("2.1 User Roles")
    pdf.table(
        ["Role", "Access", "Notes"],
        [
            ["admin", "Full dashboard", "Demo account; identity label only"],
            ["coach", "Full dashboard", "Default for new registrations"],
            ["analyst", "Full dashboard", "Demo account; same access as admin/coach"],
            ["Guest", "Marketing + auth pages", "No /app or /coach access"],
        ],
        [30, 45, 115],
    )
    pdf.body("Note: All three logged-in roles see identical navigation. ProtectedRoute only checks login status.")

    pdf.sub_title("2.2 User Model Fields")
    pdf.table(
        ["Field", "Type", "Description"],
        [
            ["email", "string", "Login identifier"],
            ["name", "string", "Display name"],
            ["club", "string", "Club/team affiliation"],
            ["role", "enum", "admin | coach | analyst"],
            ["country", "string", "Optional user country"],
            ["coachingLevel", "string", "Grassroots to International"],
        ],
        [40, 30, 120],
    )

    pdf.sub_title("2.3 Routes")
    pdf.table(
        ["Route", "Page", "Auth"],
        [
            ["/", "HomePage", "Public"],
            ["/about", "AboutPage", "Public"],
            ["/login", "LoginPage", "Public"],
            ["/register", "RegisterPage", "Public"],
            ["/forgot-password", "ForgotPasswordPage", "Public"],
            ["/reset-password", "ResetPasswordPage", "Public"],
            ["/coach", "CoachHubPage", "Protected"],
            ["/app", "OverviewPage", "Protected"],
            ["/app/match", "MatchSummaryPage", "Protected"],
            ["/app/players", "PlayerStatsPage", "Protected"],
            ["/app/squads", "SquadBreakdownPage", "Protected"],
            ["/app/physical", "PhysicalPerformancePage", "Protected"],
            ["/app/events", "EventsFormationsPage", "Protected"],
            ["/app/tracking", "TrackingExplorerPage", "Protected"],
            ["/app/recommendations", "RecommendationsPage", "Protected"],
            ["/app/reports", "ReportsPage", "Protected"],
            ["/app/assistant", "AssistantPage", "Protected"],
            ["/app/puzzles", "PuzzlesPage", "Protected"],
            ["/app/upload", "UploadPage", "Protected"],
            ["/app/news", "NewsPage", "Protected"],
            ["/app/live", "LivePage", "Protected"],
            ["/app/tactical", "TacticalPage", "Protected"],
            ["/app/timeline", "TimelinePage", "Protected"],
            ["/world-cup/*", "WorldCupApp", "Separate WC auth"],
        ],
        [55, 55, 30],
    )

    # --- 3. Main App Forms ---
    pdf.add_page()
    pdf.section_title("3. Tactic Zone - Form Fields")
    pdf.sub_title("3.1 Authentication Forms")
    pdf.table(
        ["Form", "Field", "Type", "Validation"],
        [
            ["Login", "Email", "email", "Required"],
            ["Login", "Password", "password", "Required"],
            ["Register", "Full Name", "text", "Required"],
            ["Register", "Club / Team Name", "text", "Required"],
            ["Register", "Email", "email", "Required, unique"],
            ["Register", "Password", "password", "Min 8 characters"],
            ["Register", "Confirm Password", "password", "Must match"],
            ["Register", "Country", "select", "Morocco, France, Spain, UK, USA, Brazil, Other"],
            ["Register", "Coaching Level", "select", "Grassroots, Academy, Semi-Pro, Pro, International"],
            ["Forgot Password", "Email", "email", "Must exist in user store"],
            ["Reset Password", "New Password", "password", "Min 8 characters"],
            ["Reset Password", "Confirm Password", "password", "Must match"],
        ],
        [35, 45, 25, 85],
    )

    pdf.sub_title("3.2 Functional Forms & Controls")
    pdf.table(
        ["Page", "Field", "Type", "API / Notes"],
        [
            ["Upload", "Team video file", "file", "team_video multipart"],
            ["Upload", "Opponent video file", "file", "opponent_video multipart"],
            ["Upload", "Team video URL", "url", "team_url"],
            ["Upload", "Opponent video URL", "url", "opponent_url"],
            ["Upload", "Pipeline mode", "select", "full | halftime | live_lite"],
            ["Reports", "Report mode", "select", "full | halftime"],
            ["Assistant", "Context", "buttons", "match, opponent, both, training, tactical"],
            ["Assistant", "Message", "text", "POST /api/assistant/chat"],
            ["Puzzles", "Category", "select", "From API categories"],
            ["Puzzles", "Difficulty", "select", "Easy, Medium, Hard, Elite"],
            ["Puzzles", "Answer", "A/B/C/D", "POST puzzle/submit"],
            ["Player Stats", "Team filter", "select", "team: 1 or 2"],
            ["Player Stats", "Min distance", "number", "min_distance filter"],
            ["Tracking", "Frame", "range", "frame index"],
            ["Tracking", "Class", "select", "player | ball"],
            ["Header", "Match selector", "buttons", "video_id: 1, 2, or both"],
        ],
        [35, 45, 25, 85],
    )

    # --- 4. WC Module ---
    pdf.add_page()
    pdf.section_title("4. World Cup 2030 Module")
    pdf.sub_title("4.1 User Roles")
    pdf.table(
        ["Role", "Dashboard", "Special Access"],
        [
            ["fan", "FanDashboard", "Passport, favorites, donations, preferred team"],
            ["hotel_manager", "HotelManagerDashboard", "Listings, rooms, pricing (UI)"],
            ["travel_agency", "AgencyDashboard", "Packages, tours, offers (UI)"],
            ["admin", "AdminDashboard", "Passport admin, QR validation, analytics"],
        ],
        [40, 55, 95],
    )

    pdf.sub_title("4.2 WC User Model Fields")
    pdf.table(
        ["Field", "Type", "Description"],
        [
            ["email", "string", "Login identifier"],
            ["name", "string", "Display name"],
            ["role", "enum", "fan | hotel_manager | travel_agency | admin"],
            ["country", "string", "Default Morocco on register"],
            ["favorites", "string[]", "Team IDs (fans only) e.g. mar, esp"],
            ["preferredTeam", "string", "Team ID for recommendations"],
        ],
        [40, 30, 120],
    )

    pdf.sub_title("4.3 WC Routes")
    pdf.table(
        ["Route", "Page", "Auth"],
        [
            ["/world-cup", "Home", "Public"],
            ["/world-cup/hotels", "Hotels", "Public"],
            ["/world-cup/flights", "Flights", "Public"],
            ["/world-cup/tickets", "Tickets", "Public"],
            ["/world-cup/packages", "Packages", "Public"],
            ["/world-cup/teams", "Teams & Stats", "Public"],
            ["/world-cup/stadiums", "Stadiums", "Public"],
            ["/world-cup/login", "Login", "Public"],
            ["/world-cup/register", "Register", "Public"],
            ["/world-cup/dashboard", "Dashboard", "WC login required"],
            ["/world-cup/passport", "Fan Passport", "Fan role only"],
        ],
        [55, 55, 30],
    )

    # --- 5. Booking & Payment ---
    pdf.add_page()
    pdf.section_title("5. Bookings, Payments & Passport")
    pdf.sub_title("5.1 Booking Record Fields")
    pdf.table(
        ["Field", "Type", "Description"],
        [
            ["id", "string", "Auto: BK-{timestamp}"],
            ["type", "enum", "hotel | flight | ticket | package | donation"],
            ["title", "string", "Display title"],
            ["date", "string", "YYYY-MM-DD"],
            ["price", "number", "USD amount"],
            ["paymentMethod", "enum", "usd | pi"],
            ["piAmount", "number", "Pi amount if crypto payment"],
            ["status", "enum", "confirmed | pending"],
            ["details", "string", "Rich description (stadium, amenities, etc.)"],
        ],
        [40, 30, 120],
    )

    pdf.sub_title("5.2 Donation Record Fields")
    pdf.table(
        ["Field", "Type", "Description"],
        [
            ["id", "string", "Auto: DN-{timestamp}"],
            ["target", "string", "Team or coach name"],
            ["targetType", "enum", "team | coach"],
            ["amount", "number", "USD (min 5)"],
            ["paymentMethod", "enum", "usd | pi"],
            ["piAmount", "number", "Pi equivalent"],
            ["date", "string", "ISO date"],
        ],
        [40, 30, 120],
    )

    pdf.sub_title("5.3 Booking Page Search Fields")
    pdf.table(
        ["Page", "Fields"],
        [
            ["Hotels", "City (select), Max price (slider $100-1000), Min stars (3+/4+/5+)"],
            ["Flights", "From, To (airport codes), Depart date, Passengers (1/2/3+)"],
            ["Tickets", "Category 1 / 2 / 3 per match"],
            ["Packages", "Package selection with price"],
            ["Fan Donations", "Target type (team/coach), Recipient select, Amount USD"],
        ],
        [40, 150],
    )

    pdf.sub_title("5.4 Pi Network Payment (Demo)")
    pdf.bullet("Exchange rate: ~45 Pi per 1 USD")
    pdf.bullet("Connect button simulates wallet; username: pioneer_fan")
    pdf.bullet("PaymentModal: toggle USD vs Pi; auto-connect on Pi checkout")
    pdf.bullet("Storage keys: wc2030_pi_connected, wc2030_pi_user")

    pdf.sub_title("5.5 Fan Passport Fields")
    pdf.table(
        ["Field", "Type", "Description"],
        [
            ["passportId", "string", "WC2030-PAS-XXXX-XXXX unique per user"],
            ["userEmail", "string", "Owner email"],
            ["loyaltyPoints", "number", "From rarity points + badges"],
            ["collectibles", "array", "Digital wallet items"],
            ["badges", "array", "12 achievement badges"],
            ["visitedCities", "array", "From bookings"],
            ["visitedStadiums", "array", "From ticket collectibles"],
            ["matchCount", "number", "Ticket bookings count"],
        ],
        [40, 25, 125],
    )

    pdf.sub_title("5.6 Collectible Card Fields")
    pdf.table(
        ["Field", "Type", "Description"],
        [
            ["id", "string", "COL-{timestamp}-{segment}"],
            ["bookingId", "string", "Source booking"],
            ["type", "enum", "ticket | hotel | flight | package"],
            ["rarity", "enum", "common | rare | epic | legendary"],
            ["serialNumber", "string", "WC2030-XXXX-XXXX unique"],
            ["title / subtitle", "string", "Match or booking info"],
            ["stadium", "string", "Match tickets only"],
            ["city / country", "string", "Host location"],
            ["date", "string", "Booking date"],
            ["seatNumber", "string", "Generated for tickets e.g. A12-34"],
            ["teamHome / teamAway", "string", "Team flags from match title"],
            ["qrPayload", "JSON", "QR code for stadium validation"],
            ["validated", "boolean", "Entry validated at gate"],
        ],
        [40, 30, 120],
    )

    pdf.sub_title("5.7 Rarity & Loyalty Points (Default)")
    pdf.table(
        ["Rarity", "Ticket Triggers", "Points"],
        [
            ["Legendary", "Final, Semi-Final, Category 1, VIP packages", "1000"],
            ["Epic", "Category 2, travel packages", "400"],
            ["Rare", "Default tickets; 5-star hotels", "150"],
            ["Common", "Flights, standard hotels", "50"],
        ],
        [35, 100, 25],
    )

    # --- 6. Role Matrix ---
    pdf.add_page()
    pdf.section_title("6. Per-Role Feature Matrix")
    pdf.sub_title("6.1 Tactic Zone Main App")
    pdf.table(
        ["Feature", "Admin", "Coach", "Analyst", "Guest"],
        [
            ["Marketing pages", "Yes", "Yes", "Yes", "Yes"],
            ["Coach Hub /app/*", "Yes", "Yes", "Yes", "No"],
            ["Upload pipeline", "Yes", "Yes", "Yes", "No"],
            ["AI Assistant + Reports", "Yes", "Yes", "Yes", "No"],
            ["Puzzles + XP", "Yes", "Yes", "Yes", "No"],
        ],
        [70, 25, 25, 25, 25],
    )

    pdf.sub_title("6.2 World Cup 2030")
    pdf.table(
        ["Feature", "Fan", "Hotel Mgr", "Agency", "Admin", "Guest"],
        [
            ["Browse catalog", "Yes", "Yes", "Yes", "Yes", "Yes"],
            ["Book + pay USD/Pi", "Yes", "Yes", "Yes", "Yes", "Yes*"],
            ["Fan Dashboard", "Yes", "No", "No", "No", "No"],
            ["Fan Passport page", "Yes", "No", "No", "No", "No"],
            ["Donations", "Yes", "No", "No", "No", "No"],
            ["Collectible auto-mint", "Yes", "Yes", "Yes", "Yes", "No"],
            ["Passport Admin + QR", "No", "No", "No", "Yes", "No"],
            ["Notifications bell", "Yes", "Yes", "Yes", "Yes", "No"],
        ],
        [55, 22, 22, 22, 22, 22],
    )
    pdf.body("*Bookings work without login (localStorage). Dashboard/passport require login.")

    # --- 7. API ---
    pdf.add_page()
    pdf.section_title("7. Backend API Endpoints")
    pdf.sub_title("7.1 Analytics (video_id: 1 or 2)")
    pdf.table(
        ["Method", "Endpoint", "Purpose"],
        [
            ["GET", "/api/status", "Pipeline + analytics readiness"],
            ["GET", "/api/analytics/overview", "Cross-match summary"],
            ["GET", "/api/analytics/matches/{id}", "Team match statistics"],
            ["GET", "/api/analytics/players/{id}", "Player-level CV metrics"],
            ["GET", "/api/analytics/squads/{id}/{team}", "Squad breakdown"],
            ["GET", "/api/analytics/tracking/{id}", "Frame-by-frame tracks"],
            ["GET", "/api/analytics/tactical/{id}", "Thirds, width, compactness"],
            ["GET", "/api/analytics/timeline/{id}", "Match event timeline"],
        ],
        [20, 75, 95],
    )

    pdf.sub_title("7.2 Recommendations, Reports, Assistant")
    pdf.table(
        ["Method", "Endpoint", "Purpose"],
        [
            ["GET", "/api/recommendations/formations", "Formation recommendations"],
            ["GET", "/api/recommendations/lineup", "Recommended lineup"],
            ["GET", "/api/recommendations/squads", "Squad player data"],
            ["GET", "/api/reports", "Cached coach reports"],
            ["POST", "/api/reports/generate", "Generate LLM reports"],
            ["POST", "/api/assistant/chat", "AI coach chat"],
            ["GET", "/api/gamification/profile", "XP, level, accuracy"],
            ["POST", "/api/gamification/puzzle/submit", "Submit puzzle answer"],
            ["POST", "/api/pipeline/upload", "Upload match videos"],
            ["POST", "/api/pipeline/start", "Start CV pipeline"],
        ],
        [20, 75, 95],
    )

    pdf.sub_title("7.3 Key CSV Output Columns")
    pdf.table(
        ["File", "Key Columns"],
        [
            ["teams_final_statistics", "formations, score, goals, possession, passes, tackles"],
            ["player_statistics", "shirt_number, Position, Goals, Distance_covered, Avg_speed"],
            ["tracks_csv", "Frame Number, Class Label, Track ID, Bounding Box"],
            ["recommended_formations", "formations, score, defenders, midfielders, attackers"],
            ["combined_team", "position, Shirt_Number, status (Starting 11 / Substitute)"],
            ["closest_player_data_mobile1", "Morocco squad stats per player"],
            ["morocco_roster", "Player_Name, Position, Image_File, Key_Star"],
        ],
        [55, 135],
    )

    # --- 8. Demo Credentials ---
    pdf.add_page()
    pdf.section_title("8. Demo Credentials")
    pdf.sub_title("8.1 Tactic Zone Main App")
    pdf.table(
        ["Role", "Email", "Password"],
        [
            ["Admin", "admin@tacticzone.com", "Admin123!"],
            ["Coach", "coach@tacticzone.com", "Coach123!"],
            ["Analyst", "analyst@tacticzone.com", "Analyst123!"],
        ],
        [30, 80, 80],
    )

    pdf.sub_title("8.2 World Cup 2030")
    pdf.table(
        ["Role", "Email", "Password"],
        [
            ["Fan", "fan@wc2030.com", "Fan123!"],
            ["Hotel Manager", "hotel@wc2030.com", "Hotel123!"],
            ["Travel Agency", "agency@wc2030.com", "Agency123!"],
            ["Admin", "admin@wc2030.com", "Admin123!"],
        ],
        [40, 75, 75],
    )

    pdf.sub_title("8.3 Quick Start")
    pdf.bullet("Backend: python -m uvicorn api_server:app --host 127.0.0.1 --port 8000")
    pdf.bullet("Frontend: cd dashboard && npm run dev")
    pdf.bullet("Main app: http://localhost:5173")
    pdf.bullet("World Cup: http://localhost:5173/world-cup")
    pdf.bullet("API docs: http://localhost:8000/docs")

    pdf.sub_title("8.4 Local Storage Keys")
    pdf.table(
        ["Key", "Module", "Contents"],
        [
            ["tacticzone_auth_user", "Main", "Current session user"],
            ["wc2030_user", "WC", "Current WC session"],
            ["wc2030_bookings", "WC", "All bookings"],
            ["wc2030_passports", "WC", "Fan passports + collectibles"],
            ["wc2030_pi_connected", "WC", "Pi wallet connection state"],
        ],
        [55, 25, 110],
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"PDF generated: {OUT}")


if __name__ == "__main__":
    build()
