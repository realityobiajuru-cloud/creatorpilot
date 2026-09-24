import { NextResponse } from "next/server";
import { generateText } from "@/lib/ai/gemini";

const LENGTH_GUIDE: Record<string, string> = {
  short: "This is a SHORT-FORM video (30-60 seconds total spoken). Keep each section very tight: Hook 1-2 sentences, Introduction 1-2 sentences, Main Content 3-5 sentences, Transitions 1 sentence, Payoff 2-3 sentences, CTA 1-2 sentences. Total spoken word count should be roughly 100-150 words across the whole script.",
  medium: "This is a MEDIUM-length video (2-4 minutes total spoken). Each section should be a solid paragraph: Hook 2-3 sentences, Introduction 3-4 sentences, Main Content 2-3 paragraphs, Transitions 2-3 sentences, Payoff 2-3 sentences, CTA 2-3 sentences. Total spoken word count should be roughly 350-550 words across the whole script.",
  long: "This is a LONG-FORM video (8-15 minutes total spoken). Each section should be substantial: Hook 3-4 sentences, Introduction 1-2 full paragraphs, Main Content 4-8 full paragraphs with depth and detail, Transitions several sentences, Payoff 2-3 full paragraphs, CTA 2-3 sentences. Total spoken word count should be roughly 1200-2000 words across the whole script.",
};

export async function POST(request: Request) {
  try {
    const { title, niche, platform, scriptType, tone, length, genre, setting, timePeriod } =
      await request.json();

    const lengthInstruction = LENGTH_GUIDE[length] || LENGTH_GUIDE.medium;

    const prompt = `You are an expert content scriptwriter and video director helping a creator.

Video title/topic: ${title || "not specified"}
Niche: ${niche || "not specified"}
Platform: ${platform || "not specified"}
Script type: ${scriptType || "not specified"}
Tone: ${tone || "not specified"}
Genre: ${genre || "not specified"}
Setting/Region: ${setting || "not specified"}
Time period: ${timePeriod || "not specified (assume present day)"}

${lengthInstruction}

Write a complete video script broken into these 6 sections: Hook, Introduction, Main Content, Transitions, Payoff, CTA. Follow the length guidance above closely. Weave the genre, setting, and time period naturally into the story and visual direction where relevant.

For EACH section, provide:
1. The actual script text (what the creator will say) - written to match the requested length
2. Visual direction (camera angle, shot type, what should be on screen, reflecting the setting/time period where relevant)

Return ONLY valid JSON in exactly this format, no markdown, no code fences, no extra text:
{
  "hook": { "text": "...", "visual": "..." },
  "introduction": { "text": "...", "visual": "..." },
  "main_content": { "text": "...", "visual": "..." },
  "transitions": { "text": "...", "visual": "..." },
  "payoff": { "text": "...", "visual": "..." },
  "cta": { "text": "...", "visual": "..." }
}`;

    const result = await generateText(prompt);

    const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { success: false, error: "AI returned an unexpected format. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, script: parsed });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
