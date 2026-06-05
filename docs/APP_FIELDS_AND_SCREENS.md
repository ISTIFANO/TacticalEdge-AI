# TacticalEdge-AI / morocco2030.PI — App Fields & Screens

Documentation complète des **champs**, **routes**, **données** et **captures d’écran** du projet.  
Deux modules principaux : **Partie 1 — Marketing & Coach Analytics** · **Partie 2 — FIFA World Cup 2030 Fan Portal**

---

## Thème visuel global

| Élément | Partie 1 (Coach) | Partie 2 (World Cup) |
|---------|------------------|----------------------|
| **Fond** | Navy profond `#0D1B2A` | Navy / noir `#0a1628` |
| **Accent principal** | Vert lime `#AAFF45` | Or WC `#C5A572` / `#f4af47` |
| **Accent secondaire** | Rouge Maroc `#C1272D` | Vert Pi / e-Dirham |
| **Typographie** | Barlow Condensed + Inter + JetBrains Mono | Sans-serif multilingue (FR/EN/AR/ES/PT) |
| **Composants** | Cartes spotlight, grille pitch, charts Recharts | Cartes WC, carte Pi Maroc, countdown |
| **Mode** | Dark fixe (coach) | Dark / Light toggle (`data-wc-theme`) |

---

# Partie 1 — Marketing & Coach Analytics

## 1.1 Page d’accueil marketing (`/`)

![Accueil morocco2030.PI](part1-1.png)

**Route :** `/`  
**Rôle :** Landing page FIFA World Cup 2030 + entrée Coach Dashboard

### Champs & contenu

| Zone | Champs |
|------|--------|
| **Header** | Logo, Home, About, Features, Players, World Cup 2030, Sign in, Start free |
| **Hero badge** | `MOROCCO2030.PI · FIFA WORLD CUP 2030` |
| **Titre** | `morocco2030.PI` · `Morocco 2030` |
| **Description** | Powered by Pi Network · Atlas Lions · hosts MA / ES / PT |
| **CTA** | Explore World Cup 2030 · Coach Dashboard |
| **Stats rapides** | Morocco · Group C · Coach Walid Regragui · FIFA Rank #12 |
| **Carte stade** | Grand Stade de Casablanca · 115 000 capacity |
| **Grille infos** | Platform · Coach · Top Scorer · Payment (Pi + e-Dirham) |
| **Slider joueurs** | Galerie animée Atlas Lions (web images) |
| **Sections** | Host nations · Group C · Stadiums · Features |

---

## 1.2 Coach Hub (`/coach`)

![Coach Dashboard](screencapture-localhost-5174-coach-2026-06-08-09_30_27.png)

**Route :** `/coach` (protégé)

### Champs profil coach

| Champ | Exemple | Description |
|-------|---------|-------------|
| `name` | Karim Benali | Nom du coach |
| `club` | FC Casablanca | Club |
| `level` | Lv.2 Analyst | Niveau gamification |
| `xp` | 680 XP | Points d’expérience |
| `xpToNext` | 320 XP | XP restants niveau suivant |
| `puzzleAccuracy` | 28.6% | Précision puzzles tactiques |
| `preparationRating` | 97 / 99 | Score de préparation |

### Widgets

| Widget | Champs |
|--------|--------|
| **Recent Matches** | Liste matchs analysés |
| **Tactical Puzzle** | Difficulté, XP, scénario, formation suggérée, possession, tiers attaque |
| **Weekly Challenges** | Puzzles (3/5), Upload (1/1), AI questions (2/3) + récompenses XP |
| **Latest Reports** | Match Summary · Opponent Analysis · Lineup Recommendations |
| **Badges** | First Analysis · 3-Day Streak · Tactical Mind · Set Piece Pro · Elite Strategist |
| **AI Coach Bar** | Prompt suggéré · lien Assistant |

---

## 1.3 Analyze Videos (`/app/upload`)

![Analyze Videos](screencapture-localhost-5174-app-upload-2026-06-08-09_30_45.png)

### Champs upload

| Champ | Type | Description |
|-------|------|-------------|
| `teamVideo` | File | Vidéo équipe (.mp4, 1080p+) |
| `opponentVideo` | File | Vidéo adversaire |
| `teamUrl` | URL | Lien direct ou Google Drive |
| `opponentUrl` | URL | Lien direct ou Google Drive |
| `mode` | enum | `full` · `halftime` · `live_lite` |
| **Status** | bool | Your team video: Ready / Opponent video: Ready |

### Sélecteur match (header)

| Valeur | Label |
|--------|-------|
| `1` | Match 1 — My Team |
| `2` | Match 2 — Opponent |
| `both` | Compare Both |

---

## 1.4 Overview — Season Analytics (`/app`)

