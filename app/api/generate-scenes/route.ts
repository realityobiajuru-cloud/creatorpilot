import { NextResponse } from "next/server";
import { generateText } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const { concept, genre, setting, platform, sceneCount, existingCharacters, scriptContent } =
      await request.json();

    const count = sceneCount || 5;

    const characterInstruction = existingCharacters && existingCharacters.length > 0
      ? `Use these EXACT character descriptions for consistency - do not change their appearance across scenes:\n${JSON.stringify(existingCharacters)}`
      : `First, identify the main characters needed for this story and write a detailed, consistent physical description for each (age, build, hair, clothing, distinguishing features) so they look the same in every scene.`;

    const sourceMaterial = scriptContent
      ? `Base the scenes directly on this existing script - break it down into scenes that visually match what's being said, in order:\n\n${scriptContent}`
      : `Concept: ${concept || "not specified"}`;

    const prompt = `You are a professional film/video director and AI animation prompt engineer breaking a video into a shot-by-shot scene list ready for AI video generation tools.

${sourceMaterial}

Genre: ${genre || "not specified"}
Setting: ${setting || "not specified"}
Platform: ${platform || "not specified"}

${characterInstruction}

Break this into exactly ${count} scenes that tell the full story in sequence.

For EACH scene, provide:
- scene_number (integer, starting at 1)
- location (where this scene takes place)
- characters (who is in this scene, as a short comma-separated string of names)
- action (what physically happens)
- dialogue (what is said, if anything - pull directly from the script if provided, can be empty string if no dialogue)
- camera (camera angle, shot type, and movement)
- lighting (lighting mood and style)
- emotion (the emotional tone of the scene)
- duration (estimated seconds, as a short string like "5-8 sec")
- sound (music, sound effects, or ambient sound direction)
- animation_prompt (a single, detailed, ready-to-use text prompt for an AI video/animation generator like Runway or Pika - combine camera movement, character appearance and action, facial expression, lighting, and setting into one cohesive descriptive paragraph, written in present tense, cinematic style)

Return ONLY valid JSON in exactly this format, no markdown, no code fences, no extra text:
{
  "characters": [
    { "name": "...", "description": "..." }
  ],
  "scenes": [
    {
      "scene_number": 1,
      "location": "...",
      "characters": "...",
      "action": "...",
      "dialogue": "...",
      "camera": "...",
      "lighting": "...",
      "emotion": "...",
      "duration": "...",
      "sound": "...",
      "animation_prompt": "..."
    }
  ]
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

    return NextResponse.json({
      success: true,
      scenes: parsed.scenes ?? [],
      characters: parsed.characters ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
