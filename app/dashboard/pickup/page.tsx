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

type BookInfo = { title: string; branch: string };

export default function Page() {
  const memberId = useMemo(() => {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";").reduce<Record<string, string>>((acc, c) => {
      const [k, ...v] = c.trim().split("=");
      if (k) acc[k] = decodeURIComponent(v.join("="));
      return acc;
    }, {});
    if (!cookies.member_session && !cookies.member_public) return null;
    try {
      const raw = cookies.member_session || cookies.member_public;
      const parsed = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
      return parsed.member_id as number;
    } catch {
      return null;
    }
  }, []);

  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [books, setBooks] = useState<Record<number, BookInfo>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!memberId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/borrow");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load pickups");
      const mine = (data.pickups || []).filter((p: Pickup) => p.member_id === memberId);
      setPickups(mine);
      // load book info
      const details = await Promise.all(
        mine.map(async (p: Pickup) => {
          const r = await fetch(`/api/books/${p.book_id}`);
          const d = await r.json();
          if (r.ok && d.success) {
            return { book_id: p.book_id, title: d.book.title, branch: d.book.branch_name };
          }
          return null;
        })
      );
      const map: Record<number, BookInfo> = {};
      details.forEach((d) => {
        if (d) map[d.book_id] = { title: d.title, branch: d.branch };
      });
      setBooks(map);
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
  }, [memberId]);

  const timeLeft = (p: Pickup) => {
    const ms = p.pickup_deadline - Date.now();
    if (ms <= 0) return "Expired";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="Pickup" subtitle="Your reserved books (3-hour window)" />
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Book</th>
              <th className="px-4 py-2 text-left">Branch</th>
              <th className="px-4 py-2 text-left">Time left</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={3}>Loading pickups...</td>
              </tr>
            ) : pickups.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={3}>No active pickups</td>
              </tr>
            ) : (
              pickups.map((p) => (
                <tr key={p.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">{books[p.book_id]?.title || `Book #${p.book_id}`}</td>
                  <td className="px-4 py-2">{books[p.book_id]?.branch || "—"}</td>
                  <td className="px-4 py-2">{timeLeft(p)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
