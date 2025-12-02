import { Card } from "@/components/ui/card";
import type { Analysis, HeroMeta } from "@/lib/types";

type HeroPoolEntry = {
  heroId: number;
  matches: number;
  winrate: number; // 0–1
  kda: number;
};

type PerformanceOverviewCardProps = {
  analysis?: Analysis | null;
  heroPoolTop3?: HeroPoolEntry[];
  heroesById?: Record<number, HeroMeta> | null;
};

export function PerformanceOverviewCard({
  analysis,
  heroPoolTop3,
  heroesById,
}: PerformanceOverviewCardProps) {
  const hasAnalysis = !!analysis && !!analysis.sampleSize;

  return (
    <Card className="rounded-xl border-0 bg-[color:var(--analyzer-card)] px-5 py-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          Performance Summary
          {analysis?.sampleSize ? (
            <span className="ml-1 text-xs font-normal text-slate-400">
              (last {analysis.sampleSize} matches)
            </span>
          ) : null}
        </h2>
      </div>

      {!hasAnalysis ? (
        <p className="text-xs text-slate-400">
          Fetch a player to see performance metrics.
        </p>
      ) : (
        <>
          {/* Core stats grid */}
          <div className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Winrate">{Math.round(analysis.winrate * 100)}%</Stat>
            <Stat label="Avg KDA">
              {analysis.avgKDA.kills.toFixed(1)}/
              {analysis.avgKDA.deaths.toFixed(1)}/
              {analysis.avgKDA.assists.toFixed(1)}{" "}
              <span className="text-slate-400">
                ({analysis.avgKDA.kda.toFixed(1)})
              </span>
            </Stat>
            <Stat label="Avg GPM">{analysis.avgGPM.toFixed(0)}</Stat>
            <Stat label="Avg XPM">{analysis.avgXPM.toFixed(0)}</Stat>
            <Stat label="Avg Hero Damage">
              {Math.round(analysis.avgHeroDamage).toLocaleString()}
            </Stat>
            <Stat label="Avg Last Hits">{analysis.avgLastHits.toFixed(0)}</Stat>
            {analysis.primaryRole && (
              <Stat label="Primary Role">{analysis.primaryRole}</Stat>
            )}
            <Stat label="Hero Pool">{analysis.heroPoolSize} heroes</Stat>
          </div>

          {/* Top 3 hero pool (last 20 matches) */}
          {heroPoolTop3 && heroPoolTop3.length > 0 && (
            <div className="mt-4">
              <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">
                Most played heroes (last 20 matches)
              </div>

              <div className="space-y-1">
                {heroPoolTop3.map((hero) => {
                  const meta = heroesById?.[hero.heroId];

                  const heroLabel =
                    meta?.localized_name ??
                    (meta as any)?.localizedName ??
                    meta?.name ??
                    `Hero ${hero.heroId}`;

                  let iconUrl: string | null = null;
                  if (meta?.name) {
                    const shortName = meta.name.replace("npc_dota_hero_", "");
                    iconUrl = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${shortName}.png`;
                  }

                  return (
                    <div
                      key={hero.heroId}
                      className="flex items-center justify-between rounded-md bg-[#050816]/70 px-3 py-1.5 text-[11px] text-slate-100"
                    >
                      {/* Left: hero icon + name */}
                      <div className="flex items-center gap-2">
                        {iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={iconUrl}
                            alt={heroLabel}
                            className="h-7 w-7 shrink-0 rounded-md object-cover ring-1 ring-black/40"
                          />
                        ) : (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/40 text-[9px] text-slate-300">
                            ?
                          </div>
                        )}

                        <span className="truncate font-medium">
                          {heroLabel}
                        </span>
                      </div>

                      {/* Right: matches / WR / KDA */}
                      <div className="flex items-center gap-3 text-[10px] text-slate-300">
                        <span>{hero.matches} games</span>
                        <span>{Math.round(hero.winrate * 100)}% WR</span>
                        <span>KDA {hero.kda.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

type StatProps = {
  label: string;
  children: React.ReactNode;
};

function Stat({ label, children }: StatProps) {
  return (
    <div className="rounded-md bg-[#050816]/70 px-3 py-2 text-xs">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-slate-100">{children}</div>
    </div>
  );
}
