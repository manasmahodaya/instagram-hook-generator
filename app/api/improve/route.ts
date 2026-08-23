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

    const prompt = `You are a careful Instagram hook COPY EDITOR.

Your job is NOT to create a new hook.

Your job is to make the ORIGINAL hook slightly clearer, tighter, more natural, or more engaging while preserving exactly what the original hook means.

ORIGINAL HOOK:
"${hook}"

NICHE:
${niche}

TARGET AUDIENCE:
${audience}

GOAL:
${goal}

STRICT EDITING RULES:

1. Make the SMALLEST possible change.
2. Preserve the original meaning exactly.
3. Do not introduce a new idea.
4. Do not introduce a new claim.
5. Do not strengthen or weaken the original claim.
6. Do not change the original accusation, criticism, opinion, recommendation, promise, implication, or conclusion.
7. Do not introduce statistics, percentages, numbers, dates, facts, results, guarantees, testimonials, or outcomes.
8. Do not introduce a new reason, explanation, cause, consequence, or interpretation.
9. Do not change the meaning of words merely to make the hook sound more dramatic.
10. Preserve named entities exactly as written. For example, if the original says "RBI", keep "RBI".
11. Preserve important phrases that carry meaning. Do not replace them with a different claim.
12. You may fix grammar, remove unnecessary words, improve word order, improve readability, or make the opening slightly stronger.
13. You may use a question format only if the original meaning remains exactly the same.
14. Do not add emotional language such as "sabotaging", "destroying", "secret", "shocking", "scam", "warning", etc. unless that exact idea already exists in the original.
15. Do not invent urgency or curiosity.
16. Do not assume information that is not present in the original hook.
17. If the original hook is already clear and strong, RETURN THE ORIGINAL HOOK UNCHANGED.
18. If you are unsure whether an edit changes the meaning, RETURN THE ORIGINAL HOOK UNCHANGED.
19. The improved hook should normally be between 5 and 12 words, but NEVER shorten it if doing so changes its meaning.
20. This is an EDITING task, not a rewriting task.

IMPORTANT TEST:

Original:
"You're investing wrong. Here's what RBI won't say."

A valid improvement could be:
"You're investing wrong. Here's what RBI won't say."

because preserving the meaning is more important than changing the wording.

An INVALID improvement would be:
"Your investment strategy is wrong. Here's why RBI won't tell you."

because it changes the wording and implication.

Another INVALID improvement would be:
"RBI doesn't want you to know you're investing wrong."

because it creates a new implication.

Before responding, compare the improved hook with the original word by word and concept by concept.

If ANY new idea, claim, implication, fact, accusation, reason, or interpretation has been introduced, return the ORIGINAL HOOK.

Return ONLY valid JSON:

{
  "improved": "hook",
  "why": "Briefly explain the editing change. If unchanged, say that the original was already strong and was preserved to avoid changing its meaning.",
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
          temperature: 0,
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

    if (!result.improved) {
      throw new Error("Missing improved hook");
    }

    return NextResponse.json({
      improved: result.improved,
      why: result.why || "The original hook was preserved.",
      bestFor: result.bestFor || goal,
    });
  } catch (error) {
    console.error("Hook improvement error:", error);

    return NextResponse.json(
      { error: "Failed to improve hook. Please try again." },
      { status: 500 }
    );
  }
}
