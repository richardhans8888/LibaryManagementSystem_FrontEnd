"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const toNumber = (value: string | null) => {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

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
  category_id: number;
  category_name: string;
  branch_name: string;
};

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();
  const paramCategory = params.get("category_id");

  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(toNumber(paramCategory));

  useEffect(() => {
    setCategoryId(toNumber(paramCategory));
  }, [paramCategory]);

  const loadCategories = async () => {
    const res = await fetch("/api/category");
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to load categories");
    setCategories(data.categories || []);
  };

  const loadBooks = async (cat: number | null) => {
    setLoading(true);
    setError(null);
    try {
      const q = cat ? `?category_id=${cat}` : "";
      const res = await fetch(`/api/books${q}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load books");
      setBooks(data.books || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories().catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    loadBooks(categoryId);
  }, [categoryId]);

  const onCategoryChange = (val: string) => {
    const cat = toNumber(val || null);
    setCategoryId(cat);
    const sp = new URLSearchParams(params.toString());
    if (cat) sp.set("category_id", String(cat));
    else sp.delete("category_id");
    router.replace(`/books${sp.toString() ? "?" + sp.toString() : ""}`);
  };

  const latestBooks = useMemo(() => books.slice().sort((a, b) => b.book_id - a.book_id), [books]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="bg-[#f8f9fa] border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="font-serif text-4xl font-bold text-[#0d2538]">Library Collection</h1>
          <p className="mt-2 text-zinc-600">Explore our extensive catalog of books, journals, and media.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row gap-10">
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">Categories</div>
            <div className="space-y-2">
              <button
                onClick={() => onCategoryChange("")}
                className={`block text-sm w-full text-left ${!categoryId ? "font-semibold text-[#0d2538]" : "text-zinc-600 hover:text-[#0d2538]"}`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.category_id}
                  onClick={() => onCategoryChange(String(c.category_id))}
                  className={`block text-sm w-full text-left ${categoryId === c.category_id ? "font-semibold text-[#0d2538]" : "text-zinc-600 hover:text-[#0d2538]"}`}
                >
                  {c.category_name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 mb-6">{error}</div> : null}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {loading ? (
              <div className="col-span-full text-sm text-black/60">Loading books...</div>
            ) : latestBooks.length === 0 ? (
              <div className="col-span-full text-sm text-black/60">No books available.</div>
            ) : (
              latestBooks.map((b) => (
                <Link href={`/books/${b.book_id}`} key={b.book_id} className="group flex flex-col">
                  <div className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 shadow-sm transition-all group-hover:shadow-md">
                    <div className="aspect-[2/3] w-full relative">
                      <img src={b.img_link} alt={b.title} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-1">
                    <div className="text-sm font-semibold text-[#0d2538] line-clamp-2 leading-tight">{b.title}</div>
                    <div className="text-xs text-zinc-500">{b.author_first} {b.author_last}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