![Overview Analytics](screencapture-localhost-5174-app-2026-06-08-09_31_32.png)

### Charts & KPIs

| Graphique | Métriques |
|-----------|-----------|
| **xG & Goals Trend** | xG, Goals, Shots, On target, Possession %, Pass acc., PPDA (par GW) |
| **xG vs Actual Goals** | Scatter équipes · diagonale xG = Goals |
| **League Points** | Classement pts (Morocco 91, Brazil 86…) |
| **Recent Form** | Points cumulés W/D/L |
| **Team Profile Radar** | Attack, Defense, Pressing, Possession, Set Pieces, Transition, Physical, Creativity (0–100) |
| **Key Metrics Comparison** | xG, Possession %, Pass Accuracy, Shots, PPDA, Prog. Passes |
| **Shots Breakdown** | On target · Off target · Blocked · xG |
| **Player Touch Map** | Heatmap CB / AM / Winger |
| **Match Pipeline KPIs** | Goals, Shots, Pass Success %, Distance |
| **Match Comparison** | Barres match_1 vs match_2 |
| **Pass Distribution** | Donut Accurate / Failed |
| **Top Distance** | Line chart joueurs |
| **Tackle Success** | Tackles vs Success % |

### Données mock stables (si API vide)

| Équipe | Formation | Score | Possession |
|--------|-----------|-------|------------|
| Morocco | 4-3-3 | 2–1 | 58% |
| Brazil | 4-2-3-1 | 1–2 | 42% |

---

## 1.5 Coach Assistant (`/app/assistant`)

![Coach Assistant](screencapture-localhost-5174-app-assistant-2026-06-08-09_32_03.png)

| Champ | Description |
|-------|-------------|
| `message` | Question utilisateur |
| `context` | `match` · `opponent` · `both` · `training` · `tactical` |
| `video_id` | 1 ou 2 |
| `reply` | Réponse LLM markdown |
| `suggested_prompts` | Prompts rapides |

---

## 1.6 Recommendations (`/app/recommendations`)

![Recommendations](screencapture-localhost-5174-app-recommendations-2026-06-08-09_32_27.png)

| Section | Champs |
|---------|--------|
| **My Team** | formations, goals, total_passes, pass_success, total_possession |
| **Opponent** | idem |
| **Comparison chart** | metric, my_team, opponent |
| **Starting XI** | shirt_number, position, status |
| **Substitutes** | shirt_number, position |
| **Formations table** | formations, score, goals, passes, pass %, possession |
| **Squads** | #, Pos, Passes, Distance |

---

## 1.7 Squad Breakdown (`/app/squads`)

![Squad Breakdown](screencapture-localhost-5174-app-squads-2026-06-08-09_33_07.png)

| Champ joueur | Source |
|--------------|--------|
| `shirt_number` | CV / roster |
| `role` | GK · Defender · Midfielder · Forward |
| `distance_covered` | m |
| `total_passes` | count |
| **Radar 8 axes** | Attack, Defense, Pressing, Possession, Set Pieces, Transition, Physical, Creativity |

---

## 1.8 Autres pages Coach — champs résumés

| Route | Page | Champs principaux |
|-------|------|-------------------|
| `/app/match` | Match Summary | formations, score, goals, shots, passes, possession, corners, substitutions |
| `/app/players` | Player Stats | #, Team, Goals, Passes, Pass %, Shots, Distance, Top Speed + filtres team / min distance |
| `/app/physical` | Physical | Distance vs Speed scatter, Top 8 distance, Avg speed by position |
| `/app/events` | Events & Formations | corners, interceptions, clearances, tackles, tackle_success, key_passes, possession % |
| `/app/tracking` | Tracking | frame, class_label, bbox, center_x/y, pagination |
| `/app/tactical` | Tactical | thirds_occupancy (Def/Mid/Att), avg_team_width, avg_compactness |
| `/app/timeline` | Timeline | type, label, frame, team |
| `/app/reports` | Reports | match_summary, opponent_analysis, lineup, training_plan, halftime_brief |
| `/app/puzzles` | Puzzles | category, difficulty, XP, answer |
| `/app/live` | Live Monitor | frames_processed, progress_pct, phase, processing |
| `/app/news` | Coach News | id, title, date, author, category, excerpt |

### Auth (`/login`)

| Champ | Démo |
|-------|------|
| Email coach | `coach@tacticzone.com` |
| Password | `Coach123!` |

---

# Partie 2 — FIFA World Cup 2030 Fan Portal

## 2.1 Accueil World Cup (`/world-cup`)

![WC Home](part2-1.png)

### Hero

