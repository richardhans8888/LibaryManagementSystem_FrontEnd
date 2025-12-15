"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Category = { category_id: number; category_name: string; category_desc: string | null };
type BookRow = {
  book_id: number;
  title: string;
  year_published: number;
  book_status: string;
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

  const latestDiscover = useMemo(
    () => books.slice().sort((a, b) => b.book_id - a.book_id).slice(0, 8),
    [books]
  );

  const displayDiscover = useMemo(() => latestDiscover, [latestDiscover]);

  const displayCategories = useMemo(() => {
    const desired = 6;
    return categories.slice(0, desired);
  }, [categories]);

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

      <section className="relative text-black min-h-[60vh] lg:min-h-[72vh]">
        <img src="/background_hero.jpg" alt="Library background" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 py-24 lg:py-32">
          <div className="w-full max-w-6xl rounded-lg bg-neutral-900/90 p-10 text-white shadow-xl min-h-[18rem] lg:min-h-[22rem]">
            <div className="text-xs uppercase tracking-wider text-white/80">About the Library</div>
            <h1 className="mt-2 font-sans tracking-normal text-5xl font-medium" style={{ fontFamily: 'var(--font-dm-sans)' }}>Read, learn, and connect</h1>
            <p className="mt-3 text-base leading-relaxed text-white/90">Borrow books, explore research tools, attend events, and access digital archives—all with your library card.</p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6">
        <section id="categories-row" className="mt-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="text-sm font-semibold text-[#0d2538]">Categories</div>
            <div className="h-px flex-1 bg-[#0d2538]" />
          </div>
          {loading ? (
            <div className="text-sm text-black/60">Loading…</div>
          ) : error ? (
            <div className="text-sm text-rose-700">{error}</div>
          ) : (
            <>
            {displayCategories.length === 0 ? (
              <div className="text-sm text-black/60">No categories available</div>
            ) : (
              <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-start">
                {displayCategories.map((c, idx) => (
                  <Link key={`${c.category_id}-${c.category_name}`} href={c.category_id > 0 ? `/books?category_id=${c.category_id}` : "/books"} className="group">
                    <div className={`aspect-square w-full overflow-hidden rounded-md bg-gradient-to-br ${gradients[idx % gradients.length]}`} />
                    <div className="mt-3 text-base font-medium text-black">{c.category_name}</div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <Link href="/books" className="inline-flex items-center rounded-full border border-[#0d2538] px-6 py-2 text-sm font-semibold text-[#0d2538] hover:bg-[#0d2538]/10">SEE MORE…</Link>
              </div>
              </>
            )}
            </>
          )}
        </section>

        <section id="latest" className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="text-sm font-semibold text-[#0d2538]">Our Latest Books</div>
            <div className="h-px flex-1 bg-[#0d2538]" />
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {loading ? (
              <div className="col-span-full text-sm text-black/60">Loading books...</div>
            ) : error ? (
              <div className="col-span-full text-sm text-rose-700">{error}</div>
            ) : latestDiscover.length === 0 ? (
              <div className="col-span-full text-sm text-black/60">No books available</div>
            ) : (
              displayDiscover.map((item) => (
                <Link key={item.book_id} href={`/books/${item.book_id}`} className="group">
                  <div className="aspect-[4/5] w-full overflow-hidden rounded-md bg-zinc-100">
                    <img src={item.img_link} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-2 text-xs text-black text-center">{item.title}</div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
