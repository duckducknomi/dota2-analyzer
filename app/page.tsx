"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ApiResponse = {
  profile?: any;
  recentMatches?: any[];
  analysis?: any;
  error?: string;
};

export default function HomePage() {
  const [playerId, setPlayerId] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [coach, setCoach] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  async function handleFetch() {
    if (!playerId) return;
    setLoading(true);
    setData(null);
    setCoach(null);
    setCoachError(null);

    try {
      const res = await fetch(`/api/player/${playerId}`);
      const json = (await res.json()) as ApiResponse;
      setData(json);
      if (json.error) {
        setCoach(null);
      }
    } catch (e) {
      console.error(e);
      setData({ error: "Failed to fetch" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCoach() {
    if (!data?.analysis) return;

    setCoachLoading(true);
    setCoachError(null);
    setCoach(null);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: data.profile,
          analysis: data.analysis,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setCoachError(json.error || "Failed to generate coaching advice");
        return;
      }

      // json.coach is the markdown/markdown-ish string
      setCoach(json.coach);
    } catch (e) {
      console.error(e);
      setCoachError("Failed to generate coaching advice");
    } finally {
      setCoachLoading(false);
    }
  }

  const analysis = data?.analysis;

  return (
    <main className="min-h-screen bg-[color:var(--analyzer-bg)] text-slate-100">
      {/* Top nav */}
      <header className="border-b border-white/5 bg-[color:var(--analyzer-nav)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          {/* Logo + title */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[color:var(--analyzer-accent)]" />
            <span className="text-sm font-semibold tracking-tight">
              Dota 2 Analyzer
            </span>
          </div>

          {/* Search bar */}
          <div className="flex max-w-md flex-1 items-center gap-2">
            <Input
              placeholder="Enter account ID / steam32 id"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="h-9 border-transparent bg-[#111827] text-xs text-slate-100 placeholder:text-slate-500"
            />
            <Button
              onClick={handleFetch}
              disabled={loading}
              className="h-9 px-4 text-xs font-medium bg-[color:var(--analyzer-accent)] hover:bg-[color:var(--analyzer-accent)]/90 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Fetch"}
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* Errors */}
        {data?.error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {data.error}
          </div>
        )}
        {coachError && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {coachError}
          </div>
        )}

        {/* Top row: left column (player + performance), right column (AI coach) */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-6">
            <PlayerSummaryCard profile={data?.profile} analysis={analysis} />
            <PerformanceOverviewCard
              analysis={analysis}
              onGenerateCoach={handleCoach}
              coachLoading={coachLoading}
              hasCoach={!!coach}
            />
          </div>

          <AICoachCard coach={coach} />
        </div>

        {/* Bottom row: recent matches */}
        <RecentMatchesCard recentMatches={data?.recentMatches} />

        {/* Debug JSON (keep for now, can delete later) */}
        {data?.profile && (
          <section className="mt-8">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Debug · Profile
            </h2>
            <pre className="max-h-64 overflow-auto rounded bg-black/40 p-3 text-[10px] text-slate-200">
              {JSON.stringify(data.profile, null, 2)}
            </pre>
          </section>
        )}

        {data?.recentMatches && (
          <section className="mt-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Debug · Recent Matches
            </h2>
            <pre className="max-h-64 overflow-auto rounded bg-black/40 p-3 text-[10px] text-slate-200">
              {JSON.stringify(data.recentMatches, null, 2)}
            </pre>
          </section>
        )}
      </section>
    </main>
  );
}

/* ====================== CARDS ====================== */

function PlayerSummaryCard({
  profile,
  analysis,
}: {
  profile?: any;
  analysis?: any;
}) {
  // Placeholder name / mmr if we don’t have real profile data yet
  const playerName = profile?.personaname ?? "Player name";
  const avatar = profile?.avatarfull ?? null;

  return (
    <Card className="flex items-center gap-4 rounded-xl border-0 bg-[color:var(--analyzer-card)] px-5 py-4">
      {/* Avatar */}
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[color:var(--analyzer-accent)]/80 overflow-hidden">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={playerName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[10px] text-slate-100/80">Avatar</span>
        )}
      </div>

      {/* Text */}
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <p className="max-w-xs truncate text-sm font-semibold text-slate-50">
            {playerName}
          </p>
        </div>
        <p className="text-xs text-slate-400">
          {profile?.profileurl
            ? "Dota 2 Player"
            : "Enter an ID to load a player"}
        </p>
        {analysis?.sampleSize ? (
          <p className="text-[11px] text-slate-400">
            Analyzing last{" "}
            <span className="font-medium text-slate-200">
              {analysis.sampleSize}
            </span>{" "}
            matches
          </p>
        ) : (
          <p className="text-[11px] text-slate-500">No matches loaded yet.</p>
        )}
      </div>
    </Card>
  );
}

function PerformanceOverviewCard({
  analysis,
  onGenerateCoach,
  coachLoading,
  hasCoach,
}: {
  analysis?: any;
  onGenerateCoach: () => void;
  coachLoading: boolean;
  hasCoach: boolean;
}) {
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
                {analysis.suggestions.map((s: string, i: number) => (
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

function AICoachCard({ coach }: { coach: string | null }) {
  return (
    <Card className="flex flex-col gap-4 rounded-xl border-0 bg-[color:var(--analyzer-card)] px-6 py-5">
      <h2 className="text-sm font-semibold text-slate-100">
        AI Coach Insights
      </h2>

      {!coach ? (
        <div className="rounded-lg bg-[color:var(--analyzer-nav)] px-5 py-4 text-xs text-slate-400">
          <p>
            Generate AI coaching from the Performance Summary to get a breakdown
            of your strengths, weaknesses, and a focused action plan for your
            next games.
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-[color:var(--analyzer-nav)] px-5 py-4 text-sm text-slate-100">
          {/* Temporary rendering: just replace newlines with <br>. 
             We’ll swap this to a proper markdown renderer later. */}
          <div
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: coach.replace(/\n/g, "<br/>"),
            }}
          />
        </div>
      )}
    </Card>
  );
}

function RecentMatchesCard({
  recentMatches,
}: {
  recentMatches?: any[] | null;
}) {
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

          {/* Rows – VERY basic mapping from your recentMatches for now */}
          <div className="space-y-2 text-xs">
            {recentMatches.slice(0, 10).map((m: any, i: number) => {
              const won = m.radiant_win === m.player_slot < 128;
              const k = m.kills ?? 0;
              const d = m.deaths ?? 0;
              const a = m.assists ?? 0;
              const gpm = m.gold_per_min ?? 0;
              const xpm = m.xp_per_min ?? 0;
              const durationMinutes = Math.floor((m.duration ?? 0) / 60);
              const durationSeconds = (m.duration ?? 0) % 60;

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

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md bg-[#050816]/70 px-3 py-2 text-xs">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-slate-100">{children}</div>
    </div>
  );
}
