import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: settings } = await supabase
    .from("creator_settings")
    .select("onboarding_completed")
    .eq("id", user!.id)
    .single();

  if (!settings?.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome back{user?.email ? `, ${user.email}` : ""}</h1>
      <p className="mt-1 text-gray-400">Here&apos;s what&apos;s happening with your content.</p>

      <div className="mt-8">
        <button className="bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-gray-200">
          + Quick Create
        </button>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Drafts", value: "0" },
          { label: "Scheduled", value: "0" },
          { label: "Published", value: "0" },
          { label: "AI Credits", value: "0 / 0" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-gray-800 rounded-2xl p-5"
          >
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="mt-1 text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <section className="border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold">Recent Ideas</h2>
          <p className="mt-3 text-sm text-gray-500">
            No ideas yet. Once the Idea Generator is live, your latest ideas will show up here.
          </p>
        </section>

        <section className="border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold">Recent Scripts</h2>
          <p className="mt-3 text-sm text-gray-500">
            No scripts yet. Once Script Studio is live, your latest scripts will show up here.
          </p>
        </section>

        <section className="border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold">Content Calendar</h2>
          <p className="mt-3 text-sm text-gray-500">
            No scheduled content yet. Your upcoming calendar will show up here.
          </p>
        </section>

        <section className="border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold">Performance</h2>
          <p className="mt-3 text-sm text-gray-500">
            Analytics will appear here once you connect a platform.
          </p>
        </section>
      </div>
    </div>
  );
}
