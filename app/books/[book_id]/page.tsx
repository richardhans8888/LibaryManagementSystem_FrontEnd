"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type BookRow = {
  book_id: number;
  title: string;
  year_published: number;
  book_status: string;
  is_digital: 0 | 1;
  img_link: string;
  author_id: number;
  author_first: string;
  author_last: string;
  book_desc?: string | null;
  language?: string | null;
  category_name: string;
  branch_name: string;
};

export default function Page() {
  const { book_id } = useParams<{ book_id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<BookRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!book_id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/books/${book_id}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to load book");
        setBook(data.book);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load book");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [book_id]);

  const statusBadge = (value: string) => {
    const base = "inline-flex items-center rounded-full px-2 py-1 text-xs";
    if (value === "available") return `${base} bg-green-100`;
    if (value === "reserved") return `${base} bg-amber-100`;
    if (value === "borrowed") return `${base} bg-blue-100`;
    if (value === "loss" || value === "lost") return `${base} bg-rose-100`;
    return `${base} bg-zinc-200`;
  };

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-black/60">Loading...</div>;
  if (error) return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-rose-700">{error}</div>;
  if (!book) return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-black/60">Book not found.</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full max-w-xs shrink-0 space-y-3">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="aspect-[2/3] bg-zinc-100">
              <img src={book.img_link} alt={book.title} className="h-full w-full object-cover" />
            </div>
          </div>
          <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60" disabled>
            Borrow
          </button>
          <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm space-y-1">
            <div><span className="font-semibold">Branch:</span> {book.branch_name}</div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Format:</span>
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-1 text-xs">
                {book.is_digital ? "DIGITAL" : "PHYSICAL"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <span className={statusBadge(book.book_status)}>{book.book_status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="text-xs uppercase tracking-wide text-black/60">Overview</div>
          <div>
            <div className="text-3xl font-semibold">{book.title}</div>
            <div className="mt-2 text-sm">
              by{" "}
              <Link href={`/authors/${book.author_id ?? ""}`} className="text-blue-700 hover:underline">
                {book.author_first} {book.author_last}
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-black/60">Category: {book.category_name}</span>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-black/70">{book.book_desc || `This book is available at the ${book.branch_name} branch. Borrow it to explore its insights and add it to your reading list.`}</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
              <div className="text-xs uppercase text-black/50">Publish Date</div>
              <div className="mt-1 font-semibold">{book.year_published}</div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
              <div className="text-xs uppercase text-black/50">Language</div>
              <div className="mt-1 font-semibold">{book.language || "—"}</div>
            </div>
          </div>

          <div className="text-sm text-black/60">
          </div>

          <div className="flex gap-3 text-sm">
            <button onClick={() => router.back()} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
