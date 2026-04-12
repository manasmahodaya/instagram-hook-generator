import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(niche: string, audience: string, goal: string, count: number) {
  const pain = Math.round(count * 0.3);
  const cur = Math.round(count * 0.3);
  const con = Math.round(count * 0.2);
  const auth = count - pain - cur - con;

  return `You are a viral Instagram content strategist for the Indian market.

Generate ${count} scroll-stopping Instagram hooks for:
- Niche: ${niche}
- Target Audience: ${audience}
- Goal: ${goal}

STRICT RULES:
- Every hook must be under 12 words
- Simple 8th-grade language
- Include Indian context where relevant (₹, salary, EMI, jobs, middle class, family pressure)
- No generic phrases — every hook must be unique and scroll-stopping
- Use "you" to make it personal

Return ONLY valid JSON with exactly these keys and exactly these counts:
{
  "pain": [array of ${pain} pain hooks — money stress, career frustration, regret, FOMO with real ₹ amounts and job situations],
  "curiosity": [array of ${cur} curiosity hooks using open loops, secrets, unexpected outcomes],
  "contrarian": [array of ${con} contrarian hooks that challenge common beliefs, slightly shocking but believable],
  "authority": [array of ${auth} authority hooks using story, credibility, or personal transformation]
}`;
}

export async function POST(req: NextRequest) {
  try {
    const { niche, audience, goal, count } = await req.json();

    if (!niche || !audience || !goal || !count) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: buildPrompt(niche, audience, goal, count) }],
    });

    const text = message.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format");

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Hook generation error:", error);
    return NextResponse.json({ error: "Failed to generate hooks" }, { status: 500 });
  }
}
