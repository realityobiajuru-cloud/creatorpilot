"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type VisualNotes = Record<string, string>;

type ScriptData = {
  id: string;
  title: string;
  platform: string | null;
  script_type: string | null;
  niche: string | null;
  status: string;
  hook: string | null;
  introduction: string | null;
  main_content: string | null;
  transitions: string | null;
  payoff: string | null;
  cta: string | null;
  visual_notes: VisualNotes | null;
};

const STATUSES = ["draft", "in_progress", "ready", "scheduled", "published"];

const SECTIONS: { key: keyof ScriptData; label: string; placeholder: string }[] = [
  { key: "hook", label: "Hook", placeholder: "The first line that stops the scroll..." },
  { key: "introduction", label: "Introduction", placeholder: "Set up what this video is about..." },
  { key: "main_content", label: "Main Content", placeholder: "The core of your script..." },
  { key: "transitions", label: "Transitions", placeholder: "How you move between points..." },
  { key: "payoff", label: "Payoff", placeholder: "The value delivered, the reveal..." },
  { key: "cta", label: "CTA", placeholder: "What you want the viewer to do next..." },
];

export default function ScriptEditorPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params.id as string;

  const [script, setScript] = useState<ScriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [titleDraft, setTitleDraft] = useState("");

  const [showAiForm, setShowAiForm] = useState(false);
  const [aiLength, setAiLength] = useState("medium");
  const [aiGenre, setAiGenre] = useState("");
  const [aiSetting, setAiSetting] = useState("");
  const [aiTimePeriod, setAiTimePeriod] = useState("");
  const [aiTone, setAiTone] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [creatingScenes, setCreatingScenes] = useState(false);

  const loadScript = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setScript(data);
      setTitleDraft(data.title);
    }
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    loadScript();
  }, [loadScript]);

  async function saveField(field: string, value: string) {
    setSaveState("saving");
    await supabase
      .from("scripts")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", id);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 1500);
  }

  async function handleStatusChange(status: string) {
    if (!script) return;
    setScript({ ...script, status });
    await saveField("status", status);
  }

  async function handleTitleBlur() {
    if (!script || titleDraft === script.title) return;
    setScript({ ...script, title: titleDraft });
    await saveField("title", titleDraft);
  }

  async function handleDelete() {
    await supabase.from("scripts").delete().eq("id", id);
    router.push("/scripts");
  }


  async function handleCreateScenes() {
    if (!script) return;
    setCreatingScenes(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCreatingScenes(false);
      return;
    }

    const scriptContent = [
      script.hook,
      script.introduction,
      script.main_content,
      script.transitions,
      script.payoff,
      script.cta,
    ]
      .filter(Boolean)
      .join("\n\n");

    const { data, error } = await supabase
      .from("scenes_projects")
      .insert({
        user_id: user.id,
        title: script.title,
        script_id: script.id,
        concept: scriptContent,
        genre: null,
        setting: null,
      })
      .select("id")
      .single();

    setCreatingScenes(false);

    if (error || !data) return;

    router.push(`/scenes/${data.id}`);
  }
  async function handleGenerateScript(e: React.FormEvent) {
    e.preventDefault();
    if (!script) return;
    setAiError("");
    setGenerating(true);

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: script.title,
          niche: script.niche,
          platform: script.platform,
          scriptType: script.script_type,
          tone: aiTone,
          length: aiLength,
          genre: aiGenre,
          setting: aiSetting,
          timePeriod: aiTimePeriod,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setAiError(data.error || "Generation failed.");
        return;
      }

      const g = data.script;
      const visualNotes: VisualNotes = {
        hook: g.hook?.visual ?? "",
        introduction: g.introduction?.visual ?? "",
        main_content: g.main_content?.visual ?? "",
        transitions: g.transitions?.visual ?? "",
        payoff: g.payoff?.visual ?? "",
        cta: g.cta?.visual ?? "",
      };

      const updates = {
        hook: g.hook?.text ?? "",
        introduction: g.introduction?.text ?? "",
        main_content: g.main_content?.text ?? "",
        transitions: g.transitions?.text ?? "",
        payoff: g.payoff?.text ?? "",
        cta: g.cta?.text ?? "",
        visual_notes: visualNotes,
        updated_at: new Date().toISOString(),
      };

      await supabase.from("scripts").update(updates).eq("id", id);

      setScript({ ...script, ...updates });
      setShowAiForm(false);
    } catch {
      setAiError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading script...</p>;
  }

  if (!script) {
    return <p className="text-gray-500 text-sm">Script not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <a href="/scripts" className="text-sm text-gray-400 hover:text-white">
          &larr; All scripts
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
        <select
          value={script.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs capitalize focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        {script.platform && (
          <span className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400">
            {script.platform}
          </span>
        )}
        {script.script_type && (
          <span className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400">
            {script.script_type}
          </span>
        )}
        <button
          onClick={handleCreateScenes}
          disabled={creatingScenes}
          className="text-xs bg-purple-900/40 text-purple-200 border border-purple-800 rounded-full px-4 py-2 hover:bg-purple-900/60 disabled:opacity-50"
        >
          {creatingScenes ? "Creating scenes..." : "🎬 Generate Scenes"}
        </button>
        <button
          onClick={handleDelete}
          className="text-xs text-gray-500 hover:text-red-500 ml-auto"
        >
          Delete script
        </button>
      </div>

      {/* AI GENERATOR */}
      <div className="mt-6 border border-gray-800 rounded-2xl p-6 bg-gray-950">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            ✨ Generate full script with AI
          </h2>
          <button
            onClick={() => setShowAiForm((s) => !s)}
            className="text-xs bg-white text-black rounded-full px-4 py-2 hover:bg-gray-200"
          >
            {showAiForm ? "Cancel" : "Generate"}
          </button>
        </div>

        {showAiForm && (
          <form onSubmit={handleGenerateScript} className="mt-4 space-y-3">
            <p className="text-xs text-gray-500">
              Uses this script&apos;s title ({script.title || "untitled"}), platform, and type.
              This will overwrite existing content in all sections.
            </p>

            <select
              value={aiLength}
              onChange={(e) => setAiLength(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            >
              <option value="short">Short (30-60 sec, e.g. Shorts/TikTok)</option>
              <option value="medium">Medium (2-4 min)</option>
              <option value="long">Long-form (8-15 min)</option>
            </select>

            <div className="grid sm:grid-cols-3 gap-3">
              <input
                placeholder="Genre (e.g. drama, comedy, horror)"
                value={aiGenre}
                onChange={(e) => setAiGenre(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
              <input
                placeholder="Setting/Region (e.g. Lagos, small town)"
                value={aiSetting}
                onChange={(e) => setAiSetting(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
              <input
                placeholder="Time period (e.g. present day, 1990s)"
                value={aiTimePeriod}
                onChange={(e) => setAiTimePeriod(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>

            <input
              placeholder="Tone (e.g. bold and direct, warm and casual)"
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            />

            {aiError && <p className="text-red-500 text-sm">{aiError}</p>}

            <button
              type="submit"
              disabled={generating}
              className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              {generating ? "Writing your script..." : "Generate script"}
            </button>
          </form>
        )}
      </div>

      <div className="mt-10 space-y-10">
        {SECTIONS.map((section) => (
          <div key={section.key}>
            <div className="flex items-center justify-between mb-3">
              <label className="text-base font-semibold">{section.label}</label>
              <div className="flex gap-2">
                {["Rewrite", "Shorten", "Expand", "Tone"].map((action) => (
                  <button
                    key={action}
                    type="button"
                    disabled
                    title="Coming in a future update"
                    className="text-xs text-gray-500 border rounded-full px-3 py-1 cursor-not-allowed"
                    style={{ borderColor: "#2a2a3a" }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              key={script[section.key] as string}
              defaultValue={(script[section.key] as string) ?? ""}
              onBlur={(e) => saveField(section.key as string, e.target.value)}
              placeholder={section.placeholder}
              rows={5}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-4 leading-relaxed focus:outline-none focus:border-gray-600"
              style={{ fontSize: "16px", lineHeight: "1.7" }}
            />
            {script.visual_notes?.[section.key as string] && (
              <div className="mt-3 flex gap-2 items-start bg-indigo-950/40 border border-indigo-900/50 rounded-lg px-4 py-3">
                <span className="text-xs text-indigo-300 shrink-0 font-medium">🎥 Visual:</span>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  {script.visual_notes[section.key as string]}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
