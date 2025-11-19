// app/api/player/[id]/route.ts
import { NextResponse } from "next/server";
import { analyzePlayer } from "@/lib/analyze/playerAnalysis";
import { PlayerProfile, RecentMatch } from "@/lib/dotaTypes";

type Params = { params: Promise<{ id: string }> }; // for newer Next.js where params is a Promise

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const accountId = id;

  if (!accountId) {
    return NextResponse.json({ error: "Missing player id" }, { status: 400 });
  }

  try {
    // Adjust endpoints if you already use specific ones
    const [profileRes, recentMatchesRes] = await Promise.all([
      fetch(`https://api.opendota.com/api/players/${accountId}`, {
        next: { revalidate: 60 },
      }),
      fetch(`https://api.opendota.com/api/players/${accountId}/recentMatches`, {
        next: { revalidate: 60 },
      }),
    ]);

    if (!profileRes.ok) {
      throw new Error(`Failed to fetch profile: ${profileRes.status}`);
    }
    if (!recentMatchesRes.ok) {
      throw new Error(
        `Failed to fetch recent matches: ${recentMatchesRes.status}`
      );
    }

    const profile = (await profileRes.json()) as PlayerProfile;
    const recentMatches = (await recentMatchesRes.json()) as RecentMatch[];

    const analysis = analyzePlayer(profile, recentMatches);

    return NextResponse.json({
      profile,
      recentMatches,
      analysis,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch player data" },
      { status: 500 }
    );
  }
}
