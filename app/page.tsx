"use client";

import { useState } from "react";

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
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-6">Dota 2 Analyzer</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          placeholder="Enter account ID / steam32 id"
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          className="border rounded px-4 py-2 bg-black text-white disabled:opacity-60"
        >
          {loading ? "Loading..." : "Fetch"}
        </button>
      </div>

      {data?.error && <div className="text-red-600 mb-4">{data.error}</div>}

      {/* Performance summary */}
      {analysis && analysis.sampleSize > 0 && (
        <section className="mb-8 border rounded-lg p-4 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-3">
            <h2 className="text-xl font-semibold">
              Performance Summary (last {analysis.sampleSize} matches)
            </h2>

            <button
              onClick={handleCoach}
              disabled={coachLoading}
              className="border rounded px-4 py-2 text-sm bg-black text-white disabled:opacity-60"
            >
              {coachLoading
                ? "Generating AI Coaching..."
                : "Generate AI Coaching"}
            </button>
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3 mb-4">
            <div>
              <span className="font-medium">Winrate:</span>{" "}
              {Math.round(analysis.winrate * 100)}%
            </div>
            <div>
              <span className="font-medium">Avg KDA:</span>{" "}
              {analysis.avgKDA.kills.toFixed(1)}/
              {analysis.avgKDA.deaths.toFixed(1)}/
              {analysis.avgKDA.assists.toFixed(1)} (
              {analysis.avgKDA.kda.toFixed(1)})
            </div>
            <div>
              <span className="font-medium">Avg GPM:</span>{" "}
              {analysis.avgGPM.toFixed(0)}
            </div>
            <div>
              <span className="font-medium">Avg XPM:</span>{" "}
              {analysis.avgXPM.toFixed(0)}
            </div>
            <div>
              <span className="font-medium">Avg Hero Damage:</span>{" "}
              {Math.round(analysis.avgHeroDamage).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Avg Last Hits:</span>{" "}
              {analysis.avgLastHits.toFixed(0)}
            </div>
            {analysis.primaryRole && (
              <div>
                <span className="font-medium">Primary Role:</span>{" "}
                {analysis.primaryRole}
              </div>
            )}
            <div>
              <span className="font-medium">Hero Pool:</span>{" "}
              {analysis.heroPoolSize} heroes
            </div>
          </div>

          <div className="mt-2">
            <h3 className="font-semibold mb-1 text-sm">Suggestions</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {analysis.suggestions?.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* AI Coach panel */}
      {coachError && (
        <div className="text-red-600 mb-4 text-sm">{coachError}</div>
      )}

      {coach && (
        <section className="mb-8 border rounded-lg p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">AI Coach</h2>
          {/* very simple markdown-ish rendering; you can swap to react-markdown later */}
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: coach.replace(/\n/g, "<br/>") }}
          />
        </section>
      )}

      {data?.profile && (
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Player</h2>
          <pre className="text-xs bg-gray-100 rounded p-3 overflow-auto">
            {JSON.stringify(data.profile, null, 2)}
          </pre>
        </section>
      )}

      {data?.recentMatches && (
        <section>
          <h2 className="font-semibold mb-2">Recent Matches</h2>
          <pre className="text-xs bg-gray-100 rounded p-3 overflow-auto">
            {JSON.stringify(data.recentMatches, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}
