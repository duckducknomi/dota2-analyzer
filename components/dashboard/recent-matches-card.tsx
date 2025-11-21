import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecentMatch } from "@/lib/types";

type RecentMatchesCardProps = {
  recentMatches?: RecentMatch[] | null;
};

export function RecentMatchesCard({ recentMatches }: RecentMatchesCardProps) {
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
          <div className="mb-2 grid grid-cols-[1.2fr,0.8fr,0.8fr,1fr,0.8fr,0.8fr] text-[11px] uppercase tracking-wide text-slate-500">
            <span>Hero</span>
            <span>Outcome</span>
            <span>KDA</span>
            <span>GPM/XPM</span>
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

              return (
                <div
                  key={i}
                  className="grid grid-cols-[1.2fr,0.8fr,0.8fr,1fr,0.8fr,0.8fr] items-center rounded-md bg-[#050816]/70 px-3 py-2"
                >
                  <div className="truncate">
                    {m.hero_id ? `Hero ${m.hero_id}` : "Unknown hero"}
                  </div>
                  <div className={won ? "text-emerald-400" : "text-rose-400"}>
                    {won ? "Win" : "Loss"}
                  </div>
                  <div>
                    {k}/{d}/{a}
                  </div>
                  <div>
                    {gpm}/{xpm}
                  </div>
                  <div>
                    {durationMinutes}:
                    {durationSeconds.toString().padStart(2, "0")}
                  </div>
                  <div className="flex justify-end">
                    <Badge
                      variant="outline"
                      className="border-0 bg-[color:var(--analyzer-accent)]/80 px-2 py-0.5 text-[10px] font-medium text-slate-100"
                    >
                      {m.lane_role !== undefined
                        ? `Role ${m.lane_role}`
                        : "Role"}
                    </Badge>
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
