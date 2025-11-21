import { NextResponse } from "next/server";
import type { HeroMeta } from "@/lib/types";

type OpenDotaHero = {
  id: number;
  localized_name: string;
  icon: string; // relative icon path
};

export async function GET() {
  try {
    const res = await fetch("https://api.opendota.com/api/heroStats", {
      // cache 1 hour on the server
      next: { revalidate: 60 * 60 },
    });

    if (!res.ok) {
      console.error("Failed to fetch heroStats from OpenDota:", res.status);
      return NextResponse.json(
        { error: "Failed to load heroes" },
        { status: 500 }
      );
    }

    const raw = (await res.json()) as OpenDotaHero[];

    const heroes: HeroMeta[] = raw.map((h) => ({
      id: h.id,
      localizedName: h.localized_name,
      // OpenDota gives a relative icon path like `/apps/dota2/...`
      iconUrl: `https://cdn.cloudflare.steamstatic.com${h.icon}`,
    }));

    return NextResponse.json({ heroes });
  } catch (e) {
    console.error("Error in /api/heroes:", e);
    return NextResponse.json(
      { error: "Failed to load heroes" },
      { status: 500 }
    );
  }
}
