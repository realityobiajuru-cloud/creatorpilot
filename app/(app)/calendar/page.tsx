"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CalendarEvent = {
  id: string;
  title: string;
  platform: string | null;
  status: string;
  scheduled_date: string | null;
  script_id: string | null;
  notes: string | null;
};

type ScriptOption = { id: string; title: string };

const PLATFORMS = ["YouTube", "YouTube Shorts", "TikTok", "Instagram", "Facebook", "X", "LinkedIn"];
const STATUSES = ["draft", "in_progress", "ready", "scheduled", "published"];

export default function CalendarPage() {
  const supabase = createClient();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [scripts, setScripts] = useState<ScriptOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("draft");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scriptId, setScriptId] = useState("");
  const [notes, setNotes] = useState("");

  async function loadData() {
    setLoading(true);
    const [eventsRes, scriptsRes] = await Promise.all([
      supabase
        .from("calendar_events")
        .select("*")
        .order("scheduled_date", { ascending: true, nullsFirst: false }),
      supabase.from("scripts").select("id, title"),
    ]);
    setEvents(eventsRes.data ?? []);
    setScripts(scriptsRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setTitle("");
    setPlatform("");
    setStatus("draft");
    setScheduledDate("");
    setScriptId("");
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

    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title,
      platform: platform || null,
      status,
      scheduled_date: scheduledDate || null,
      script_id: scriptId || null,
      notes: notes || null,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    resetForm();
    setShowForm(false);
    loadData();
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
    await supabase.from("calendar_events").update({ status: newStatus }).eq("id", id);
  }

  async function handleDelete(id: string) {
    await supabase.from("calendar_events").delete().eq("id", id);
    loadData();
  }

  // Group events by date (unscheduled last)
  const grouped: Record<string, CalendarEvent[]> = {};
  for (const event of events) {
    const key = event.scheduled_date ?? "Unscheduled";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  }
  const groupKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "Unscheduled") return 1;
    if (b === "Unscheduled") return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  function formatDate(dateStr: string) {
    if (dateStr === "Unscheduled") return "Unscheduled";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Calendar</h1>
          <p className="mt-1 text-gray-400">Plan and track what&apos;s going out.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200"
        >
          {showForm ? "Cancel" : "+ New"}
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
              className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
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
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm capitalize focus:outline-none focus:border-gray-600"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Link a script (optional)</label>
              <select
                value={scriptId}
                onChange={(e) => setScriptId(e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              >
                <option value="">None</option>
                {scripts.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add to calendar"}
          </button>
        </form>
      )}

      <div className="mt-8 space-y-8">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading calendar...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Nothing scheduled yet. Click &quot;+ New&quot; to add your first item.
          </p>
        ) : (
          groupKeys.map((dateKey) => (
            <div key={dateKey}>
              <h2 className="text-sm font-semibold text-gray-400">
                {formatDate(dateKey)}
              </h2>
              <div className="mt-3 space-y-3">
                {grouped[dateKey].map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {event.platform && (
                          <span className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400">
                            {event.platform}
                          </span>
                        )}
                        {event.script_id && (
                          <a
                            href={`/scripts/${event.script_id}`}
                            className="text-xs border border-gray-800 rounded-full px-3 py-1 text-gray-400 hover:text-white"
                          >
                            View script
                          </a>
                        )}
                      </div>
                      {event.notes && (
                        <p className="mt-2 text-xs text-gray-500">{event.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusChange(event.id, e.target.value)}
                        className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs capitalize focus:outline-none"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-xs text-gray-500 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
