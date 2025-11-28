import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HeroMeta, RecentMatch } from "@/lib/types";
import { cn } from "@/lib/utils";

// Interpret OpenDota lane_role as "positions" for nicer UX
const positionLabels: Record<number, string> = {
  1: "Hard Carry",
  2: "Mid Lane",
  3: "Offlane",
  4: "Soft Support",
  5: "Hard Support",
};

type Props = {
  recentMatches?: RecentMatch[] | null;
  heroesById?: Record<number, HeroMeta> | null;
};

export function RecentMatchesCard({ recentMatches, heroesById }: Props) {
  const matches = recentMatches ?? [];

  return (
    <Card className="rounded-xl border-0 bg-[color:var(--analyzer-card)] px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">Recent Matches</h2>
        {/* subtle hint text */}
        <span className="text-[11px] uppercase tracking-wide text-slate-500">
          Last {Math.min(matches.length, 10)} games
        </span>
      </div>

      {matches.length === 0 ? (
        <p className="text-xs text-slate-400">
          Fetch a player to see their recent matches.
        </p>
      ) : (
        <>
          {/* Header */}
          <div className="mb-2 grid grid-cols-[2fr_1fr_1fr_1fr] gap-6 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            <span>Match</span>
            <span className="text-center sm:text-left">K / D / A</span>
            <span className="text-center sm:text-left">GPM / XPM</span>
            <span className="text-right">Duration / Role</span>
          </div>

          <div className="space-y-2 text-xs">
            {matches.slice(0, 10).map((m, i) => {
              const isRadiant = (m.player_slot ?? 0) < 128;
              const won =
                typeof m.radiant_win === "boolean"
                  ? m.radiant_win === isRadiant
                  : false;

              const k = m.kills ?? 0;
              const d = m.deaths ?? 0;
              const a = m.assists ?? 0;
              const gpm = m.gold_per_min ?? 0;
              const xpm = m.xp_per_min ?? 0;

              const duration = m.duration ?? 0;
              const mins = Math.floor(duration / 60);
              const secs = duration % 60;

              const heroId = m.hero_id ?? -1;
              const hero =
                heroId > 0 && heroesById ? heroesById[heroId] : undefined;

              const heroLabel =
                hero?.localized_name ??
                hero?.localizedName ??
                hero?.name ??
                `Hero ${heroId}`;

              // ---- Hero icon URL resolution ----
              let iconUrl: string | null = null;

              if (hero) {
                const iconPath = hero.icon || hero.img;

                if (iconPath) {
                  iconUrl = iconPath.startsWith("http")
                    ? iconPath
                    : `https://api.opendota.com${iconPath}`;
                }

                if (!iconUrl && hero.iconUrl) {
                  iconUrl = hero.iconUrl;
                }

                if (!iconUrl && hero.name) {
                  const shortName = hero.name.replace("npc_dota_hero_", "");
                  if (shortName) {
                    iconUrl = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${shortName}.png`;
                  }
                }
              }

              const laneRole = m.lane_role ?? null;
              const roleLabel =
                laneRole !== null
                  ? positionLabels[laneRole] ?? `Position ${laneRole}`
                  : "Unknown role";

              return (
                <div
                  key={m.match_id ?? i}
                  className={cn(
                    "group grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-6 rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-2 text-xs transition-colors",
                    won
                      ? "border-emerald-500/20 hover:border-emerald-400/60 hover:bg-emerald-500/5"
                      : "border-rose-500/20 hover:border-rose-400/60 hover:bg-rose-500/5"
                  )}
                >
                  {/* Col 1 — Hero + Result */}
                  <div className="flex items-center gap-3 min-w-0">
                    {iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={iconUrl}
                        alt={heroLabel}
                        className="h-8 w-8 shrink-0 rounded-md object-cover ring-1 ring-black/40"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black/40 text-[9px] text-slate-300">
                        ?
                      </div>
                    )}

                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-xs font-medium text-slate-100">
                        {heroLabel}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          won ? "text-emerald-400" : "text-rose-400"
                        )}
                      >
                        {won ? "Win" : "Loss"}
                      </span>
                    </div>
                  </div>

                  {/* Col 2 — KDA */}
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                      K / D / A
                    </p>
                    <p className="mt-0.5 font-medium text-slate-100">
                      {k}/{d}/{a}
                    </p>
                  </div>

                  {/* Col 3 — GPM/XPM */}
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                      GPM / XPM
                    </p>
                    <p className="mt-0.5 font-medium text-slate-100">
                      {gpm}/{xpm}
                    </p>
                  </div>

                  {/* Col 4 — Duration/Role */}
                  <div className="flex flex-col items-end text-right">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                      Duration / Role
                    </p>
                    <p className="mt-0.5 font-medium text-slate-100">
                      {mins}:{secs.toString().padStart(2, "0")}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-300">
                      {roleLabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}
