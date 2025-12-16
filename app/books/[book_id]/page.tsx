"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type BookRow = {
  book_id: number;
  title: string;
  year_published: number;
  book_status: string;
  img_link: string;
  book_desc?: string | null;
  language?: string | null;
  category_name: string;
  branch_name: string;
  authors: { author_id: number; first_name: string; last_name: string }[];
};

export default function Page() {
  const { book_id } = useParams<{ book_id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<BookRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [borrowMsg, setBorrowMsg] = useState<string | null>(null);
  const [borrowErr, setBorrowErr] = useState<string | null>(null);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const memberCookie = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.cookie.split(";").reduce<Record<string, string>>((acc, cur) => {
      const [k, ...v] = cur.trim().split("=");
      if (k) acc[k] = decodeURIComponent(v.join("="));
      return acc;
    }, {});
    return c.member_public || null;
  }, []);

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
    if (value === "lost") return `${base} bg-rose-100`;
    return `${base} bg-zinc-200`;
  };

  const borrowDisabled = !book || book.book_status !== "available";

  const borrowBook = async () => {
    if (!book) return;
    if (!memberCookie) {
      router.push("/login");
      return;
    }
    setBorrowLoading(true);
    setBorrowErr(null);
    setBorrowMsg(null);
    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: book.book_id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to borrow book");
      setBook((curr) => (curr ? { ...curr, book_status: "borrowed" } : curr));
      if (data.pickup_deadline) {
        setBorrowMsg(`Reserved. Please pick up before ${new Date(data.pickup_deadline).toLocaleTimeString()}.`);
      } else {
        setBorrowMsg("Reserved for pickup. Please collect within 3 hours.");
      }
    } catch (e) {
      setBorrowErr(e instanceof Error ? e.message : "Failed to borrow book");
    } finally {
      setBorrowLoading(false);
    }
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
          <button
            onClick={borrowBook}
            className={`w-full rounded-md px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-60 ${borrowDisabled ? "bg-blue-200 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            disabled={borrowDisabled || borrowLoading}
          >
            {borrowLoading ? "Reserving..." : "Borrow"}
          </button>
          {borrowMsg ? <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-900">{borrowMsg}</div> : null}
          {borrowErr ? <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">{borrowErr}</div> : null}
          <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm space-y-1">
            <div><span className="font-semibold">Branch:</span> {book.branch_name}</div>
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
              {book.authors.length === 0
                ? "Unknown"
                : book.authors.map((a, idx) => (
                    <span key={a.author_id}>
                      <Link href={`/authors/${a.author_id}`} className="text-blue-700 hover:underline">
                        {a.first_name} {a.last_name}
                      </Link>
                      {idx < book.authors.length - 1 ? ", " : ""}
                    </span>
                  ))}
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
