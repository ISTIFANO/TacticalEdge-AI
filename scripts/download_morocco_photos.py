#!/usr/bin/env python3
"""Download Morocco squad player photos from Wikipedia (when available)."""
from __future__ import annotations

import csv
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROSTER = os.path.join(ROOT, "recommendation_systems_input_files", "morocco_roster.csv")
OUT_DIR = os.path.join(ROOT, "dashboard", "public", "players", "morocco")

# Wikipedia search titles (often differ from display names)
# Direct Wikimedia fallbacks when Wikipedia API is rate-limited or has no page image
FALLBACK_URLS: dict[str, str] = {
    "12": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Munir_Mohamedi_2018.jpg/440px-Munir_Mohamedi_2018.jpg",
    "14": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Isma%C3%ABl_Saibari_%28cropped%29.jpg/440px-Isma%C3%ABl_Saibari_%28cropped%29.jpg",
    "17": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Bilal_El_Khannous_%28cropped%29.jpg/440px-Bilal_El_Khannous_%28cropped%29.jpg",
    "18": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Ayoub_Bouaddi_%28cropped%29.jpg/440px-Ayoub_Bouaddi_%28cropped%29.jpg",
    "9": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Abde_Ezzalzouli_%28cropped%29.jpg/440px-Abde_Ezzalzouli_%28cropped%29.jpg",
    "23": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Flag_of_Morocco.svg/440px-Flag_of_Morocco.svg.png",
}

WIKI_TITLES: dict[str, str] = {
    "Yassine Bounou": "Yassine Bounou",
    "Achraf Hakimi": "Achraf Hakimi",
    "Noussair Mazraoui": "Noussair Mazraoui",
    "Issa Diop": "Issa Diop (footballer)",
    "Nayef Aguerd": "Nayef Aguerd",
    "Sofyan Amrabat": "Sofyan Amrabat",
    "Nael El Aynaoui": "Nael El Aynaoui",
    "Azzedine Ounahi": "Azzedine Ounahi",
    "Abde Ezzalzouli": "Abde Ezzalzouli",
    "Youssef En-Nesyri": "Youssef En-Nesyri",
    "Brahim Diaz": "Brahim Díaz",
    "Munir Mohamedi": "Munir El Kajoui",
    "Youssef Belammari": "Youssef Belammari",
    "Ismael Saibari": "Ismaël Saibari",
    "Zakaria El Ouahdi": "Zakaria El Ouahdi",
    "Anass Salah-Eddine": "Anass Salah-Eddine",
    "Bilal El Khannouss": "Bilal El Khannous",
    "Ayoub Bouaddi": "Ayoub Bouaddi",
    "Soufiane Rahimi": "Soufiane Rahimi",
    "Chadi Riad": "Chadi Riad",
    "Redouane Halhal": "Redouane Halhal",
    "Ayoub El Kaabi": "Ayoub El Kaabi",
    "Ahmed Reda Tagnaouti": "Ahmed Reda Tagnaouti",
    "Eliesse Ben Seghir": "Eliesse Ben Seghir",
    "Chemsdine Talbi": "Chemsdine Talbi",
    "Samir El Mourabet": "Samir El Mourabet",
}


def fetch_wikipedia_thumb(title: str, size: int = 400, retries: int = 4) -> str | None:
    params = urllib.parse.urlencode(
        {
            "action": "query",
            "titles": title,
            "prop": "pageimages",
            "format": "json",
            "pithumbsize": size,
        }
    )
    url = f"https://en.wikipedia.org/w/api.php?{params}"
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "TacticZone/1.0 (hackathon; local dev)"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode())
            pages = data.get("query", {}).get("pages", {})
            for page in pages.values():
                thumb = page.get("thumbnail", {}).get("source")
                if thumb:
                    return thumb
            return None
        except urllib.error.HTTPError as exc:
            if exc.code == 429 and attempt < retries - 1:
                wait = 5 * (attempt + 1)
                print(f"  rate limited, wait {wait}s…")
                time.sleep(wait)
                continue
            if exc.code == 429:
                return None
            raise
        time.sleep(2.0)
    return None


def download(url: str, dest: str) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "TacticZone/1.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            content = resp.read()
        with open(dest, "wb") as f:
            f.write(content)
        return True
    except Exception as exc:
        print(f"  download failed: {exc}")
        return False


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    ok, miss = 0, 0

    with open(ROSTER, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    for row in rows:
        num = row["Shirt_Number"]
        name = row["Player_Name"]
        dest = os.path.join(OUT_DIR, row.get("Image_File") or f"{num}.jpg")
        if os.path.isfile(dest) and os.path.getsize(dest) > 2000:
            print(f"skip #{num} {name} (exists)")
            ok += 1
            continue

        wiki = WIKI_TITLES.get(name, name)
        print(f"#{num} {name} -> {wiki}")
        thumb = fetch_wikipedia_thumb(wiki)
        if not thumb and num in FALLBACK_URLS:
            thumb = FALLBACK_URLS[num]
            print("  using fallback URL")
        if not thumb:
            print("  no image found")
            miss += 1
            continue
        if download(thumb, dest):
            print(f"  saved {dest}")
            ok += 1
        else:
            miss += 1
        time.sleep(0.8)

    # JSON manifest for dashboard
    manifest = []
    for row in rows:
        num = row["Shirt_Number"]
        img = f"/players/morocco/{row.get('Image_File') or f'{num}.jpg'}"
        local = os.path.join(OUT_DIR, os.path.basename(img))
        manifest.append(
            {
                "shirt_number": int(num),
                "name": row["Player_Name"],
                "position": row["Position"],
                "role": row.get("Role", ""),
                "key_star": row.get("Key_Star", "").lower() == "yes",
                "image": img if os.path.isfile(local) else None,
                "notes": row.get("Notes", ""),
            }
        )

    manifest_path = os.path.join(ROOT, "dashboard", "public", "morocco-roster.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "team": "Morocco",
                "group": "C — Brazil, Scotland, Haiti",
                "team_color": [193, 39, 45],
                "key_stars": {
                    "captain": "Achraf Hakimi (#2)",
                    "goalkeeper": "Yassine Bounou (#1)",
                    "playmaker": "Brahim Diaz (#11)",
                    "midfield_leader": "Sofyan Amrabat (#6)",
                    "rising_stars": ["Bilal El Khannouss (#17)", "Ayoub Bouaddi (#18)", "Chemsdine Talbi (#25)"],
                },
                "players": manifest,
            },
            f,
            indent=2,
            ensure_ascii=False,
        )

    print(f"\nDone: {ok} images, {miss} missing. Manifest -> {manifest_path}")


if __name__ == "__main__":
    main()
