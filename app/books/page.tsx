"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BOOKS, THEMES } from "@/data/books";

export default function BooksPage() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string | null>(null);
  const [inStock, setInStock] = useState(true);

  const filtered = useMemo(() => {
    return BOOKS.filter((b) => {
      const matchesQuery = query
        ? b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesTheme = theme ? b.theme === theme : true;
      const matchesStock = inStock ? true : true;
      return matchesQuery && matchesTheme && matchesStock;
    });
  }, [query, theme, inStock]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">Filter</div>
            <div className="mt-4">
              <div className="text-xs font-medium text-zinc-600">Theme</div>
              <ul className="mt-2 space-y-2">
                <li>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === null}
                      onChange={() => setTheme(null)}
                    />
                    All
                  </label>
                </li>
                {THEMES.map((t) => (
                  <li key={t}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="theme"
                        checked={theme === t}
                        onChange={() => setTheme(t)}
                      />
                      {t}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                />
                Only available
              </label>
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-2xl font-semibold">Books</div>
            <div className="flex w-full gap-2 sm:w-96">
              <input
                type="text"
                placeholder="Search by title or author"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
              />
              <button className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-100">
                Search
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((b) => (
              <Link
                key={b.id}
                href={`/books/${b.id}`}
                className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <img src={b.cover} alt={b.title} className="h-48 w-full object-cover" />
                <div className="p-4">
                  <div className="text-sm font-semibold">{b.title}</div>
                  <div className="mt-1 text-xs text-zinc-600">{b.author}</div>
                  <div className="mt-2 inline-flex items-center rounded-full border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700">
                    {b.theme}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

