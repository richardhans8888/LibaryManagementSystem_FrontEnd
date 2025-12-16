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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <div className="text-2xl font-semibold">Authors</div>
        <div className="text-sm text-black/60">Browse authors and view their books.</div>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-sm text-black/60">Loading authors...</div>
        ) : authors.length === 0 ? (
          <div className="col-span-full text-sm text-black/60">No authors available.</div>
        ) : (
          authors.map((a) => (
            <Link
              key={a.author_id}
              href={`/authors/${a.author_id}`}
              className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm hover:border-zinc-300"
            >
              <div className="font-semibold">{a.first_name} {a.last_name}</div>
              <div className="text-xs text-black/60">View books</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
