import { NextRequest, NextResponse } from "next/server";

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

Return ONLY valid JSON, no markdown, no explanation:
{
  "pain": [array of ${pain} pain hooks],
  "curiosity": [array of ${cur} curiosity hooks],
  "contrarian": [array of ${con} contrarian hooks],
  "authority": [array of ${auth} authority hooks]
}`;
}

export async function POST(req: NextRequest) {
  try {
    const { niche, audience, goal, count } = await req.json();

    if (!niche || !audience || !goal || !count) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        messages: [{ role: "user", content: buildPrompt(niche, audience, goal, count) }],
      }),
    });

    const data = await response.json();
    const text = data.content?.map((b: {type: string; text?: string}) => b.text || "").join("") || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format");

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Hook generation error:", error);
    return NextResponse.json({ error: "Failed to generate hooks"
