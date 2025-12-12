"use client";
import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/dashboard/Header";

type Pickup = {
  id: number;
  book_id: number;
  member_id: number;
  request_time: number;
  pickup_deadline: number;
};

type BookSummary = {
  book_id: number;
  title: string;
};

export default function Page() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [books, setBooks] = useState<Record<number, BookSummary>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/borrow");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load pickups");
      setPickups(data.pickups || []);

      // fetch book titles
      const bookIds = (data.pickups || []).map((p: Pickup) => p.book_id);
      if (bookIds.length) {
        const details = await Promise.all(
          bookIds.map(async (id: number) => {
            const r = await fetch(`/api/books/${id}`);
            const d = await r.json();
            return r.ok && d.success ? { id, title: d.book.title } : null;
          })
        );
        const map: Record<number, BookSummary> = {};
        details.forEach((d) => {
          if (d) map[d.id] = { book_id: d.id, title: d.title };
        });
        setBooks(map);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pickups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const timeLeft = (p: Pickup) => {
    const ms = p.pickup_deadline - Date.now();
    if (ms <= 0) return "Expired";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const cancel = async (book_id: number, member_id: number) => {
    setActioning(book_id);
    try {
      await fetch("/api/borrow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id, member_id }),
      });
      load();
    } finally {
      setActioning(null);
    }
  };

  const pickedUp = async (book_id: number, member_id: number) => {
    setActioning(book_id);
    try {
      await fetch("/api/borrow", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id, member_id }),
      });
      load();
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="Pickup" subtitle="Pending borrows" />
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Book</th>
              <th className="px-4 py-2 text-left">Member</th>
              <th className="px-4 py-2 text-left">Time left</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={4}>Loading pickups...</td>
              </tr>
            ) : pickups.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={4}>No active pickups</td>
              </tr>
            ) : (
              pickups.map((p) => (
                <tr key={p.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">{books[p.book_id]?.title || `Book #${p.book_id}`}</td>
                  <td className="px-4 py-2">Member #{p.member_id}</td>
                  <td className="px-4 py-2">{timeLeft(p)}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => pickedUp(p.book_id, p.member_id)}
                      disabled={actioning === p.book_id}
                      className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                    >
                      Picked Up
                    </button>
                    <button
                      onClick={() => cancel(p.book_id, p.member_id)}
                      disabled={actioning === p.book_id}
                      className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
