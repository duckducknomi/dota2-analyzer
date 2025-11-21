import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Analysis } from "@/lib/types";

type PerformanceOverviewCardProps = {
  analysis?: Analysis | null;
  onGenerateCoach: () => void;
  coachLoading: boolean;
  hasCoach: boolean;
};

export function PerformanceOverviewCard({
  analysis,
  onGenerateCoach,
  coachLoading,
  hasCoach,
}: PerformanceOverviewCardProps) {
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

        <Button
          onClick={onGenerateCoach}
          disabled={!analysis || coachLoading}
          className="h-8 px-3 text-[11px] font-medium bg-[color:var(--analyzer-accent)] hover:bg-[color:var(--analyzer-accent)]/90 disabled:opacity-60"
        >
          {coachLoading
            ? "Generating AI Coaching..."
            : hasCoach
            ? "Regenerate AI Coaching"
            : "Generate AI Coaching"}
        </Button>
      </div>

      {!analysis || !analysis.sampleSize ? (
        <p className="text-xs text-slate-400">
          Fetch a player to see performance metrics.
        </p>
      ) : (
        <>
          <div className="mb-4 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
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

          {analysis.suggestions?.length ? (
            <div className="mt-2">
              <h3 className="mb-1 text-[11px] font-semibold text-slate-200">
                Suggestions
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-[11px] text-slate-300">
                {analysis.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
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
