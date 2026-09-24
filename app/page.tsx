export default function Home() {
  return (
    <main className="bg-black text-white">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-lg font-bold tracking-tight">CreatorPilot</span>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm text-gray-300 hover:text-white">
            Log in
          </a>
          <a
            href="/signup"
            className="text-sm bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200"
          >
            Sign up
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center px-6 pt-16 pb-20 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          One operating system for every piece of content you create
        </h1>
        <p className="mt-6 text-gray-400 text-lg">
          CreatorPilot takes you from idea to published post — hooks, scripts,
          calendar, and more, all in one place.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/signup"
            className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200"
          >
            Get started free
          </a>
          <a
            href="#how-it-works"
            className="border border-gray-700 px-6 py-3 rounded-full font-medium hover:border-gray-500"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          Everything you need to create, organized in one place
        </h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Idea Generator", desc: "Never run out of content ideas for any niche or platform." },
            { title: "Hook Lab", desc: "Craft scroll-stopping openers in eight proven styles." },
            { title: "Script Studio", desc: "Write and refine scripts from hook to CTA." },
            { title: "Content Calendar", desc: "Plan and track everything from draft to published." },
            { title: "Content Library", desc: "Keep every idea, hook, and script organized." },
            { title: "AI Assistant", desc: "Get help at every stage of the content lifecycle." },
          ].map((f) => (
            <div
              key={f.title}
              className="border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition"
            >
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">How it works</h2>
        <div className="mt-10 grid sm:grid-cols-3 gap-8 text-left">
          {[
            { step: "1", title: "Plan", desc: "Generate ideas, hooks, and full scripts for your content." },
            { step: "2", title: "Organize", desc: "Track everything on a visual content calendar." },
            { step: "3", title: "Publish", desc: "Move content from draft to scheduled to live." },
          ].map((s) => (
            <div key={s.step}>
              <div className="text-sm text-gray-500 font-mono">{s.step}</div>
              <h3 className="mt-2 font-semibold text-lg">{s.title}</h3>
              <p className="mt-1 text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORMS */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Built for every platform</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["YouTube", "YouTube Shorts", "TikTok", "Instagram", "Facebook", "X", "LinkedIn"].map(
            (p) => (
              <span
                key={p}
                className="border border-gray-800 rounded-full px-4 py-2 text-sm text-gray-300"
              >
                {p}
              </span>
            )
          )}
        </div>
      </section>

      {/* PRICING PLACEHOLDER */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Simple pricing</h2>
        <p className="mt-3 text-gray-400">Pricing plans are coming soon.</p>
        <div className="mt-10 grid sm:grid-cols-3 gap-6">
          {["Free", "Pro", "Studio"].map((plan) => (
            <div key={plan} className="border border-gray-800 rounded-2xl p-8">
              <h3 className="font-semibold text-lg">{plan}</h3>
              <p className="mt-2 text-gray-500 text-sm">Coming soon</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Ready to plan your next post?</h2>
        <a
          href="/signup"
          className="mt-6 inline-block bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200"
        >
          Get started free
        </a>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-sm text-gray-500">
        © 2026 CreatorPilot. All rights reserved.
      </footer>
    </main>
  );
}
