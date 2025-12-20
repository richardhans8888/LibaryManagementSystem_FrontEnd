"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Author = { author_id: number; first_name: string; last_name: string };

export default function Page() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/author");
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to load authors");
        setAuthors(data.authors || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load authors");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="bg-[#f8f9fa] border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="font-serif text-4xl font-bold text-[#0d2538]">Authors</h1>
          <p className="mt-2 text-zinc-600">Browse authors and view their complete works.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 mb-6">{error}</div> : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-sm text-black/60">Loading authors...</div>
          ) : authors.length === 0 ? (
            <div className="col-span-full text-sm text-black/60">No authors available.</div>
          ) : (
            authors.map((a) => (
              <Link
                key={a.author_id}
                href={`/authors/${a.author_id}`}
                className="group block rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-zinc-300"
              >
                <div className="text-lg font-semibold text-[#0d2538] group-hover:text-blue-800 transition-colors">
                  {a.first_name} {a.last_name}
                </div>
                <div className="mt-2 text-xs text-zinc-500 font-medium uppercase tracking-wider">View Books →</div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
