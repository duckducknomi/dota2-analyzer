// app/api/heroes/route.ts
import { NextResponse } from "next/server";
import type { HeroMeta } from "@/lib/types";

type OpenDotaHero = {
  id: number;
  name: string;
  localized_name: string;
  icon: string; // relative icon path
  img: string; // relative hero image path
};

export async function GET() {
  try {
    const res = await fetch("https://api.opendota.com/api/heroStats", {
      next: { revalidate: 60 * 60 }, // cache 1 hour
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
      name: h.name,
      localized_name: h.localized_name,
      localizedName: h.localized_name,
      icon: h.icon,
      img: h.img,
      // steamstatic CDN version (useful elsewhere, optional for RecentMatchesCard)
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
