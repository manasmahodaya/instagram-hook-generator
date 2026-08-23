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

Improve this hook without changing its core idea, position, meaning, or factual basis.

Rules:
- Keep the improved hook under 12 words.
- Preserve the original meaning and factual basis.
- Improve the wording, not the underlying claim.
- Do NOT introduce a new idea.
- Do NOT introduce a stronger, more negative, more positive, more alarming, or more controversial claim than the original.
- Do NOT change the original position, conclusion, accusation, recommendation, or implication.
- NEVER introduce a new statistic, percentage, number, date, result, claim, fact, guarantee, testimonial, or specific outcome that is not already present in the original hook or supplied context.
- If the original hook contains a number or factual claim, you may keep or rephrase it, but do not increase, decrease, change, or invent it.
- Do not turn an uncertain statement into a factual claim.
- Do not invent evidence to make the hook sound more compelling.
- Make the hook sharper, shorter, more specific and more natural where possible.
- Use Indian context only when genuinely relevant and supported by the supplied context.
- Avoid fake claims, misleading clickbait and fabricated urgency.
- Avoid generic AI language.
- Make the opening words strong enough to stop a scroll.
- The improvement should be meaningfully better, not just different.
- If the original hook is already strong, make only a light improvement rather than adding unsupported details.
- Keep the same basic audience intent and topic.
- The improved hook should feel like a better version of the original hook, not a completely new hook.

Before returning your answer, silently check:
1. Did I preserve the original claim?
2. Did I introduce any new fact, number, statistic, accusation, promise, or implication?
3. Did I change the original position or meaning?
4. If yes to any of these, rewrite the improved hook.

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
