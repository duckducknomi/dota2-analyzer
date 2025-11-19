// app/page.tsx
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

  async function handleFetch() {
    if (!playerId) return;
    setLoading(true);
    setData(null);

    try {
      const res = await fetch(`/api/player/${playerId}`);
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (e) {
      console.error(e);
      setData({ error: "Failed to fetch" });
    } finally {
      setLoading(false);
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

      {analysis && (
        <section className="mb-8 border rounded-lg p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">
            Performance Summary (last {analysis.sampleSize} matches)
          </h2>
          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
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
              {analysis.avgHeroDamage.toFixed(0)}
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

          <div className="mt-4">
            <h3 className="font-semibold mb-1 text-sm">Suggestions</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {analysis.suggestions?.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
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
