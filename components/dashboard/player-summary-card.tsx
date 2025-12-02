import { Card } from "@/components/ui/card";
import { Analysis, PlayerProfile } from "@/lib/types";

type PlayerSummaryCardProps = {
  profile?: PlayerProfile | null;
  analysis?: Analysis | null;
};

export function PlayerSummaryCard({
  profile,
  analysis,
}: PlayerSummaryCardProps) {
  // Handle BOTH shapes:
  //   - nested: { profile: { personaname, avatarfull, ... }, rank_tier, ... }
  //   - flat:   { personaname, avatarfull, ... }
  const raw = profile as any;

  const steamProfile: {
    personaname?: string;
    name?: string | null;
    avatarfull?: string;
  } = raw && typeof raw === "object" && raw.profile ? raw.profile : raw ?? {};

  const playerName =
    steamProfile.personaname ?? steamProfile.name ?? "Player name";

  const avatar = steamProfile.avatarfull ?? null;

  // Rank / MMR / leaderboard – from top-level fields
  const rankTier: number | null | undefined = raw?.rank_tier;
  const leaderboardRank: number | null | undefined = raw?.leaderboard_rank;
  const mmrEstimate: number | null | undefined =
    raw?.mmr_estimate?.estimate ?? raw?.computed_mmr;

  const rankLabel = formatRankTier(rankTier);

  // Winrate from analysis
  const sampleSize = analysis?.sampleSize ?? 0;
  const winrate =
    sampleSize > 0 ? Math.round((analysis?.winrate ?? 0) * 100) : null;

  return (
    <Card className="flex items-center gap-4 rounded-xl border-0 bg-(--analyzer-card) px-5 py-4">
      {/* Avatar */}
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full overflow-hidden bg-slate-900">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={playerName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-slate-400">
            {playerName.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex min-w-0 flex-col">
        {/* Name (same visual style as before) */}
        <p className="max-w-xs truncate text-sm font-semibold text-slate-50">
          {playerName}
        </p>

        {/* Rank / MMR row – only shows if we have data */}
        {(rankLabel || mmrEstimate != null || leaderboardRank != null) && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
            {rankLabel && (
              <span className="rounded-md bg-black/30 px-2 py-[1px]">
                {rankLabel}
              </span>
            )}

            {mmrEstimate != null && (
              <span className="rounded-md bg-black/30 px-2 py-[1px]">
                ~{mmrEstimate.toLocaleString()} MMR
              </span>
            )}

            {leaderboardRank != null && leaderboardRank > 0 && (
              <span className="rounded-md bg-yellow-500/20 px-2 py-[1px] text-yellow-200">
                Top {leaderboardRank}
              </span>
            )}
          </div>
        )}

        {/* Winrate summary */}
        {sampleSize > 0 && winrate !== null && (
          <p className="mt-1 text-[11px] text-slate-400">
            {winrate}% winrate over last {sampleSize} matches
          </p>
        )}
      </div>
    </Card>
  );
}

// Convert OpenDota rank_tier to label like "Archon 1"
function formatRankTier(rankTier: number | null | undefined): string | null {
  if (!rankTier || rankTier < 10) return null;

  const group = Math.floor(rankTier / 10); // 1–8
  const star = rankTier % 10; // 0–5

  const groupNames: Record<number, string> = {
    1: "Herald",
    2: "Guardian",
    3: "Crusader",
    4: "Archon",
    5: "Legend",
    6: "Ancient",
    7: "Divine",
    8: "Immortal",
  };

  const name = groupNames[group];
  if (!name) return null;

  if (name === "Immortal") {
    return "Immortal";
  }

  return star ? `${name} ${star}` : name;
}
