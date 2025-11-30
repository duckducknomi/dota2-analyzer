"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { TopBar } from "@/components/layout/TopBar";
import { PlayerSummaryCard } from "@/components/dashboard/player-summary-card";
import { PerformanceOverviewCard } from "@/components/dashboard/performance-overview-card";
import { AICoachCard } from "@/components/dashboard/ai-coach-card";
import { RecentMatchesCard } from "@/components/dashboard/recent-matches-card";
import { Analysis, ApiResponse, PlayerProfile } from "@/lib/types";
import { useHeroes } from "@/lib/hooks/useHeroes";

type RawProfile =
  | PlayerProfile
  | { profile?: PlayerProfile | null }
  | null
  | undefined;

function normalizeProfile(raw: RawProfile): PlayerProfile | null {
  if (!raw) return null;

  if (typeof raw === "object" && "profile" in raw && raw.profile) {
    return raw.profile as PlayerProfile;
  }

  return raw as PlayerProfile;
}

type RawApiResponse = {
  profile?: RawProfile;
  recentMatches?: ApiResponse["recentMatches"];
  analysis?: Analysis | null;
  error?: string;
};

export default function PlayerPage() {
  const params = useParams<{ id: string }>();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [playerId, setPlayerId] = useState(routeId ?? "");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [coach, setCoach] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  const { heroesById } = useHeroes();
  const analysis = data?.analysis as Analysis | undefined;

  async function fetchPlayer(id: string) {
    if (!id) return;
    setLoading(true);
    setData(null);
    setCoach(null);
    setCoachError(null);

    try {
      const res = await fetch(`/api/player/${id}`);
      const raw = (await res.json()) as RawApiResponse;

      const normalized: ApiResponse = {
        profile: normalizeProfile(raw.profile ?? null),
        recentMatches: raw.recentMatches ?? null,
        analysis: raw.analysis ?? null,
        error: raw.error,
      };

      setData(normalized);

      if (normalized.error) {
        setCoach(null);
      }
    } catch (e) {
      console.error(e);
      setData({ error: "Failed to fetch" });
    } finally {
      setLoading(false);
    }
  }

  async function handleFetch() {
    if (!playerId) return;
    await fetchPlayer(playerId);
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

      setCoach(json.coach);
    } catch (e) {
      console.error(e);
      setCoachError("Failed to generate coaching advice");
    } finally {
      setCoachLoading(false);
    }
  }

  useEffect(() => {
    if (routeId) {
      setPlayerId(routeId);
      fetchPlayer(routeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  return (
    <main className="min-h-screen bg-(--analyzer-bg) text-slate-100">
      <TopBar
        playerId={playerId}
        onPlayerIdChange={setPlayerId}
        onFetch={handleFetch}
        loading={loading}
      />

      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
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

        {/* Top row: left (player + performance), right (AI coach) */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-6">
            <PlayerSummaryCard
              profile={data?.profile ?? null}
              analysis={analysis ?? null}
            />
            <PerformanceOverviewCard analysis={analysis ?? null} />
          </div>

          <AICoachCard
            coach={coach}
            onGenerateCoach={handleCoach}
            coachLoading={coachLoading}
            hasAnalysis={!!analysis}
          />
        </div>

        {/* Bottom: recent matches */}
        <RecentMatchesCard
          recentMatches={data?.recentMatches}
          heroesById={heroesById}
        />
      </section>
    </main>
  );
}
