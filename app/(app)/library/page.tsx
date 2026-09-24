"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LibraryItem = {
  id: string;
  type: "Idea" | "Hook" | "Script";
  title: string;
  subtitle: string | null;
  tag: string | null;
  created_at: string;
  href: string;
};

export default function LibraryPage() {
  const supabase = createClient();

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Idea" | "Hook" | "Script">("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadAll() {
      setLoading(true);

      const [ideasRes, hooksRes, scriptsRes] = await Promise.all([
        supabase
          .from("content_ideas")
          .select("id, title, description, platform, created_at"),
        supabase
          .from("hooks")
          .select("id, content, style, created_at"),
        supabase
          .from("scripts")
          .select("id, title, status, created_at"),
      ]);

      const ideaItems: LibraryItem[] = (ideasRes.data ?? []).map((i) => ({
        id: i.id,
        type: "Idea",
        title: i.title,
        subtitle: i.description,
        tag: i.platform,
        created_at: i.created_at,
        href: "/ideas",
      }));

      const hookItems: LibraryItem[] = (hooksRes.data ?? []).map((h) => ({
        id: h.id,
        type: "Hook",
        title: h.content,
        subtitle: null,
        tag: h.style,
        created_at: h.created_at,
        href: "/hooks",
      }));

      const scriptItems: LibraryItem[] = (scriptsRes.data ?? []).map((s) => ({
        id: s.id,
        type: "Script",
        title: s.title,
        subtitle: null,
        tag: s.status,
        created_at: s.created_at,
        href: `/scripts/${s.id}`,
      }));

      const all = [...ideaItems, ...hookItems, ...scriptItems].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setItems(all);
      setLoading(false);
    }

    loadAll();
  }, [supabase]);

  const filtered = items.filter((item) => {
    const matchesType = filter === "All" || item.type === filter;
    const matchesSearch =
      search.trim() === "" ||
      item.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Content Library</h1>
      <p className="mt-1 text-gray-400">
        Everything you&apos;ve created, in one place.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your content..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
        />
        <div className="flex gap-2 overflow-x-auto">
          {(["All", "Idea", "Hook", "Script"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm border ${
                filter === f
                  ? "bg-white text-black border-white"
                  : "border-gray-800 text-gray-400"
              }`}
            >
              {f === "All" ? "All" : `${f}s`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading your library...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {items.length === 0
              ? "Nothing here yet. Start by creating an idea, hook, or script."
              : "Nothing matches your search or filter."}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <a
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="border border-gray-800 rounded-2xl p-5 flex flex-col hover:border-gray-700"
              >
                <span className="text-xs text-gray-500">{item.type}</span>
                <h3 className="mt-1 font-semibold text-sm line-clamp-2">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="mt-2 text-xs text-gray-400 line-clamp-2">
                    {item.subtitle}
                  </p>
                )}
                {item.tag && (
                  <span className="mt-3 text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400 w-fit capitalize">
                    {item.tag}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
