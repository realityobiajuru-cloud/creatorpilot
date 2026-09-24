"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ScriptData = {
  id: string;
  title: string;
  platform: string | null;
  script_type: string | null;
  status: string;
  hook: string | null;
  introduction: string | null;
  main_content: string | null;
  transitions: string | null;
  payoff: string | null;
  cta: string | null;
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
          onClick={handleDelete}
          className="text-xs text-gray-500 hover:text-red-500 ml-auto"
        >
          Delete script
        </button>
      </div>

      <div className="mt-8 space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.key}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">{section.label}</label>
              <div className="flex gap-2">
                {["Rewrite", "Shorten", "Expand", "Tone"].map((action) => (
                  <button
                    key={action}
                    type="button"
                    disabled
                    title="AI actions arrive in Stage 14"
                    className="text-xs text-gray-600 border border-gray-900 rounded-full px-3 py-1 cursor-not-allowed"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              defaultValue={script[section.key] ?? ""}
              onBlur={(e) => saveField(section.key, e.target.value)}
              placeholder={section.placeholder}
              rows={5}
              className="mt-2 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
