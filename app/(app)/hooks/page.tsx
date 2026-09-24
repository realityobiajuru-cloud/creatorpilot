"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Hook = {
  id: string;
  content: string;
  style: string | null;
  platform: string | null;
  notes: string | null;
  created_at: string;
};

const STYLES = [
  "Curiosity",
  "Question",
  "Story",
  "Shock",
  "Mystery",
  "Emotional",
  "Problem",
  "Contrarian",
];

const PLATFORMS = ["YouTube", "YouTube Shorts", "TikTok", "Instagram", "Facebook", "X", "LinkedIn"];

export default function HooksPage() {
  const supabase = createClient();

  const [hooks, setHooks] = useState<Hook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filterStyle, setFilterStyle] = useState("");

  const [content, setContent] = useState("");
  const [style, setStyle] = useState("");
  const [platform, setPlatform] = useState("");
  const [notes, setNotes] = useState("");

  async function loadHooks() {
    setLoading(true);
    const { data } = await supabase
      .from("hooks")
      .select("*")
      .order("created_at", { ascending: false });
    setHooks(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadHooks();
  }, []);

  function resetForm() {
    setContent("");
    setStyle("");
    setPlatform("");
    setNotes("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("hooks").insert({
      user_id: user.id,
      content,
      style: style || null,
      platform: platform || null,
      notes: notes || null,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    resetForm();
    setShowForm(false);
    loadHooks();
  }

  async function handleDelete(id: string) {
    await supabase.from("hooks").delete().eq("id", id);
    loadHooks();
  }

  const filteredHooks = filterStyle
    ? hooks.filter((h) => h.style === filterStyle)
    : hooks;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hook Lab</h1>
          <p className="mt-1 text-gray-400">Save and organize your best hooks.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200"
        >
          {showForm ? "Cancel" : "+ New Hook"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 border border-gray-800 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="text-sm text-gray-400">Hook</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="e.g. Nobody tells you this about..."
              className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Style</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`rounded-full px-4 py-2 text-sm border ${
                    style === s
                      ? "bg-white text-black border-white"
                      : "border-gray-800 text-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
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
              <label className="text-sm text-gray-400">Notes</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save hook"}
          </button>
        </form>
      )}

      {hooks.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStyle("")}
            className={`rounded-full px-4 py-2 text-xs border ${
              filterStyle === ""
                ? "bg-white text-black border-white"
                : "border-gray-800 text-gray-400"
            }`}
          >
            All
          </button>
          {STYLES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStyle(s)}
              className={`rounded-full px-4 py-2 text-xs border ${
                filterStyle === s
                  ? "bg-white text-black border-white"
                  : "border-gray-800 text-gray-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading hooks...</p>
        ) : filteredHooks.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {hooks.length === 0
              ? 'No hooks yet. Click "+ New Hook" to save your first one.'
              : "No hooks match this filter."}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHooks.map((hook) => (
              <div
                key={hook.id}
                className="border border-gray-800 rounded-2xl p-5 flex flex-col"
              >
                <p className="text-sm">{hook.content}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {hook.style && (
                    <span className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400">
                      {hook.style}
                    </span>
                  )}
                  {hook.platform && (
                    <span className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400">
                      {hook.platform}
                    </span>
                  )}
                </div>
                {hook.notes && (
                  <p className="mt-2 text-xs text-gray-500">{hook.notes}</p>
                )}
                <button
                  onClick={() => handleDelete(hook.id)}
                  className="mt-4 text-xs text-gray-500 hover:text-red-500 text-left"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
