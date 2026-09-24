"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type SceneProject = {
  id: string;
  title: string;
  genre: string | null;
  setting: string | null;
  created_at: string;
};

export default function ScenesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [projects, setProjects] = useState<SceneProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [concept, setConcept] = useState("");
  const [genre, setGenre] = useState("");
  const [setting, setSetting] = useState("");

  async function loadProjects() {
    setLoading(true);
    const { data } = await supabase
      .from("scenes_projects")
      .select("id, title, genre, setting, created_at")
      .order("created_at", { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
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
      .from("scenes_projects")
      .insert({
        user_id: user.id,
        title,
        concept: concept || null,
        genre: genre || null,
        setting: setting || null,
      })
      .select("id")
      .single();

    setCreating(false);

    if (error || !data) {
      setError(error?.message ?? "Something went wrong.");
      return;
    }

    router.push(`/scenes/${data.id}`);
  }

  async function handleDelete(id: string) {
    await supabase.from("scenes_projects").delete().eq("id", id);
    loadProjects();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scene Generator</h1>
          <p className="mt-1 text-gray-400">
            Break your concept into a full scene-by-scene shot list.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200"
        >
          {showForm ? "Cancel" : "+ New Project"}
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
              placeholder="e.g. My mother's secret"
              className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Concept</label>
            <textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              rows={3}
              placeholder="Briefly describe the story or video concept..."
              className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Genre</label>
              <input
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. drama, horror, comedy"
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Setting</label>
              <input
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="e.g. Lagos, present day"
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create & build scenes"}
          </button>
        </form>
      )}

      <div className="mt-8">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No scene projects yet. Click &quot;+ New Project&quot; to start.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="border border-gray-800 rounded-2xl p-5 flex flex-col"
              >
                <h3 className="font-semibold">{p.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.genre && (
                    <span className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400">
                      {p.genre}
                    </span>
                  )}
                  {p.setting && (
                    <span className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400">
                      {p.setting}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <a href={`/scenes/${p.id}`} className="text-xs text-white underline">
                    Open
                  </a>
                  <button
                    onClick={() => handleDelete(p.id)}
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
