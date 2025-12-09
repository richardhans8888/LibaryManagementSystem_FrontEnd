"use client";
import Image from "next/image";
import hero from "@/public/hero.avif";
import { BOOKS } from "@/data/books";

export default function Home() {

  return (
    <div className="min-h-screen bg-white font-sans">

      <section className="relative text-white">
        <Image src={hero} alt="Library hero" fill className="object-cover" priority sizes="100vw" placeholder="blur" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <h1 className="font-serif text-5xl font-bold leading-tight">Discover, borrow, and explore knowledge</h1>
              <p className="max-w-xl text-base opacity-90">From research guides to new arrivals, our library helps you find and use materials faster.</p>
              <div className="grid grid-cols-2 gap-4 [grid-auto-rows:14rem]">
                {[
                  { title: "Borrow & Renew", tag: "Service", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=900&auto=format&fit=crop" },
                  { title: "Research Guides", tag: "Help", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=900&auto=format&fit=crop" },
                  { title: "Workshops & Events", tag: "Events", img: "https://images.unsplash.com/photo-1495462911434-be47104d70fa?q=80&w=900&auto=format&fit=crop" },
                  { title: "New Arrivals", tag: "Collections", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900&auto=format&fit=crop" },
                ].map((c) => (
                  <a key={c.title} href="#" className="group relative h-56 overflow-hidden rounded-lg bg-[#183a52] ring-1 ring-white/10">
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
              <div className="min-h-[464px] overflow-hidden rounded-lg bg-[#183a52] ring-1 ring-white/10">
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
          <div className="mb-6 text-center text-2xl font-semibold text-black">Featured Categories</div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-5">
            {[
              { title: "Educational", img: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop" },
              { title: "Horror", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop" },
              { title: "Fantasy", img: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=800&auto=format&fit=crop" },
              { title: "History", img: "https://images.unsplash.com/photo-1528209712924-8b4b12dd5fcb?q=80&w=800&auto=format&fit=crop" },
              { title: "Mystery & Detective", img: "https://images.unsplash.com/photo-1495462911434-be47104d70fa?q=80&w=800&auto=format&fit=crop" },
            ].map((c) => (
              <a key={c.title} href="#" className="group relative block aspect-[5/3] overflow-hidden rounded-lg">
                <img src={c.img} alt={c.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <div className="rounded-md bg-white/90 px-2 py-1 text-sm font-medium text-[#0d2538] shadow-sm">{c.title}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section id="latest" className="mt-12">
          <div className="mb-6 text-center text-2xl font-semibold text-black">Latest Books</div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {BOOKS.sort((a,b)=> new Date(b.addedAt).getTime()-new Date(a.addedAt).getTime()).slice(0,8).map((item) => (
              <a key={item.id} href={`/books/${item.id}`} className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="aspect-[5/3] w-full">
                  <img src={item.cover} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
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