| Champ | Valeur exemple |
|-------|----------------|
| `title` | Coupe du Monde FIFA 2030 |
| `subtitle` | Maroc · Espagne · Portugal — e-Dirham ou Pi Network |
| `teams` | 48 |
| `cities` | 6 |
| `matches` | 104 |
| `countdown` | Days · Hours · Mins · Secs → kickoff 2030-06-08 |
| `tickets_avail` | 500K+ |
| `payment` | e-Dirham + Pi Network |

### Carte Pi Maroc

| Champ | Description |
|-------|-------------|
| `search` | Recherchez des vendeurs ou des Pi |
| `markers` | Vendeurs Pi par ville (Casablanca, Rabat, Marrakech…) |
| `cta` | + Vendre |

### Hôtels vedette

| Champ | Exemple |
|-------|---------|
| `name` | Royal Mansour Marrakech |
| `city` | Marrakech, Morocco |
| `price` | 890 Đ · 40 050 π |
| `stars` | 5 |
| `rating` | 9.8 |
| `amenities` | Spa, Pool, Shuttle |

### Forfaits voyage

| ID | Titre | Prix Đ | Prix π |
|----|-------|--------|--------|
| p1 | Morocco Host City Explorer | 1 890 | 85 050 |
| p2 | Iberian Double — Madrid & Barcelona | 1 450 | 65 250 |
| p3 | Portugal Coast & Football | 1 280 | 57 600 |
| p4 | Tri-Nation Ultimate Pass | 4 200 | 189 000 |

### News & Fixtures

| News | Fixtures |
|------|----------|
| date, title, excerpt | date, match, city |

---

## 2.2 Hôtels (`/world-cup/hotels`)

![Hotels](part2-2%20(2).png)

### Filtres

| Champ | Type |
|-------|------|
| `city` | All · Marrakech · Casablanca · Madrid… |
| `maxPrice` | Slider 0–1000 Đ |
| `stars` | All · 4 · 5 |

### Carte hôtel

| Champ | Description |
|-------|-------------|
| `id` | h1…h8 |
| `name` | Nom |
| `city` | Ville |
| `country` | Morocco / Spain / Portugal |
| `stars` | 4–5 |
| `price` | Đ + π |
| `rating` | /10 |
| `rooms` | Disponibilité |
| `amenities[]` | Spa, Pool, Beach… |
| **Actions** | Comparer · Réserver |

---

## 2.3 Paiement (modal)

![Paiement e-Dirham / Pi](PAYMENT2.png)

| Champ | Exemple |
|-------|---------|
| `item` | Royal Air Maroc CMN–MAD |
| `method` | e-Dirham · Pi Network |
| `amount_edh` | 189 Đ |
| `amount_pi` | 8 505 π |
| `hint` | Portefeuille connecté pour finaliser |
| **Actions** | Annuler · Payer en e-Dirham / Payer en π |

> Capture alternative : [part2-3.png](part2-3.png)

---

## 2.4 Fan Dashboard (`/world-cup/dashboard`)

![Fan Dashboard](part2-beforlastone.png)

### Profil fan

| Champ | Exemple |
|-------|---------|
| `name` | Ahmed Fan |
| `role` | Fan |
| `favoriteTeam` | Morocco (MA) |

### Stats équipe préférée

| Métrique | Valeur |
|----------|--------|
| FIFA Rank | #12 |
| Group | C |
| Coach | Walid Regragui |
| Form | W W D W L |
| Played / W / D / L | 12 / 8 / 2 / 2 |
| Goals / Conceded | 22 / 9 |
| Possession | 54% |
| Pass Accuracy | 86% |
| Clean Sheets | 5 |
| Top Scorer | En-Nesyri (7) |

### Réservations

| Champ | Exemple vol |
|-------|-------------|
| `airline` | Royal Air Maroc |
| `route` | CMN → MAD |
| `date` | 2030-06-10 |
| `price` | 189 Đ |
| `duration` | 2h 15m |
| `stops` | Direct |

### Dons

| Champ | Description |
|-------|-------------|
| `donateType` | team · coach |
| `team` | Morocco |
| `amount_edh` | 25 Đ |
| `amount_pi` | 1 125 π |

---

## 2.5 Passeport Fan (`/world-cup/passport`)

![Passeport Fan](part2-lastone.png)

### Compteurs

| Champ | Valeur |
|-------|--------|
| `collectibles` | 1 |
| `badges` | 0 |
| `points` | 50 |

### Profil passeport

| Champ | Exemple |
|-------|---------|
| `fanId` | MA-2030-PAS-5768-4398 |
| `favoriteTeam` | Morocco |
| `matchesAttended` | 0 |
| `stadiumsVisited` | 0 |
| `loyaltyPoints` | 50 |

### Digital Wallet — carte collectible

