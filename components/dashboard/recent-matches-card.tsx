import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HeroMeta, RecentMatch } from "@/lib/types";

const laneRoleLabels: Record<number, string> = {
  1: "Safe lane",
  2: "Mid lane",
  3: "Offlane",
  4: "Jungle",
  5: "Roaming",
};

type RecentMatchesCardProps = {
  recentMatches?: RecentMatch[] | null;
  heroesById?: Record<number, HeroMeta> | null;
};

export function RecentMatchesCard({
  recentMatches,
  heroesById,
}: RecentMatchesCardProps) {
  return (
    <Card className="rounded-xl border-0 bg-[color:var(--analyzer-card)] px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">Recent Matches</h2>
      </div>

      {!recentMatches || recentMatches.length === 0 ? (
        <p className="text-xs text-slate-400">
          Fetch a player to see their recent matches.
        </p>
      ) : (
        <>
          {/* Header */}
          <div className="mb-2 grid grid-cols-[1.6fr,0.7fr,0.8fr,1fr,0.8fr,0.9fr] text-[11px] uppercase tracking-wide text-slate-500">
            <span>Hero</span>
            <span>Result</span>
            <span>KDA</span>
            <span>GPM / XPM</span>
            <span>Duration</span>
            <span className="text-right">Role</span>
          </div>

          {/* Rows */}
          <div className="space-y-2 text-xs">
            {recentMatches.slice(0, 10).map((m, i) => {
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
              const durationMinutes = Math.floor(duration / 60);
              const durationSeconds = duration % 60;

              const heroId = m.hero_id ?? -1;
              const hero =
                heroId > 0 && heroesById ? heroesById[heroId] : undefined;
              const heroLabel =
                hero?.localizedName ??
                (heroId > 0 ? `Hero ${heroId}` : "Unknown hero");

              // lane_role can be null/undefined → treat as “no role”
              const laneRole =
                typeof m.lane_role === "number" ? m.lane_role : undefined;

              const roleLabel =
                laneRole !== undefined
                  ? laneRoleLabels[laneRole] ?? `Role ${laneRole}`
                  : null; // null → don't render badge

              return (
                <div
                  key={m.match_id ?? i}
                  className={cn(
                    "grid grid-cols-[1.6fr,0.7fr,0.8fr,1fr,0.8fr,0.9fr] items-center rounded-md px-3 py-2",
                    won
                      ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "bg-rose-500/5 hover:bg-rose-500/10"
                  )}
                >
                  {/* Hero */}
                  <div className="flex items-center gap-2 truncate">
                    {hero?.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={hero.iconUrl}
                        alt={heroLabel}
                        className="h-6 w-6 shrink-0 rounded-sm object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-black/40 text-[9px] text-slate-300">
                        ?
                      </div>
                    )}
                    <span className="truncate">{heroLabel}</span>
                  </div>

                  {/* Result */}
                  <div
                    className={cn(
                      "font-medium",
                      won ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    {won ? "Win" : "Loss"}
                  </div>

                  {/* KDA */}
                  <div>
                    {k}/{d}/{a}
                  </div>

                  {/* GPM / XPM */}
                  <div>
                    {gpm}/{xpm}
                  </div>

                  {/* Duration */}
                  <div>
                    {durationMinutes}:
                    {durationSeconds.toString().padStart(2, "0")}
                  </div>

                  {/* Role (only if we know it) */}
                  <div className="flex justify-end">
                    {roleLabel && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0 px-2 py-0.5 text-[10px] font-medium text-slate-100",
                          won ? "bg-emerald-500/40" : "bg-rose-500/40"
                        )}
                      >
                        {roleLabel}
                      </Badge>
                    )}
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
