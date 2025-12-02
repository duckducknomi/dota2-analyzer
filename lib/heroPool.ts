import type { RecentMatch } from "@/lib/types";

export type HeroPoolEntry = {
  heroId: number;
  matches: number;
  winrate: number;
  kda: number;
};

export function getHeroPoolTop3(
  matches: RecentMatch[] | null | undefined
): HeroPoolEntry[] {
  if (!matches || matches.length === 0) return [];

  const pool = new Map<
    number,
    {
      matches: number;
      wins: number;
      kills: number;
      deaths: number;
      assists: number;
    }
  >();

  const last20 = matches.slice(0, 20);

  for (const m of last20) {
    if (!m.hero_id) continue;

    const heroId = m.hero_id;
    const isRadiant = (m.player_slot ?? 0) < 128;
    const didWin = isRadiant === Boolean(m.radiant_win);

    const prev = pool.get(heroId) ?? {
      matches: 0,
      wins: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
    };

    prev.matches++;
    if (didWin) prev.wins++;

    prev.kills += m.kills ?? 0;
    prev.deaths += m.deaths ?? 0;
    prev.assists += m.assists ?? 0;

    pool.set(heroId, prev);
  }

  const arr: HeroPoolEntry[] = [];

  pool.forEach((s, heroId) => {
    arr.push({
      heroId,
      matches: s.matches,
      winrate: s.wins / s.matches,
      kda: (s.kills + s.assists) / Math.max(1, s.deaths),
    });
  });

  return arr.sort((a, b) => b.matches - a.matches).slice(0, 3);
}
