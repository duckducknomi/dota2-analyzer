import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type TopBarProps = {
  playerId: string;
  onPlayerIdChange: (value: string) => void;
  onFetch: () => void;
  loading: boolean;
};

export function TopBar({
  playerId,
  onPlayerIdChange,
  onFetch,
  loading,
}: TopBarProps) {
  return (
    <header className="border-b border-white/5 bg-[color:var(--analyzer-nav)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.svg"
            alt="Dota 2 Analyzer logo"
            width={180}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        {/* Search bar */}
        <div className="flex max-w-md flex-1 items-center gap-2">
          <Input
            placeholder="Enter account ID / steam32 id"
            value={playerId}
            onChange={(e) => onPlayerIdChange(e.target.value)}
            className="h-9 border-transparent bg-[#111827] text-xs text-slate-100 placeholder:text-slate-500"
          />
          <Button
            onClick={onFetch}
            disabled={loading}
            className="h-9 px-4 text-xs font-medium bg-[color:var(--analyzer-accent)] hover:bg-[color:var(--analyzer-accent)]/90 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Fetch"}
          </Button>
        </div>
      </div>
    </header>
  );
}
