"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Idea = {
  id: string;
  title: string;
  description: string | null;
  topic: string | null;
  niche: string | null;
  platform: string | null;
  content_type: string | null;
  target_audience: string | null;
  duration: string | null;
  created_at: string;
};

const PLATFORMS = ["YouTube", "YouTube Shorts", "TikTok", "Instagram", "Facebook", "X", "LinkedIn"];
const CONTENT_TYPES = ["Short-form video", "Long-form video", "Post", "Carousel", "Story"];

export default function IdeasPage() {
  const supabase = createClient();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Manual form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("");
  const [contentType, setContentType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [duration, setDuration] = useState("");

  // AI generator fields
  const [aiTopic, setAiTopic] = useState("");
  const [aiNiche, setAiNiche] = useState("");
  const [aiPlatform, setAiPlatform] = useState("");
  const [aiContentType, setAiContentType] = useState("");
  const [aiAudience, setAiAudience] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [aiError, setAiError] = useState("");
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  async function loadIdeas() {
    setLoading(true);
    const { data } = await supabase
      .from("content_ideas")
      .select("*")
      .order("created_at", { ascending: false });
    setIdeas(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadIdeas();
  }, []);

  function resetForm() {
    setTitle("");
    setDescription("");
    setTopic("");
    setNiche("");
    setPlatform("");
    setContentType("");
    setTargetAudience("");
    setDuration("");
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

    const { error } = await supabase.from("content_ideas").insert({
      user_id: user.id,
      title,
      description: description || null,
      topic: topic || null,
      niche: niche || null,
      platform: platform || null,
      content_type: contentType || null,
      target_audience: targetAudience || null,
      duration: duration || null,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    resetForm();
    setShowForm(false);
    loadIdeas();
  }

  async function handleDelete(id: string) {
    await supabase.from("content_ideas").delete().eq("id", id);
    loadIdeas();
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setAiError("");
    setGenerating(true);
    setGeneratedIdeas([]);

    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          niche: aiNiche,
          platform: aiPlatform,
          contentType: aiContentType,
          targetAudience: aiAudience,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setAiError(data.error || "Generation failed.");
        return;
      }

      setGeneratedIdeas(data.ideas);
    } catch {
      setAiError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveGenerated(ideaText: string, index: number) {
    setSavingIndex(index);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSavingIndex(null);
      return;
    }

    await supabase.from("content_ideas").insert({
      user_id: user.id,
      title: ideaText,
      topic: aiTopic || null,
      niche: aiNiche || null,
      platform: aiPlatform || null,
      content_type: aiContentType || null,
      target_audience: aiAudience || null,
    });

    setSavingIndex(null);
    setGeneratedIdeas((prev) => prev.filter((_, i) => i !== index));
    loadIdeas();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ideas</h1>
          <p className="mt-1 text-gray-400">Capture and organize your content ideas.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200"
        >
          {showForm ? "Cancel" : "+ New Idea"}
        </button>
      </div>

      {/* AI GENERATOR */}
      <div className="mt-6 border border-gray-800 rounded-2xl p-6 bg-gray-950">
        <h2 className="font-semibold flex items-center gap-2">
          ✨ Generate ideas with AI
        </h2>
        <form onSubmit={handleGenerate} className="mt-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              placeholder="Topic (e.g. morning routines)"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            />
            <input
              placeholder="Niche (e.g. fitness)"
              value={aiNiche}
              onChange={(e) => setAiNiche(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <select
              value={aiPlatform}
              onChange={(e) => setAiPlatform(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            >
              <option value="">Platform...</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={aiContentType}
              onChange={(e) => setAiContentType(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            >
              <option value="">Content type...</option>
              {CONTENT_TYPES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <input
            placeholder="Target audience (e.g. busy professionals)"
            value={aiAudience}
            onChange={(e) => setAiAudience(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
          />

          {aiError && <p className="text-red-500 text-sm">{aiError}</p>}

          <button
            type="submit"
            disabled={generating}
            className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate 5 ideas"}
          </button>
        </form>

        {generatedIdeas.length > 0 && (
          <div className="mt-6 space-y-3">
            {generatedIdeas.map((idea, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 border border-gray-800 rounded-lg p-4"
              >
                <p className="text-sm">{idea}</p>
                <button
                  onClick={() => handleSaveGenerated(idea, index)}
                  disabled={savingIndex === index}
                  className="shrink-0 text-xs bg-white text-black rounded-full px-3 py-2 hover:bg-gray-200 disabled:opacity-50"
                >
                  {savingIndex === index ? "Saving..." : "Save"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MANUAL FORM */}
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
              className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Niche</label>
              <input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
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
              <label className="text-sm text-gray-400">Content type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              >
                <option value="">Select...</option>
                {CONTENT_TYPES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Target audience</label>
              <input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Duration</label>
              <input
                placeholder="e.g. 60 seconds, 10 minutes"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
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
            {saving ? "Saving..." : "Save idea"}
          </button>
        </form>
      )}

      <div className="mt-8">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading ideas...</p>
        ) : ideas.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No ideas yet. Generate some with AI above, or click &quot;+ New Idea&quot;.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="border border-gray-800 rounded-2xl p-5 flex flex-col"
              >
                <h3 className="font-semibold">{idea.title}</h3>
                {idea.description && (
                  <p className="mt-2 text-sm text-gray-400 line-clamp-3">
                    {idea.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {idea.platform && (
                    <span className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400">
                      {idea.platform}
                    </span>
                  )}
                  {idea.content_type && (
                    <span className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400">
                      {idea.content_type}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(idea.id)}
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
