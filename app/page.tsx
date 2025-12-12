"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import hero from "@/public/hero.avif";

type Category = { category_id: number; category_name: string; category_desc: string | null };
type BookRow = {
  book_id: number;
  title: string;
  year_published: number;
  book_status: string;
  is_digital: 0 | 1;
  img_link: string;
  author_first: string;
  author_last: string;
  category_name: string;
  branch_name: string;
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const catRef = useRef<HTMLDivElement | null>(null);
  const scrollCats = (dir: "left" | "right") => {
    const el = catRef.current;
    if (!el) return;
    const amount = 360;
    el.scrollTo({ left: dir === "left" ? el.scrollLeft - amount : el.scrollLeft + amount, behavior: "smooth" });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, bRes] = await Promise.all([fetch("/api/category"), fetch("/api/books")]);
        const [cData, bData] = await Promise.all([cRes.json(), bRes.json()]);
        if (!cRes.ok || !cData.success) throw new Error(cData.error || "Failed to load categories");
        if (!bRes.ok || !bData.success) throw new Error(bData.error || "Failed to load books");
        setCategories(cData.categories || []);
        setBooks(bData.books || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const latestBooks = useMemo(
    () => books.slice().sort((a, b) => b.book_id - a.book_id).slice(0, 5),
    [books]
  );

  const gradients = [
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-cyan-500 via-sky-500 to-blue-500",
    "from-amber-400 via-orange-500 to-rose-500",
    "from-emerald-400 via-green-500 to-teal-500",
    "from-fuchsia-500 via-purple-500 to-indigo-500",
    "from-blue-500 via-indigo-500 to-purple-500",
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      <section className="relative text-black">
        <Image src={hero} alt="Library hero" fill className="object-cover" priority sizes="100vw" placeholder="blur" />
        <div className="absolute inset-0 bg-white/40" />
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
          <div className="mb-3 text-center text-2xl font-semibold text-black">Featured Categories</div>
          <div className="mb-4 flex justify-end gap-2">
            <button onClick={() => scrollCats("left")} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-100">◀</button>
            <button onClick={() => scrollCats("right")} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-100">▶</button>
          </div>
          <div ref={catRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
            {loading ? (
              <div className="text-sm text-black/60 px-3 py-2">Loading categories...</div>
            ) : error ? (
              <div className="text-sm text-rose-700 px-3 py-2">{error}</div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-black/60 px-3 py-2">No categories available</div>
            ) : (
              categories.map((c, idx) => (
                <Link
                  key={c.category_id}
                  href={`/books?category_id=${c.category_id}`}
                  className="group relative w-[320px] shrink-0 snap-start overflow-hidden rounded-lg"
                >
                  <div className={`aspect-[5/3] w-full bg-gradient-to-br ${gradients[idx % gradients.length]} transition-transform group-hover:scale-[1.02]`} />
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute bottom-3 left-3">
                    <div className="rounded-md bg-white/90 px-2 py-1 text-sm font-medium text-[#0d2538] shadow-sm">{c.category_name}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section id="latest" className="mt-12">
          <div className="mb-6 text-center text-2xl font-semibold text-black">Latest Books</div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {loading ? (
              <div className="col-span-full text-sm text-black/60">Loading books...</div>
            ) : error ? (
              <div className="col-span-full text-sm text-rose-700">{error}</div>
            ) : latestBooks.length === 0 ? (
              <div className="col-span-full text-sm text-black/60">No books available</div>
            ) : (
              latestBooks.map((item) => (
                <Link key={item.book_id} href={`/books/${item.book_id}`} className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
                  <div className="aspect-[5/3] w-full bg-zinc-100">
                    <img src={item.img_link} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="mt-1 text-xs text-zinc-600">
                      {item.author_first} {item.author_last}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-wide text-zinc-500">{item.category_name}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
