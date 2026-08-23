import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { hook, niche, audience, goal } = await req.json();

    if (!hook || !niche || !audience || !goal) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert Instagram hook editor for Indian creators and small businesses.

Original hook:
${hook}

Niche:
${niche}

Target audience:
${audience}

Goal:
${goal}

Improve this hook without changing its core idea.

Rules:
- Keep the improved hook under 12 words.
- Make it specific, natural and human.
- Use Indian context only when genuinely relevant.
- Avoid fake claims and clickbait.
- Avoid generic AI language.
- Make the opening words strong enough to stop a scroll.
- The improvement should be meaningfully better, not just different.

Return ONLY valid JSON in exactly this format:

{
  "improved": "improved hook",
  "why": "short explanation of why the improved hook is stronger",
  "bestFor": "Engagement, Followers, Leads, or Sales"
}`;

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("AI request failed");
    }

    const data = await response.json();

    const text =
      data.content
        ?.map(
          (block: { type: string; text?: string }) =>
            block.text || ""
        )
        .join("") || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Invalid AI response");
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Hook improvement error:", error);

    return NextResponse.json(
      { error: "Failed to improve hook. Please try again." },
      { status: 500 }
    );
  }
}
