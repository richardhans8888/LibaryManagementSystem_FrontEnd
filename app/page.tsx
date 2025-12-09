"use client";
import { BOOKS } from "@/data/books";

export default function Home() {

  return (
    <div className="min-h-screen bg-white font-sans">

      <section className="bg-[#0d2538] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <h1 className="font-serif text-5xl font-bold leading-tight">Discover, borrow, and explore knowledge</h1>
              <p className="max-w-xl text-base opacity-90">From research guides to new arrivals, our library helps you find and use materials faster.</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Borrow & Renew", tag: "Service", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=900&auto=format&fit=crop" },
                  { title: "Research Guides", tag: "Help", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=900&auto=format&fit=crop" },
                  { title: "Workshops & Events", tag: "Events", img: "https://images.unsplash.com/photo-1495462911434-be47104d70fa?q=80&w=900&auto=format&fit=crop" },
                  { title: "New Arrivals", tag: "Collections", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900&auto=format&fit=crop" },
                ].map((c) => (
                  <a key={c.title} href="#" className="group relative overflow-hidden rounded-lg bg-[#0f2f44] h-56">
                    <img src={c.img} alt={c.title} className="h-full w-full object-cover opacity-70" />
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      <div className="text-xs uppercase tracking-wide opacity-80">{c.tag}</div>
                      <div className="mt-1 text-sm font-semibold">{c.title}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-lg bg-[#183a52] h-[464px]">
                <img src="https://images.unsplash.com/photo-1553531888-a0a46c18d89b?q=80&w=1000&auto=format&fit=crop" alt="Digital archives" className="h-full w-full object-cover opacity-70" />
                <div className="p-5">
                  <div className="text-xs uppercase tracking-wide opacity-80">Case study</div>
                  <div className="mt-1 text-lg font-semibold">Digitizing local history archives for global access</div>
                  <button className="mt-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm text-[#0d2538] hover:bg-zinc-200">Read the story →</button>
                </div>
              </div>
              <div className="rounded-lg bg-[#2a4356] p-5">
                <div className="text-sm">Subscribe for library updates: new books, events, and services.</div>
                <form className="mt-3 flex gap-2">
                  <input type="email" placeholder="Email address" className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm placeholder-white/60 outline-none focus:border-white/40" />
                  <button className="rounded-md bg-[#3ea6ff] px-4 py-2 text-sm text-[#0d2538]">→</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6">
        <section id="categories" className="mt-12">
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

        <section id="latest" className="mt-12">
          <div className="mb-6 text-2xl font-semibold">Latest Books</div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {BOOKS.sort((a,b)=> new Date(b.addedAt).getTime()-new Date(a.addedAt).getTime()).slice(0,8).map((item) => (
              <a key={item.id} href={`/books/${item.id}`} className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
                <img src={item.cover} alt={item.title} className="h-48 w-full object-cover" />
                <div className="p-4">
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs text-zinc-600">{item.author}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