| Champ | Exemple |
|-------|---------|
| `type` | FLIGHT |
| `title` | Royal Air Maroc CMN-MAD |
| `rarity` | COMMON · RARE · EPIC · LEGENDARY |
| `city` | Host City |
| `date` | 2030-06-10 |
| `qrCode` | SCAN AT GATE |

### Journey Map

| Champ | Description |
|-------|-------------|
| `visitedCities[]` | Villes visitées |
| `visitedStadiums[]` | Stades visités |

### Fan Leaderboard

| Colonne | Description |
|---------|-------------|
| Rank | #1–10+ |
| Fan | Nom + drapeau |
| Matches | Matchs assistés |
| Badges | Badges débloqués |
| Points | Points fidélité |

### Achievement Badges (12)

First Kickoff · Hat Trick Fan · Stadium Regular · Final Witness · Ground Explorer · Stadium Hopper · Grand Tour · Journey Complete · Tri-Nation Traveler · Bronze Supporter · Gold Ambassador · Master Collector

---

## 2.6 Autres routes World Cup

| Route | Page | Champs clés |
|-------|------|-------------|
| `/world-cup/tickets` | Billets | match, stadium, city, category1/2/3, price Đ/π |
| `/world-cup/flights` | Vols | airline, from, to, depart, arrive, duration, stops, price |
| `/world-cup/packages` | Forfaits | title, country, days, price, includes[], image |
| `/world-cup/teams` | Équipes | rank, form, goals, possession, coach, group |
| `/world-cup/stadiums` | Stades | name, city, capacity, image |
| `/world-cup/about` | À propos | Host nations, legacy |
| `/world-cup/contact` | Contact | formulaire |
| `/world-cup/login` | Connexion | fan@wc2030.com / Fan123! |
| `/world-cup/register` | Inscription | email, password, favorite team |

### Auth démo World Cup

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Fan | `fan@wc2030.com` | `Fan123!` |
| Admin | `admin@wc2030.com` | `Admin123!` |

---

# Index des captures d’écran

## Partie 1 — Coach & Marketing

| Fichier | Page |
|---------|------|
| [part1-1.png](part1-1.png) | Accueil morocco2030.PI |
| [screencapture-localhost-5174-coach-2026-06-08-09_30_27.png](screencapture-localhost-5174-coach-2026-06-08-09_30_27.png) | Coach Hub |
| [screencapture-localhost-5174-app-upload-2026-06-08-09_30_45.png](screencapture-localhost-5174-app-upload-2026-06-08-09_30_45.png) | Analyze Videos |
| [screencapture-localhost-5174-app-2026-06-08-09_31_32.png](screencapture-localhost-5174-app-2026-06-08-09_31_32.png) | Overview / Season Analytics |
| [screencapture-localhost-5174-app-assistant-2026-06-08-09_32_03.png](screencapture-localhost-5174-app-assistant-2026-06-08-09_32_03.png) | Coach Assistant |
| [screencapture-localhost-5174-app-recommendations-2026-06-08-09_32_27.png](screencapture-localhost-5174-app-recommendations-2026-06-08-09_32_27.png) | Recommendations |
| [screencapture-localhost-5174-app-squads-2026-06-08-09_33_07.png](screencapture-localhost-5174-app-squads-2026-06-08-09_33_07.png) | Squad Breakdown |

## Partie 2 — World Cup 2030

| Fichier | Page |
|---------|------|
| [part2-1.png](part2-1.png) | Accueil WC complet |
| [part2-2 (2).png](part2-2%20(2).png) | Hôtels |
| [part2-3.png](part2-3.png) | Modal paiement |
| [PAYMENT2.png](PAYMENT2.png) | Modal paiement (variante) |
| [part2-beforlastone.png](part2-beforlastone.png) | Fan Dashboard |
| [part2-lastone.png](part2-lastone.png) | Passeport Fan |

---

# API & données backend (référence)

| Endpoint | Données retournées |
|----------|-------------------|
| `GET /api/analytics/overview` | matches[], comparison[], recommendations_available |
| `GET /api/analytics/matches/{1\|2}` | teams[], formations, events, possession |
| `GET /api/analytics/players/{1\|2}` | PlayerStat[] |
| `GET /api/recommendations/compare` | comparison[], my_team, opponent_team |
| `GET /api/reports` | coach_reports.json |
| `POST /api/assistant/chat` | reply, context, video_id |

**Fallback mock :** `dashboard/src/data/analyticsMockData.ts` — données stables Morocco vs Brazil si pipeline CV incomplet.

---

# Lancer l’application

```bash
# Backend
cd Tactic_Zone
python api_server.py          # http://localhost:8000

# Frontend
cd dashboard
npm run dev                   # http://localhost:5173
```

---

*TacticalEdge-AI · morocco2030.PI · Documentation générée pour le hackathon FIFA World Cup 2030.*
