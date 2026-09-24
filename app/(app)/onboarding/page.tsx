"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PLATFORM_OPTIONS = [
  "YouTube",
  "YouTube Shorts",
  "TikTok",
  "Instagram",
  "Facebook",
  "X",
  "LinkedIn",
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [creatorName, setCreatorName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [contentGoals, setContentGoals] = useState("");
  const [contentStyle, setContentStyle] = useState("");
  const [postingFrequency, setPostingFrequency] = useState("");
  const [brandVoice, setBrandVoice] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function togglePlatform(platform: string) {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("creator_settings").upsert({
      id: user.id,
      creator_name: creatorName,
      brand_name: brandName,
      niche,
      target_audience: targetAudience,
      main_platforms: platforms,
      content_goals: contentGoals,
      content_style: contentStyle,
      posting_frequency: postingFrequency,
      brand_voice: brandVoice,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Tell us about you</h1>
      <p className="mt-1 text-gray-400">
        This helps CreatorPilot tailor ideas, hooks, and scripts to your brand.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="text-sm text-gray-400">Creator name</label>
          <input
            required
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Brand name</label>
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Niche</label>
          <input
            required
            placeholder="e.g. Fitness, Gaming, Personal Finance"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Target audience</label>
          <input
            placeholder="e.g. Beginners learning to invest, ages 20-35"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Main platforms</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PLATFORM_OPTIONS.map((platform) => (
              <button
                type="button"
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`rounded-full px-4 py-2 text-sm border ${
                  platforms.includes(platform)
                    ? "bg-white text-black border-white"
                    : "border-gray-800 text-gray-300"
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Content goals</label>
          <input
            placeholder="e.g. Grow subscribers, drive sales, build community"
            value={contentGoals}
            onChange={(e) => setContentGoals(e.target.value)}
            className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Content style</label>
          <input
            placeholder="e.g. Educational, entertaining, storytelling"
            value={contentStyle}
            onChange={(e) => setContentStyle(e.target.value)}
            className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Posting frequency</label>
          <select
            value={postingFrequency}
            onChange={(e) => setPostingFrequency(e.target.value)}
            className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
          >
            <option value="">Select...</option>
            <option value="daily">Daily</option>
            <option value="few_per_week">A few times a week</option>
            <option value="weekly">Weekly</option>
            <option value="few_per_month">A few times a month</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400">Brand voice</label>
          <input
            placeholder="e.g. Bold and direct, warm and friendly"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black rounded-full py-3 font-medium hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue to dashboard"}
        </button>
      </form>
    </div>
  );
}
