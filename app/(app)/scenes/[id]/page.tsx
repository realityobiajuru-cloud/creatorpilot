"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Scene = {
  scene_number: number;
  location: string;
  characters: string;
  action: string;
  dialogue: string;
  camera: string;
  lighting: string;
  emotion: string;
  duration: string;
  sound: string;
  animation_prompt: string;
};

type Character = {
  name: string;
  description: string;
};

type SceneProject = {
  id: string;
  title: string;
  concept: string | null;
  genre: string | null;
  setting: string | null;
  scenes: Scene[];
  characters: Character[];
};

export default function SceneEditorPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params.id as string;

  const [project, setProject] = useState<SceneProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [titleDraft, setTitleDraft] = useState("");

  const [showAiForm, setShowAiForm] = useState(false);
  const [sceneCount, setSceneCount] = useState(5);
  const [keepCharacters, setKeepCharacters] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const loadProject = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("scenes_projects")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setProject(data);
      setTitleDraft(data.title);
    }
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  async function handleTitleBlur() {
    if (!project || titleDraft === project.title) return;
    setSaveState("saving");
    await supabase
      .from("scenes_projects")
      .update({ title: titleDraft, updated_at: new Date().toISOString() })
      .eq("id", id);
    setProject({ ...project, title: titleDraft });
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 1500);
  }

  async function handleDelete() {
    await supabase.from("scenes_projects").delete().eq("id", id);
    router.push("/scenes");
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;
    setAiError("");
    setGenerating(true);

    try {
      const res = await fetch("/api/generate-scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: project.concept,
          genre: project.genre,
          setting: project.setting,
          sceneCount,
          existingCharacters:
            keepCharacters && project.characters?.length > 0 ? project.characters : null,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setAiError(data.error || "Generation failed.");
        return;
      }

      const updates = {
        scenes: data.scenes,
        characters:
          keepCharacters && project.characters?.length > 0
            ? project.characters
            : data.characters,
        updated_at: new Date().toISOString(),
      };

      await supabase.from("scenes_projects").update(updates).eq("id", id);

      setProject({ ...project, ...updates });
      setShowAiForm(false);
    } catch {
      setAiError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function updateSceneField(index: number, field: keyof Scene, value: string) {
    if (!project) return;
    const updatedScenes = [...project.scenes];
    updatedScenes[index] = { ...updatedScenes[index], [field]: value };
    setProject({ ...project, scenes: updatedScenes });

    setSaveState("saving");
    await supabase
      .from("scenes_projects")
      .update({ scenes: updatedScenes, updated_at: new Date().toISOString() })
      .eq("id", id);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 1500);
  }

  function copyPrompt(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading project...</p>;
  }

  if (!project) {
    return <p className="text-gray-500 text-sm">Project not found.</p>;
  }

  const FIELD_LABELS: { key: keyof Scene; label: string; icon: string }[] = [
    { key: "location", label: "Location", icon: "📍" },
    { key: "characters", label: "Characters", icon: "🎭" },
    { key: "action", label: "Action", icon: "🎬" },
    { key: "dialogue", label: "Dialogue", icon: "💬" },
    { key: "camera", label: "Camera", icon: "🎥" },
    { key: "lighting", label: "Lighting", icon: "💡" },
    { key: "emotion", label: "Emotion", icon: "❤️" },
    { key: "sound", label: "Sound", icon: "🔊" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <a href="/scenes" className="text-sm text-gray-400 hover:text-white">
          &larr; All projects
        </a>
        <span className="text-xs text-gray-500">
          {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : ""}
        </span>
      </div>

      <input
        value={titleDraft}
        onChange={(e) => setTitleDraft(e.target.value)}
        onBlur={handleTitleBlur}
        className="mt-4 w-full bg-transparent text-2xl font-bold focus:outline-none border-b border-transparent focus:border-gray-700 pb-2"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {project.genre && (
          <span className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400">
            {project.genre}
          </span>
        )}
        {project.setting && (
          <span className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400">
            {project.setting}
          </span>
        )}
        <button
          onClick={handleDelete}
          className="text-xs text-gray-500 hover:text-red-500 ml-auto"
        >
          Delete project
        </button>
      </div>

      {project.concept && (
        <p className="mt-4 text-sm text-gray-400 border-l-2 border-gray-800 pl-3">
          {project.concept}
        </p>
      )}

      {/* CHARACTERS */}
      {project.characters?.length > 0 && (
        <div className="mt-6 border border-purple-900/50 bg-purple-950/30 rounded-2xl p-6">
          <h2 className="font-semibold flex items-center gap-2 text-purple-200">
            🎭 Characters (for consistency)
          </h2>
          <div className="mt-4 space-y-3">
            {project.characters.map((c, i) => (
              <div key={i}>
                <span className="text-sm font-medium text-purple-200">{c.name}</span>
                <p className="text-xs text-purple-300/70 mt-1">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI GENERATOR */}
      <div className="mt-6 border border-gray-800 rounded-2xl p-6 bg-gray-950">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            ✨ Generate scene breakdown with AI
          </h2>
          <button
            onClick={() => setShowAiForm((s) => !s)}
            className="text-xs bg-white text-black rounded-full px-4 py-2 hover:bg-gray-200"
          >
            {showAiForm ? "Cancel" : "Generate"}
          </button>
        </div>

        {showAiForm && (
          <form onSubmit={handleGenerate} className="mt-4 space-y-3">
            <p className="text-xs text-gray-500">
              This will overwrite the current scene list with a new one.
            </p>
            <div>
              <label className="text-sm text-gray-400">Number of scenes</label>
              <input
                type="number"
                onFocus={(e) => e.target.select()}
                min={2}
                max={15}
                value={sceneCount}
                onChange={(e) => setSceneCount(Number(e.target.value))}
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
            {project.characters?.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={keepCharacters}
                  onChange={(e) => setKeepCharacters(e.target.checked)}
                />
                Keep existing characters for consistency
              </label>
            )}
            {aiError && <p className="text-red-500 text-sm">{aiError}</p>}
            <button
              type="submit"
              disabled={generating}
              className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              {generating ? "Breaking down scenes..." : "Generate scenes"}
            </button>
          </form>
        )}
      </div>

      {/* SCENES */}
      <div className="mt-10 space-y-8">
        {(!project.scenes || project.scenes.length === 0) && (
          <p className="text-gray-500 text-sm">
            No scenes yet. Generate a breakdown with AI above.
          </p>
        )}

        {project.scenes?.map((scene, index) => (
          <div key={index} className="border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Scene {scene.scene_number}</h3>
              <span className="text-xs text-gray-500">{scene.duration}</span>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {FIELD_LABELS.map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-gray-500">
                    {field.icon} {field.label}
                  </label>
                  <textarea
                    key={scene[field.key]}
                    defaultValue={scene[field.key] ?? ""}
                    onBlur={(e) => updateSceneField(index, field.key, e.target.value)}
                    rows={2}
                    className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-600"
                    style={{ fontSize: "15px", lineHeight: "1.5" }}
                  />
                </div>
              ))}
            </div>

            {scene.animation_prompt && (
              <div className="mt-4 bg-indigo-950/40 border border-indigo-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-300 font-medium">
                    🎞️ Animation prompt (ready to paste)
                  </span>
                  <button
                    onClick={() => copyPrompt(scene.animation_prompt, index)}
                    className="text-xs text-indigo-300 border border-indigo-800 rounded-full px-3 py-1 hover:bg-indigo-900/30"
                  >
                    {copiedIndex === index ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-indigo-200/80 leading-relaxed">
                  {scene.animation_prompt}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
