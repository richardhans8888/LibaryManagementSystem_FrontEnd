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

  const statusBadge = (value: string) => {
    const base = "inline-flex items-center rounded-full px-2 py-1 text-[11px]";
    if (value === "available") return `${base} bg-green-100`;
    if (value === "reserved") return `${base} bg-amber-100`;
    if (value === "borrowed") return `${base} bg-blue-100`;
    return `${base} bg-zinc-200`;
  };

  const onCategoryChange = (val: string) => {
    const cat = toNumber(val || null);
    setCategoryId(cat);
    const sp = new URLSearchParams(params.toString());
    if (cat) sp.set("category_id", String(cat));
    else sp.delete("category_id");
    router.replace(`/books${sp.toString() ? "?" + sp.toString() : ""}`);
  };

  const latestBooks = useMemo(() => books.slice().sort((a, b) => b.book_id - a.book_id).slice(0, 8), [books]);

  const displayBooks = useMemo(() => latestBooks, [latestBooks]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-2xl font-semibold">All Books</div>
        </div>
        <select
          value={categoryId ?? ""}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.category_name}
            </option>
          ))}
        </select>
      </div>

      {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {loading ? (
          <div className="col-span-full text-sm text-black/60">Loading books...</div>
        ) : latestBooks.length === 0 ? (
          <div className="col-span-full text-sm text-black/60">No books available.</div>
        ) : (
          displayBooks.map((b) => (
            <Link href={`/books/${b.book_id}`} key={b.book_id} className="group">
              <div className="overflow-hidden rounded-md">
                <div className="aspect-[4/5] w-full bg-zinc-100">
                  <img src={b.img_link} alt={b.title} className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="mt-2 text-xs text-black text-center">{b.title}</div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-10 text-sm text-black/60">
      </div>
    </div>
  );
}
