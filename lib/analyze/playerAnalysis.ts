// lib/analyze/playerAnalysis.ts
import {
  PlayerProfile,
  RecentMatch,
  PlayerAnalysis,
  HeroPerformance,
} from "../dotaTypes";

function safeAvg(values: Array<number | undefined | null>): number {
  const nums = values.filter(
    (v): v is number => typeof v === "number" && !Number.isNaN(v)
  );
  if (nums.length === 0) return 0;
  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
}

function calculateWinrate(matches: RecentMatch[]): number {
  if (matches.length === 0) return 0;

  const wins = matches.filter((m) => {
    if (typeof m.radiant_win !== "boolean" || typeof m.player_slot !== "number")
      return false;
    const isRadiant = m.player_slot < 128;
    return (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win);
  }).length;

  return wins / matches.length;
}

function calculateAvgKDA(matches: RecentMatch[]) {
  const kills = safeAvg(matches.map((m) => m.kills));
  const deaths = safeAvg(matches.map((m) => m.deaths));
  const assists = safeAvg(matches.map((m) => m.assists));

  const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;

  return { kills, deaths, assists, kda };
}

function groupHeroPerformance(matches: RecentMatch[]): HeroPerformance[] {
  const byHero = new Map<number, { matches: number; wins: number }>();

  for (const m of matches) {
    if (!m.hero_id) continue;

    if (!byHero.has(m.hero_id)) {
      byHero.set(m.hero_id, { matches: 0, wins: 0 });
    }

    const entry = byHero.get(m.hero_id)!;
    entry.matches += 1;

    if (
      typeof m.radiant_win === "boolean" &&
      typeof m.player_slot === "number"
    ) {
      const isRadiant = m.player_slot < 128;
      const win =
        (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win);
      if (win) entry.wins += 1;
    }
  }

  return Array.from(byHero.entries()).map(([heroId, { matches, wins }]) => ({
    heroId,
    matches,
    wins,
    winrate: matches === 0 ? 0 : wins / matches,
  }));
}

function detectPrimaryRole(matches: RecentMatch[]): string | null {
  if (matches.length === 0) return null;

  const laneCounts: Record<string, number> = {};

  for (const m of matches) {
    const lane = m.lane;
    if (lane == null) continue;

    // Very rough mapping. You can refine this later.
    let laneName: string;
    switch (lane) {
      case 1:
        laneName = "Safe lane";
        break;
      case 2:
        laneName = "Mid";
        break;
      case 3:
        laneName = "Offlane";
        break;
      case 4:
        laneName = "Jungle";
        break;
      default:
        laneName = "Unknown";
        break;
    }

    laneCounts[laneName] = (laneCounts[laneName] ?? 0) + 1;
  }

  let bestLane: string | null = null;
  let bestCount = 0;

  for (const [lane, count] of Object.entries(laneCounts)) {
    if (count > bestCount) {
      bestCount = count;
      bestLane = lane;
    }
  }

  return bestLane;
}

function buildSuggestions(
  profile: PlayerProfile | null,
  analysis: PlayerAnalysis
): string[] {
  const suggestions: string[] = [];

  const games = analysis.sampleSize;
  const winratePct = Math.round(analysis.winrate * 100);
  const kda = analysis.avgKDA.kda;
  const gpm = analysis.avgGPM;

  // Winrate based suggestions
  if (games >= 10 && analysis.winrate < 0.45) {
    suggestions.push(
      `Your recent winrate is ${winratePct}% over ${games} matches. Consider narrowing your hero pool and playing your top 2–3 heroes more often.`
    );
  } else if (games >= 10 && analysis.winrate > 0.55) {
    suggestions.push(
      `Nice! Your recent winrate is ${winratePct}%. Keep reinforcing what works: focus on your best heroes and roles.`
    );
  }

  // KDA / deaths
  if (analysis.avgKDA.deaths > 8) {
    suggestions.push(
      `You die on average ${analysis.avgKDA.deaths.toFixed(
        1
      )} times per game. Consider improving positioning and map awareness — dying less often will boost your networth and impact.`
    );
  } else if (kda > 4) {
    suggestions.push(
      `Your KDA is solid (${kda.toFixed(
        1
      )}). Try converting this into more objectives (towers, Roshan, map control).`
    );
  }

  // Economy
  if (
    gpm < 400 &&
    analysis.primaryRole &&
    ["Safe lane", "Mid"].includes(analysis.primaryRole)
  ) {
    suggestions.push(
      `As a ${analysis.primaryRole} core your average GPM (${gpm.toFixed(
        0
      )}) is on the low side. Focus on last hitting, stacking camps, and minimizing idle time to accelerate your farm.`
    );
  } else if (gpm > 550) {
    suggestions.push(
      `Your farming efficiency is quite good (avg GPM ${gpm.toFixed(
        0
      )}). Look for windows to translate farm into teamfight and objective advantages.`
    );
  }

  // Hero pool
  if (analysis.heroPoolSize >= 8) {
    suggestions.push(
      `You played ${analysis.heroPoolSize} different heroes recently. Narrowing your pool can help you master matchups and power spikes.`
    );
  } else if (analysis.heroPoolSize <= 3 && games >= 10) {
    suggestions.push(
      `Your hero pool is focused (${analysis.heroPoolSize} heroes). This is good for climbing — just make sure you have at least one pick for each role you queue.`
    );
  }

  // Role suggestion
  if (analysis.primaryRole) {
    suggestions.push(
      `Most of your games are played in ${analysis.primaryRole}. Consider specializing further in that role.`
    );
  }

  // Fallback
  if (suggestions.length === 0) {
    suggestions.push(
      "Play a small pool of heroes, review your deaths each match, and focus on one main role to climb more consistently."
    );
  }

  return suggestions;
}

export function analyzePlayer(
  profile: PlayerProfile | null,
  matches: RecentMatch[]
): PlayerAnalysis {
  const sampleSize = matches.length;

  const winrate = calculateWinrate(matches);
  const avgKDA = calculateAvgKDA(matches);
  const avgGPM = safeAvg(matches.map((m) => m.gold_per_min));
  const avgXPM = safeAvg(matches.map((m) => m.xp_per_min));
  const avgHeroDamage = safeAvg(matches.map((m) => m.hero_damage));
  const avgTowerDamage = safeAvg(matches.map((m) => m.tower_damage));
  const avgLastHits = safeAvg(matches.map((m) => m.last_hits));

  const heroPerf = groupHeroPerformance(matches).sort(
    (a, b) => b.matches - a.matches
  );
  const heroPoolSize = heroPerf.length;

  const bestHeroes = heroPerf
    .filter((h) => h.matches >= 3)
    .sort((a, b) => b.winrate - a.winrate)
    .slice(0, 3);

  const worstHeroes = heroPerf
    .filter((h) => h.matches >= 3)
    .sort((a, b) => a.winrate - b.winrate)
    .slice(0, 3);

  const primaryRole = detectPrimaryRole(matches);

  const base: PlayerAnalysis = {
    sampleSize,
    winrate,
    avgKDA,
    avgGPM,
    avgXPM,
    avgHeroDamage,
    avgTowerDamage,
    avgLastHits,
    heroPoolSize,
    bestHeroes,
    worstHeroes,
    primaryRole,
    suggestions: [],
  };

  const suggestions = buildSuggestions(profile, base);
  return { ...base, suggestions };
}
