import { NextResponse } from "next/server";
import { fetchPlayer, fetchRecentMatches } from "@/lib/dota-api";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 👈 unwrap the Promise
  const accountId = id;

  if (!accountId) {
    return NextResponse.json({ error: "Missing player id" }, { status: 400 });
  }

  try {
    const [player, recentMatches] = await Promise.all([
      fetchPlayer(accountId),
      fetchRecentMatches(accountId),
    ]);

    return NextResponse.json({ player, recentMatches });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch player data" },
      { status: 500 }
    );
  }
}
