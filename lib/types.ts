// lib/types.ts

/* ========== PLAYER ========== */

export type PlayerProfile = {
  account_id?: number;
  personaname?: string;
  name?: string | null;
  avatarfull?: string;
  profileurl?: string;
  // add more OpenDota/Steam fields here as you start using them
};

/* ========== ANALYSIS ========== */

export type KDAStats = {
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
};

export type Analysis = {
  sampleSize: number;
  winrate: number; // 0–1
  avgKDA: KDAStats;
  avgGPM: number;
  avgXPM: number;
  avgHeroDamage: number;
  avgLastHits: number;
  primaryRole?: string;
  heroPoolSize: number;
  suggestions?: string[];
};

/* ========== MATCHES ========== */

export type HeroMeta = {
  id: number;
  localizedName: string;
  iconUrl?: string;
};

export type RecentMatch = {
  match_id?: number;
  hero_id?: number;
  radiant_win?: boolean;
  player_slot?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  gold_per_min?: number;
  xp_per_min?: number;
  duration?: number;
  lane_role?: number;
  start_time?: number; // optional, if you ever use it
};

/* ========== API RESPONSES ========== */

export type ApiResponse = {
  profile?: PlayerProfile | null;
  recentMatches?: RecentMatch[] | null;
  analysis?: Analysis | null;
  error?: string;
};
