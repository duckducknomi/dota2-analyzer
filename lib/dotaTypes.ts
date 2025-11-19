// lib/dotaTypes.ts

// Shape of the player profile you already return from the API.
// Keep this loose so it works with Steam/OpenDota without strict matching.
export interface PlayerProfile {
  profile?: {
    account_id?: number;
    personaname?: string;
    name?: string | null;
    plus?: boolean;
    steamid?: string;
    avatarfull?: string;
  };
  rank_tier?: number | null;
  leaderboard_rank?: number | null;
  mmr_estimate?: {
    estimate?: number;
  };
  // add any extra fields you like here
}

// Shape of a single recent match from OpenDota
export interface RecentMatch {
  match_id: number;
  player_slot?: number;
  radiant_win?: boolean;
  hero_id?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  duration?: number;
  gold_per_min?: number;
  xp_per_min?: number;
  hero_damage?: number;
  tower_damage?: number;
  hero_healing?: number;
  last_hits?: number;
  lane?: number | null;
  lane_role?: number | null;
  is_roaming?: boolean | null;
  party_size?: number | null;
  // allow unknown extras
  [key: string]: any;
}

// Aggregated per-hero performance
export interface HeroPerformance {
  heroId: number;
  matches: number;
  wins: number;
  winrate: number; // 0–1
}

// Overall analysis structure returned by the API
export interface PlayerAnalysis {
  sampleSize: number;

  winrate: number; // 0–1
  avgKDA: {
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
  };
  avgGPM: number;
  avgXPM: number;
  avgHeroDamage: number;
  avgTowerDamage: number;
  avgLastHits: number;

  heroPoolSize: number;
  bestHeroes: HeroPerformance[];
  worstHeroes: HeroPerformance[];

  primaryRole: string | null;

  suggestions: string[];
}
