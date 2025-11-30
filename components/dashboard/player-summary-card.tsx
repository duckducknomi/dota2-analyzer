import { Card } from "@/components/ui/card";
import { Analysis, PlayerProfile } from "@/lib/types";

type PlayerSummaryCardProps = {
  profile?: PlayerProfile | null;
  analysis?: Analysis | null;
};

export function PlayerSummaryCard({
  profile,
  analysis,
}: PlayerSummaryCardProps) {
  const playerName = profile?.personaname ?? "Player name";
  const avatar = profile?.avatarfull ?? null;

  return (
    <Card className="flex items-center gap-4 rounded-xl border-0 bg-(--analyzer-card) px-5 py-4">
      {/* Avatar */}
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full overflow-hidden bg-slate-900">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={playerName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-slate-400">?</span>
        )}
      </div>

      {/* Text */}
      <div className="flex min-w-0 flex-col">
        {/* Name */}
        <p className="max-w-xs truncate text-sm font-semibold text-slate-50">
          {playerName}
        </p>
      </div>
    </Card>
  );
}
