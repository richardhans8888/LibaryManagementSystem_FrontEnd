"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Author = { author_id: number; first_name: string; last_name: string };
type Book = {
  book_id: number;
  title: string;
  img_link: string;
  book_status: string;
  branch_name: string;
};

export default function Page() {
  const { author_id } = useParams<{ author_id: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authorIdNum = useMemo(() => Number(author_id), [author_id]);

  useEffect(() => {
    if (!authorIdNum || Number.isNaN(authorIdNum)) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [aRes, bRes] = await Promise.all([
          fetch(`/api/author/${authorIdNum}`),
          fetch(`/api/books?author_id=${authorIdNum}`),
        ]);
        const [aData, bData] = await Promise.all([aRes.json(), bRes.json()]);
        if (!aRes.ok || !aData.success) throw new Error(aData.error || "Failed to load author");
        if (!bRes.ok || !bData.success) throw new Error(bData.error || "Failed to load books");
        setAuthor(aData.author);
        const filtered = (bData.books as any[]).filter((bk) =>
          Array.isArray(bk.authors) && bk.authors.some((au) => au.author_id === authorIdNum)
        );
        setBooks(filtered);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load author/books");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authorIdNum]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/authors" className="text-sm text-blue-700 hover:underline">← Back to authors</Link>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div>
        <div className="text-2xl font-semibold">
          {author ? `${author.first_name} ${author.last_name}` : "Author"}
        </div>
        <div className="text-sm text-black/60">Books by this author</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-sm text-black/60">Loading...</div>
        ) : books.length === 0 ? (
          <div className="col-span-full text-sm text-black/60">No books found for this author.</div>
        ) : (
          books.map((b) => (
            <Link key={b.book_id} href={`/books/${b.book_id}`} className="group">
              <div className="overflow-hidden rounded-md">
                <div className="aspect-[4/5] w-full bg-zinc-100">
                  <img src={b.img_link} alt={b.title} className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="mt-2 text-xs text-black text-center">
                {b.title}
                <div className="text-[11px] italic text-black/70">{b.branch_name}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
