import { NextResponse } from "next/server";
import { generateText } from "@/lib/ai/gemini";

export async function GET() {
  try {
    const result = await generateText(
      "Say hello and confirm you are working, in one short sentence."
    );
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
