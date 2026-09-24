import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold tracking-tight shrink-0 text-sm sm:text-base">
            CreatorPilot
          </span>
          <div className="shrink-0">
            <LogoutButton />
          </div>
        </div>
        <nav className="mt-3 flex items-center gap-4 text-sm overflow-x-auto pb-1">
          <a href="/dashboard" className="text-gray-400 hover:text-white whitespace-nowrap shrink-0">
            Dashboard
          </a>
          <a href="/ideas" className="text-gray-400 hover:text-white whitespace-nowrap shrink-0">
            Ideas
          </a>
          <a href="/scripts" className="text-gray-400 hover:text-white whitespace-nowrap shrink-0">Script Studio</a>
          <a href="/calendar" className="text-gray-400 hover:text-white whitespace-nowrap shrink-0">Calendar</a>
          <a href="/library" className="text-gray-400 hover:text-white whitespace-nowrap shrink-0">Library</a>
          <a href="/hooks" className="text-gray-400 hover:text-white whitespace-nowrap shrink-0">
            Hook Lab
          </a>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
