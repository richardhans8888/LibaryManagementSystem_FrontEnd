"use client";
import { useRef } from "react";

export default function Home() {
  const trendingRef = useRef<HTMLDivElement | null>(null);
  const scrollTrending = (dir: "left" | "right") => {
    const el = trendingRef.current;
    if (!el) return;
    const amount = 320;
    el.scrollTo({ left: dir === "left" ? el.scrollLeft - amount : el.scrollLeft + amount, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold">Library</div>
          <nav className="hidden gap-6 text-sm sm:flex">
            <a href="#help" className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">Help</a>
            <a href="#collections" className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">Collections</a>
            <a href="#events" className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">Events</a>
            <a href="#visit" className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">Visit</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900 sm:block">MyAccount</button>
            <button className="rounded-full border border-zinc-300 p-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900" aria-label="Search">
              <span className="inline-block h-4 w-4 rounded-sm bg-zinc-900 dark:bg-zinc-200" />
            </button>
          </div>
        </div>
      </header>

      <section className="relative">
        <img
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1500&auto=format&fit=crop"
          alt="Library"
          className="h-[420px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/10" />
        <div className="absolute inset-0 mx-auto flex max-w-7xl items-end px-6 pb-14">
          <div className="max-w-2xl text-white">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm">How to</div>
            <h1 className="text-4xl font-bold leading-tight">Borrow, Renew, and Return Library Materials</h1>
            <p className="mt-3 text-lg">Connect with the library materials you need to get your work done.</p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6">
        <section id="collections" className="mt-12">
          <div className="mb-6 text-2xl font-semibold">Featured Categories</div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Books", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop" },
              { title: "Journals", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop" },
              { title: "eResources", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop" },
              { title: "Media", img: "https://images.unsplash.com/photo-1519076949810-56f48f3bcb34?q=80&w=800&auto=format&fit=crop" },
            ].map((c) => (
              <a key={c.title} href="#" className="group relative block h-56 overflow-hidden rounded-lg">
                <img src={c.img} alt={c.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-lg font-semibold">{c.title}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section id="trending" className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-2xl font-semibold">Trending</div>
            <div className="flex gap-2">
              <button onClick={() => scrollTrending("left")} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">◀</button>
              <button onClick={() => scrollTrending("right")} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">▶</button>
            </div>
          </div>
          <div ref={trendingRef} className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
            {[
              { title: "Design Patterns", location: "Main Library", img: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=900&auto=format&fit=crop" },
              { title: "Deep Learning", location: "Science Library", img: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?q=80&w=900&auto=format&fit=crop" },
              { title: "Ancient History", location: "Archives", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=900&auto=format&fit=crop" },
              { title: "Modern Art", location: "Arts Library", img: "https://images.unsplash.com/photo-1495462911434-be47104d70fa?q=80&w=900&auto=format&fit=crop" },
              { title: "Quantum Physics", location: "Research Library", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=900&auto=format&fit=crop" },
            ].map((item) => (
              <a key={item.title} href="#" className="group w-[280px] shrink-0 snap-start overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                <img src={item.img} alt={item.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{item.location}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
