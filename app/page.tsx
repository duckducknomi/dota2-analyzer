"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ApiResponse } from "@/lib/types";

export default function LandingPage() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = playerId.trim();

    if (!trimmed) {
      setError("Please enter your Steam32 ID or Dota account ID.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // Validate / pre-fetch player so we can show a friendly error here
      const res = await fetch(`/api/player/${trimmed}`);
      const json = (await res.json()) as ApiResponse;

      if (!res.ok || json.error) {
        setError(
          json.error || "Could not load player. Check the ID and try again."
        );
        setSubmitting(false);
        return;
      }

      // All good → go to dashboard for this player
      router.push(`/player/${trimmed}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[color:var(--analyzer-bg)] text-slate-100 flex flex-col">
      {/* Top nav */}
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-blue-400" />
            <span className="text-sm font-semibold text-slate-100">
              Dota 2 Analyzer
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12 lg:py-16">
          {/* Hero */}
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)]">
            {/* Left: text + form */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
                AI Coaching for Your
                <br />
                Last 20 Dota 2 Games
              </h1>

              <p className="mt-4 max-w-xl text-sm text-slate-400">
                Paste your Steam32 / Dota account ID and we&apos;ll analyze your
                recent public matches to give you a focused plan for what to fix
                in your next games.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-6 flex max-w-xl flex-col gap-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    placeholder="Enter Steam32 ID / Dota account ID"
                    className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-400 disabled:opacity-60"
                  >
                    {submitting ? "Checking..." : "Start Coaching"}
                  </button>
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <p className="text-[11px] text-slate-500">
                  We only read public match history. Nothing is stored.
                </p>
              </form>
            </div>

            {/* Right: example analysis preview */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-2xl bg-[color:var(--analyzer-card)] p-3 shadow-sm">
                <div className="overflow-hidden rounded-xl bg-black/40">
                  {/* Replace src with your actual dashboard preview screenshot in /public */}
                  <Image
                    src="/landing-dashboard-preview.png"
                    alt="Example analysis dashboard"
                    width={640}
                    height={360}
                    className="h-auto w-full object-cover"
                  />
                </div>
                <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Example Analysis
                </p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="space-y-4">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              How it works
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[color:var(--analyzer-card)] px-4 py-4 text-sm">
                <p className="font-semibold text-slate-100">Paste your ID</p>
                <p className="mt-1 text-xs text-slate-400">
                  Enter your Steam32 or Dota account ID to get started. We use
                  your public match history only.
                </p>
              </div>
              <div className="rounded-2xl bg-[color:var(--analyzer-card)] px-4 py-4 text-sm">
                <p className="font-semibold text-slate-100">
                  We analyze your games
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  We look at your last 20 matches to find patterns in your
                  performance, roles, and hero choices.
                </p>
              </div>
              <div className="rounded-2xl bg-[color:var(--analyzer-card)] px-4 py-4 text-sm">
                <p className="font-semibold text-slate-100">
                  AI coach gives you a plan
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Get focused, actionable advice on what to change in your next
                  games to actually improve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <p className="text-center text-[11px] text-slate-500">
            Uses OpenDota public data. Not affiliated with Valve or Dota 2.
          </p>
        </div>
      </footer>
    </main>
  );
}
