"use client";
import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/dashboard/Header";

type Borrowing = {
  borrowing_id: number;
  book_id: number;
  member_id: number;
  borrowed_at: string;
  due_date: string;
  return_date: string | null;
  title: string;
  member_name: string;
};

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

  const [view, setView] = useState<"active" | "history">("active");
  const [rows, setRows] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (v: "active" | "history") => {
    if (!memberId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/borrowings?view=${v}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load borrowings");
      const mine = (data.borrowings || []).filter((b: Borrowing) => b.member_id === memberId);
      setRows(mine);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load borrowings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(view);
  }, [view, memberId]);

  const fee = (due: string) => {
    const now = Date.now();
    const dueMs = new Date(due).getTime();
    if (now <= dueMs) return 0;
    const daysLate = Math.ceil((now - dueMs) / (24 * 3600 * 1000));
    const rate = 1; // $1/day placeholder
    return daysLate * rate;
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="Borrowings" subtitle="Your active and past loans" />
      <div className="flex gap-2">
        <button
          onClick={() => setView("active")}
          className={`rounded-xl px-3 py-2 text-sm border ${view === "active" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white"}`}
        >
          Currently Borrowed
        </button>
        <button
          onClick={() => setView("history")}
          className={`rounded-xl px-3 py-2 text-sm border ${view === "history" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white"}`}
        >
          Borrow History
        </button>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Book</th>
              <th className="px-4 py-2 text-left">Borrowed</th>
              <th className="px-4 py-2 text-left">Due</th>
              <th className="px-4 py-2 text-left">Returned</th>
              <th className="px-4 py-2 text-left">Fees (UI)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={5}>Loading...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={5}>No records</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.borrowing_id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">{r.title}</td>
                  <td className="px-4 py-2">{new Date(r.borrowed_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{new Date(r.due_date).toLocaleString()}</td>
                  <td className="px-4 py-2">{r.return_date ? new Date(r.return_date).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2">
                    {r.return_date ? "0" : `$${fee(r.due_date)}`}
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
