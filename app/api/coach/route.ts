// app/api/coach/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { profile, analysis } = body ?? {};

    if (!analysis) {
      return NextResponse.json(
        { error: "Missing analysis in request body" },
        { status: 400 }
      );
    }

    const playerName =
      profile?.profile?.personaname || profile?.profile?.name || "the player";

    // We’ll just give the model one well-structured prompt.
    const prompt = `
You are a highly skilled Dota 2 coach.

You receive structured stats about a single player: recent performance, hero pool,
role tendencies and basic rule-based suggestions.

Your job:
- Summarize the player's current form.
- Highlight 3–5 strengths and 3–5 weaknesses.
- Give a concrete, actionable improvement plan for the next 10–20 games.
- Tailor advice to their main role and stats.
- Avoid generic advice that doesn't relate to the numbers.
- Keep the tone friendly but honest.

Player name: ${playerName}

Structured analysis JSON:
${JSON.stringify(analysis, null, 2)}

Use ONLY the analysis above. Do NOT invent extra stats.

Format your answer in Markdown with these sections exactly:

## Overview
Short summary of how they are playing recently.

## Strengths
Bullet list.

## Weaknesses
Bullet list.

## 10-Game Action Plan
Numbered list of specific things to focus on in the next 10 games (item builds, laning, map movement, teamplay, etc.).
`.trim();

    const response = await openai.responses.create({
      // 👇 use a model you actually have (this one should work)
      model: "gpt-4.1-mini",
      input: prompt,
    });

    // The JS client exposes a convenience field for text:
    // https://platform.openai.com/docs/api-reference/responses
    const coachText =
      (response as any).output_text || "No coaching advice generated.";

    return NextResponse.json({ coach: coachText });
  } catch (err) {
    console.error("Coach API error:", err);
    return NextResponse.json(
      { error: "Failed to generate coaching advice" },
      { status: 500 }
    );
  }
}
