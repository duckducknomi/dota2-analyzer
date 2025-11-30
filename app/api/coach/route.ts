// app/api/coach/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Analysis, PlayerProfile } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type NestedPlayerProfile = { profile: PlayerProfile | null };

function isNestedPlayerProfile(value: unknown): value is NestedPlayerProfile {
  return !!value && typeof value === "object" && "profile" in value;
}

type CoachRequestBody = {
  profile?: PlayerProfile | NestedPlayerProfile | null;
  analysis?: Analysis | null;
};

function extractPlayerProfile(
  profile: CoachRequestBody["profile"]
): PlayerProfile | null {
  if (isNestedPlayerProfile(profile)) {
    return profile.profile ?? null;
  }

  return profile ?? null;
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server" },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json()) as CoachRequestBody | null;
    const { profile, analysis } = body ?? {};

    if (!analysis) {
      return NextResponse.json(
        { error: "Missing analysis in request body" },
        { status: 400 }
      );
    }

    const playerProfile = extractPlayerProfile(profile);
    const playerName =
      playerProfile?.personaname || playerProfile?.name || "the player";

    // Phase 8: compact, role-aware coaching focused on a small set of concrete insights
    const prompt = `
You are a professional Dota 2 coach.

You are given structured stats for one player (usually their last 15–25 public matches).
Use these stats to produce a short, role-aware set of coaching insights that describe how
they currently play and where they are most clearly off from expectations for their role.

Player: ${playerName}

OBJECTIVE
- Do NOT produce a long essay or a 10-game action plan.
- Instead, give:
  1) A short overall summary of their current playstyle and performance.
  2) A focused list of concrete insights about their tendencies (both good and bad).

These insights should read like observations a coach would say, for example:
- "You mostly play core heroes but your deaths are very high for that role."
- "You play support but buy fewer wards than is typical when your team is behind."
- "You favor strong early-game laners but many of your games slip away after the laning stage."

Only use patterns that are actually supported by the JSON.

CONTENT & LENGTH CONSTRAINTS
- Overview: at most 3–4 sentences total.
- Key insights: 4–7 bullet points.
- Each bullet: 1 sentence, 2 sentences maximum.
- Prioritize the 3–4 most important issues and a couple of notable strengths.
- Do NOT try to cover every stat; focus on what matters most.

STRICT ACCURACY RULES
- NEVER infer time-based metrics (e.g., last hits at 10 minutes, net worth at 20 minutes)
  unless they are explicitly included in the JSON. If a stat is not provided, do not guess it.
- Do NOT mention last hits, denies, lane CS, or similar laning CS metrics at all unless
  the JSON explicitly contains those values.
- Do not prescribe specific numeric goals (e.g., "3000 tower damage", "600 GPM")
  unless similar numbers or ranges appear in the JSON.
- If the JSON does not contain a given stat, you may still mention the general concept
  (e.g., "objectives", "deaths", "tower pressure"), but do NOT fabricate specific values,
  thresholds, or averages for it.
- Only talk about warding, vision, or support-item economy if the JSON clearly includes ward
  or vision-related stats.
- Only identify a wide hero pool as a *weakness* if the JSON clearly shows inconsistency
  across heroes or performance drop-offs when switching heroes or roles.
- Only describe a wide hero pool as a *strength* if the JSON clearly shows consistently
  good performance across many heroes and roles. Otherwise, treat it neutrally or as a
  potential weakness if inconsistency is visible.
- Be careful with small samples on specific heroes (3–4 games is not enough to be harsh
  without clear supporting patterns).

ROLE & EXPECTATION REASONING
- Infer their likely primary roles (e.g., mostly cores vs mostly supports) from the JSON
  if possible (e.g., position data, item builds, farm stats).
- Compare behavior to what is typical for that role:
  - Cores: farm, deaths, tower/objective contribution, lane outcomes.
  - Supports: deaths vs impact, wards/vision (only if stats are present), utility item usage.
- When discussing winrate, tie it to visible patterns in the JSON (e.g., strong on a few heroes,
  weak on others; better in certain roles; correlation with deaths or objectives) instead of
  generic statements.

OUTPUT FORMAT (MARKDOWN)
You MUST follow this exact Markdown structure:

## Overview
A short paragraph (3–4 sentences) summarizing how ${playerName} has been playing recently:
their general style, roles, and overall performance trends. Do not list raw stats; describe
them in words and tie them to patterns visible in the JSON.

## Key Insights
A bullet list of 4–7 items. Each item:
- Is 1–2 sentences.
- Is clearly grounded in patterns from the JSON.
- Can be either a positive or negative observation, but should focus on the most impactful
  tendencies (e.g., very high deaths for a core, inconsistent performance across heroes,
  strong impact on a small hero pool, low objective contribution for a farming role, etc.).
Avoid vague filler insights. Each bullet should say something concrete and useful.

Here is the player's structured analysis JSON:

${JSON.stringify(analysis, null, 2)}

Using ONLY this JSON and the rules above, write the coaching sections in Markdown.
`.trim();

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const coachText = response.output_text || "No coaching advice generated.";

    return NextResponse.json({ coach: coachText });
  } catch (err) {
    console.error("Coach API error:", err);
    return NextResponse.json(
      { error: "Failed to generate coaching advice" },
      { status: 500 }
    );
  }
}
