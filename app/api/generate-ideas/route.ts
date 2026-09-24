import { NextResponse } from "next/server";
import { generateText } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const { topic, niche, platform, contentType, targetAudience } =
      await request.json();

    const prompt = `You are a content strategist helping a creator brainstorm.

Topic: ${topic || "not specified"}
Niche: ${niche || "not specified"}
Platform: ${platform || "not specified"}
Content type: ${contentType || "not specified"}
Target audience: ${targetAudience || "not specified"}

Generate exactly 5 specific, creative content ideas based on this information.
Return ONLY a numbered list, one idea per line, no extra commentary, no markdown formatting, no asterisks.`;

    const result = await generateText(prompt);

    const ideas = result
      .split("\n")
      .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((line) => line.length > 0);

    return NextResponse.json({ success: true, ideas });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
