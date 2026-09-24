"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Script = {
  id: string;
  title: string;
  platform: string | null;
  script_type: string | null;
  status: string;
  created_at: string;
};

const PLATFORMS = ["YouTube", "YouTube Shorts", "TikTok", "Instagram", "Facebook", "X", "LinkedIn"];
const SCRIPT_TYPES = [
  "Short-form",
  "Long-form",
  "Story",
  "Educational",
  "Commentary",
  "Tutorial",
  "Advertisement",
];

export default function ScriptsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [scriptType, setScriptType] = useState("");

  async function loadScripts() {
    setLoading(true);
    const { data } = await supabase
      .from("scripts")
      .select("id, title, platform, script_type, status, created_at")
      .order("created_at", { ascending: false });
    setScripts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadScripts();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setCreating(false);
      return;
    }

    const { data, error } = await supabase
      .from("scripts")
      .insert({
        user_id: user.id,
        title,
        platform: platform || null,
        script_type: scriptType || null,
      })
      .select("id")
      .single();

    setCreating(false);

    if (error || !data) {
      setError(error?.message ?? "Something went wrong.");
      return;
    }

    router.push(`/scripts/${data.id}`);
  }

  async function handleDelete(id: string) {
    await supabase.from("scripts").delete().eq("id", id);
    loadScripts();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Script Studio</h1>
          <p className="mt-1 text-gray-400">Write and organize your scripts.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200"
        >
          {showForm ? "Cancel" : "+ New Script"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 border border-gray-800 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="text-sm text-gray-400">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5 morning habits that changed my life"
              className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              >
                <option value="">Select...</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Script type</label>
              <select
                value={scriptType}
                onChange={(e) => setScriptType(e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              >
                <option value="">Select...</option>
                {SCRIPT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create & start writing"}
          </button>
        </form>
      )}

      <div className="mt-8">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading scripts...</p>
        ) : scripts.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No scripts yet. Click &quot;+ New Script&quot; to start writing.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.map((script) => (
              <div
                key={script.id}
                className="border border-gray-800 rounded-2xl p-5 flex flex-col"
              >
                <h3 className="font-semibold">{script.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400 capitalize">
                    {script.status}
                  </span>
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
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <a
                    href={`/scripts/${script.id}`}
                    className="text-xs text-white underline"
                  >
                    Open
                  </a>
                  <button
                    onClick={() => handleDelete(script.id)}
                    className="text-xs text-gray-500 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
