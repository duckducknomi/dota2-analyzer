// lib/types.ts

/* ========== PLAYER ========== */

export type PlayerProfile = {
  rank_tier?: number | null;
  leaderboard_rank?: number | null;
  computed_mmr?: number | null;

  profile?: {
    account_id?: number;
    personaname?: string;
    name?: string | null;
    plus?: boolean;
    steamid?: string;
    avatar?: string;
    avatarmedium?: string;
    avatarfull?: string;
    profileurl?: string;
    last_login?: string | null;
    loccountrycode?: string | null;
    is_contributor?: boolean;
    is_subscriber?: boolean;
  };
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
  name: string; // "npc_dota_hero_nyx_assassin"
  localized_name: string; // OpenDota snake_case
  localizedName: string; // camelCase alias for convenience

  // Relative paths from OpenDota heroStats
  icon: string; // "/apps/dota2/images/dota_react/heroes/nyx_assassin_icon.png?"
  img: string; // "/apps/dota2/images/dota_react/heroes/nyx_assassin.png?"

  // Fully qualified URL (what your old route already intended)
  iconUrl: string; // "https://cdn.cloudflare.steamstatic.com/apps/dota2/..."
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
