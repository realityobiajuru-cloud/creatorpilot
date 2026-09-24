import { NextResponse } from "next/server";
import { generateText } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const { topic, niche, platform, style } = await request.json();

    const styleInstruction = style
      ? `Write all hooks in the "${style}" style specifically.`
      : "Mix across different hook styles (curiosity, question, story, shock, mystery, emotional, problem, contrarian) and pick the best fit for each.";

    const prompt = `You are an expert short-form content hook writer.

Topic: ${topic || "not specified"}
Niche: ${niche || "not specified"}
Platform: ${platform || "not specified"}

${styleInstruction}

Generate exactly 5 scroll-stopping hooks (the first 1-2 sentences of a video, designed to stop someone from scrolling past).
Each hook should be different from the others, punchy, and platform-appropriate.
Return ONLY a numbered list, one hook per line, no extra commentary, no markdown formatting, no asterisks.`;

    const result = await generateText(prompt);

    const hooks = result
      .split("\n")
      .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((line) => line.length > 0);

    return NextResponse.json({ success: true, hooks });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
