import { useEffect, useState } from "react";
import type { HeroMeta } from "@/lib/types";

type UseHeroesResult = {
  heroesById: Record<number, HeroMeta> | null;
  loading: boolean;
  error: string | null;
};

export function useHeroes(): UseHeroesResult {
  const [heroesById, setHeroesById] = useState<Record<number, HeroMeta> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/heroes");
        if (!res.ok) {
          throw new Error("Failed to load heroes");
        }

        const json = (await res.json()) as { heroes: HeroMeta[] };
        if (cancelled) return;

        const map: Record<number, HeroMeta> = {};
        for (const hero of json.heroes) {
          map[hero.id] = hero;
        }

        setHeroesById(map);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("Failed to load heroes");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { heroesById, loading, error };
}
