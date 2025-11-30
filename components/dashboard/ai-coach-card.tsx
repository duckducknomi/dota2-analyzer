import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AICoachCardProps = {
  coach: string | null;
  onGenerateCoach: () => void;
  coachLoading: boolean;
  hasAnalysis: boolean;
};

export function AICoachCard({
  coach,
  onGenerateCoach,
  coachLoading,
  hasAnalysis,
}: AICoachCardProps) {
  const insights = coach ? parseInsights(coach) : [];

  return (
    <Card className="flex flex-col gap-4 rounded-xl border-0 bg-[color:var(--analyzer-card)] px-6 py-5">
      {/* Header: title + blue CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          AI Coach Insights
        </h2>

        <Button
          onClick={onGenerateCoach}
          disabled={!hasAnalysis || coachLoading}
          className="h-8 px-4 text-[11px] font-semibold bg-blue-500 text-white hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {coachLoading
            ? "Generating AI Coaching..."
            : coach
            ? "Regenerate AI Coaching"
            : "Generate AI Coaching"}
        </Button>
      </div>

      {/* Body */}
      {!coach ? (
        <div className="rounded-lg bg-[color:var(--analyzer-nav)] px-5 py-4 text-xs text-slate-400">
          <p>
            Generate AI coaching from your recent matches to get a set of clear,
            role-aware insights about how you&apos;re currently playing.
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-[color:var(--analyzer-nav)] px-5 py-4 max-h-[420px] overflow-y-auto">
          {insights.length === 0 ? (
            <p className="text-sm leading-relaxed text-slate-100">{coach}</p>
          ) : (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-200">
                Key Insights
              </h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-100/90">
                {insights.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * Extract just the bullet-style insights from the coaching text.
 * It looks for a "## Key Insights" section and pulls bullet lines.
 * If none found, it splits the whole thing into sentences.
 */
function parseInsights(coach: string): string[] {
  const normalized = coach.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const insightsMatch = normalized.match(/##\s*Key Insights\b([\s\S]*)/i);
  let block = insightsMatch ? insightsMatch[1].trim() : normalized;

  const lines = block.split("\n").map((l) => l.trim());
  const insights: string[] = [];

  for (const line of lines) {
    if (!line) continue;
    const cleaned = line.replace(/^[-*•]\s*/, "").trim();
    if (cleaned) insights.push(cleaned);
  }

  if (insights.length === 0) {
    const sentences = block
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    insights.push(...sentences);
  }

  return insights;
}
