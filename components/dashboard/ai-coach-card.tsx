import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AICoachCardProps = {
  coach: string | null;
};

export function AICoachCard({ coach }: AICoachCardProps) {
  return (
    <Card className="flex flex-col gap-4 rounded-xl border-0 bg-[color:var(--analyzer-card)] px-6 py-5">
      <h2 className="text-sm font-semibold text-slate-100">
        AI Coach Insights
      </h2>

      {!coach ? (
        <div className="rounded-lg bg-[color:var(--analyzer-nav)] px-5 py-4 text-xs text-slate-400">
          <p>
            Generate AI coaching from the Performance Summary to get a breakdown
            of your strengths, weaknesses, and a focused action plan for your
            next games.
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-[color:var(--analyzer-nav)] px-5 py-4 text-sm text-slate-100">
          {/* Temporary rendering: just replace newlines with <br>. 
             We’ll swap this to a proper markdown renderer later. */}
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{coach}</ReactMarkdown>
          </div>
        </div>
      )}
    </Card>
  );
}
