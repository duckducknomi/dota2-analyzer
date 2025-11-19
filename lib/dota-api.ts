import { openDota } from "./openDota";

export type DotaPlayerProfile = {
  profile?: {
    account_id: number;
    personaname: string;
    avatarfull: string;
  };
  mmr_estimate?: {
    estimate?: number;
  };
  rank_tier?: number;
};

export type DotaRecentMatch = {
  match_id: number;
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
  duration: number;
  radiant_win: boolean;
  player_slot: number;
  start_time: number;
};

export async function fetchPlayer(
  accountId: string
): Promise<DotaPlayerProfile> {
  const { data } = await openDota.get<DotaPlayerProfile>(
    `/players/${accountId}`
  );
  return data;
}

export async function fetchRecentMatches(
  accountId: string
): Promise<DotaRecentMatch[]> {
  const { data } = await openDota.get<DotaRecentMatch[]>(
    `/players/${accountId}/recentMatches`
  );
  return data;
}
