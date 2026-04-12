import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

Return ONLY valid JSON with exactly these keys and counts:
{
  "pain": [array of ${pain} pain hooks about money stress, career frustration, regret, FOMO with real ₹ amounts],
  "curiosity": [array of ${cur} curiosity hooks using open loops, secrets, unexpected outcomes],
  "contrarian": [array of ${con} contrarian hooks challenging common beliefs],
  "authority": [array of ${auth} authority hooks using story, credibility, transformation]
}`;
}

export async function POST(req: NextRequest) {
  try {
    const { niche, audience, goal, count } = await req.json();

    if (!niche || !audience || !goal || !count) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a viral Instagram content strategist for the Indian market. Always respond with valid JSON only — no markdown, no explanation.",
        },
        {
          role: "user",
          content: buildPrompt(niche, audience, goal, count),
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    const text = response.choices[0]?.message?.content || "";
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Hook generation error:", error);
    return NextResponse.json({ error: "Failed to generate hooks" }, { status: 500 });
  }
}
