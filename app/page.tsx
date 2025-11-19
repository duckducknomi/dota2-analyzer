"use client";

import { useState } from "react";

type ApiPlayerResponse = {
  player: any;
  recentMatches: any[];
};

export default function Home() {
  const [accountId, setAccountId] = useState("");
  const [data, setData] = useState<ApiPlayerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFetch() {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/player/${accountId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch");
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError("Could not fetch player data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Dota 2 Analyzer</h1>

        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2 bg-background"
            placeholder="Enter Steam32 account id"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
          <button
            onClick={handleFetch}
            disabled={loading || !accountId}
            className="px-4 py-2 rounded border"
          >
            {loading ? "Loading..." : "Fetch"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {data && (
          <div className="space-y-4 mt-4">
            <section className="border rounded p-4">
              <h2 className="font-semibold mb-2">Player</h2>
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(data.player, null, 2)}
              </pre>
            </section>

            <section className="border rounded p-4">
              <h2 className="font-semibold mb-2">Recent Matches</h2>
              <pre className="text-xs whitespace-pre-wrap max-h-64 overflow-auto">
                {JSON.stringify(data.recentMatches.slice(0, 5), null, 2)}
              </pre>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
