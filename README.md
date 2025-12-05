# Dota 2 Analyzer

A Dota 2 profile dashboard that pulls your recent matches from OpenDota and gives you
a clean overview of your performance – plus AI-powered coaching based on your stats.

Live demo: _TBD (Vercel URL)_

---

## Features

- 🎯 **Player profile header**
  - Steam avatar & name
  - Rank tier (Herald → Immortal)
  - Approximate MMR
  - Winrate over the last N matches

- 📊 **Performance summary (last 20 matches)**
  - Winrate
  - Average K/D/A (with KDA ratio)
  - Average GPM & XPM
  - Average hero damage & last hits
  - Hero pool size

- 🧙 **Hero pool snapshot**
  - Top 3 most played heroes from the last 20 matches
  - Per-hero:
    - Games played
    - Winrate
    - KDA
  - Hero icons & names via Dota hero metadata

- 📜 **Recent matches table**
  - Hero, result, K/D/A
  - GPM / XPM
  - Duration & role (where available)

- 🧠 **AI coach**
  - Sends your aggregated stats to an OpenAI model
  - Returns a short, focused coaching report in Markdown
  - Designed to stay grounded in the JSON (no fantasy stats)

---

## Tech Stack

- **Framework:** Next.js (App Router, `app/` directory)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom dark theme
- **UI:** Shadcn UI components (Card, etc.)
- **Data:**
  - [OpenDota API](https://docs.opendota.com/) for player & recent match data
  - Static hero metadata + mapping for hero icons/names
- **AI:** OpenAI API (`gpt-4.1-mini` for coaching)
- **Deployment:** Vercel

---

## Architecture Overview

- `app/page.tsx`  
  Client-side page that:
  - Reads the player ID from the URL
  - Fetches `/api/player/[id]`
  - Fetches hero metadata via a custom `useHeroes` hook
  - Drives the layout (player summary, performance card, AI coach, recent matches)

- `app/api/player/[id]/route.ts`  
  Server route that:
  - Calls OpenDota:
    - `GET /players/:id`
    - `GET /players/:id/recentMatches`
  - Runs `analyzePlayer(profile, recentMatches)` to build the `analysis` object
  - Returns `{ profile, recentMatches, analysis }` as JSON

- `app/api/coach/route.ts`  
  Server route that:
  - Accepts `{ profile, analysis }` from the client
  - Extracts the player name from the nested Steam profile
  - Builds a structured coaching prompt
  - Calls the OpenAI Responses API and returns the generated Markdown

- `lib/analyze/playerAnalysis.ts`  
  Pure logic that:
  - Aggregates recent matches into:
    - winrate
    - average K/D/A
    - average GPM/XPM
    - average hero damage / last hits
    - hero pool size
    - best/worst heroes (internally)
  - Returns a `PlayerAnalysis` object consumed by the UI

- `components/dashboard/*`  
  - `player-summary-card.tsx` – top header with avatar, rank + MMR, winrate
  - `performance-overview-card.tsx` – performance stats + top 3 heroes
  - `recent-matches-card.tsx` – matches table
  - `ai-coach-card.tsx` – button + output area for coaching

---

## Getting Started (Local)

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/dota2-analyzer.git
cd dota2-analyzer
pnpm install        # or npm install / yarn
