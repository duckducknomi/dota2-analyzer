"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PlayerSummaryCard } from "@/components/dashboard/player-summary-card";
import { PerformanceOverviewCard } from "@/components/dashboard/performance-overview-card";
import { AICoachCard } from "@/components/dashboard/ai-coach-card";
import { RecentMatchesCard } from "@/components/dashboard/recent-matches-card";
import { Analysis, ApiResponse } from "@/lib/types";

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

  const analysis = data?.analysis as Analysis | undefined;

  return (
    <main className="min-h-screen bg-(--analyzer-bg) text-slate-100">
      {/* Top nav */}
      <TopBar
        playerId={playerId}
        onPlayerIdChange={setPlayerId}
        onFetch={handleFetch}
        loading={loading}
      />

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
            <PlayerSummaryCard
              profile={data?.profile ?? null}
              analysis={analysis ?? null}
            />
            <PerformanceOverviewCard
              analysis={analysis ?? null}
              onGenerateCoach={handleCoach}
              coachLoading={coachLoading}
              hasCoach={!!coach}
            />
          </div>

          <AICoachCard coach={coach} />
        </div>

        {/* Bottom row: recent matches */}
        <RecentMatchesCard recentMatches={data?.recentMatches ?? null} />

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

