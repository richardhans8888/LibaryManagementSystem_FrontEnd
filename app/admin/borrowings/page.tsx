"use client";
import { useEffect, useState } from "react";
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
  staff_id: number | null;
  staff_name: string | null;
  staff_branch: string | null;
};

export default function Page() {
  const [view, setView] = useState<"active" | "history">("active");
  const [rows, setRows] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<number | null>(null);

  const load = async (v: "active" | "history") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/borrowings?view=${v}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load borrowings");
      setRows(data.borrowings || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load borrowings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(view);
  }, [view]);

  const markReturned = async (borrowing_id: number) => {
    setActioning(borrowing_id);
    try {
      const res = await fetch("/api/borrowings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ borrowing_id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update");
      load(view);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setActioning(null);
    }
  };

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
      <DashboardHeader title="Borrowings" subtitle="Active and returned loans" />
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
              <th className="px-4 py-2 text-left">Member</th>
              <th className="px-4 py-2 text-left">Staff</th>
              <th className="px-4 py-2 text-left">Borrowed</th>
              <th className="px-4 py-2 text-left">Due</th>
              <th className="px-4 py-2 text-left">Returned</th>
              <th className="px-4 py-2 text-left">Fees (UI)</th>
              {view === "active" ? <th className="px-4 py-2 text-left">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={view === "active" ? 8 : 7}>Loading...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={view === "active" ? 8 : 7}>No records</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.borrowing_id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">{r.title}</td>
                  <td className="px-4 py-2">{r.member_name || `Member #${r.member_id}`}</td>
                  <td className="px-4 py-2">
                    <div className="text-sm text-black/80">
                      {r.staff_name || "—"}
                      {r.staff_branch ? <div className="text-[11px] text-black/60">{r.staff_branch}</div> : null}
                    </div>
                  </td>
                  <td className="px-4 py-2">{new Date(r.borrowed_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{new Date(r.due_date).toLocaleString()}</td>
                  <td className="px-4 py-2">{r.return_date ? new Date(r.return_date).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2">
                    {r.return_date ? "0" : `$${fee(r.due_date)}`}
                  </td>
                  {view === "active" ? (
                    <td className="px-4 py-2">
                      <button
                        onClick={() => markReturned(r.borrowing_id)}
                        disabled={actioning === r.borrowing_id}
                        className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                      >
                        {actioning === r.borrowing_id ? "Saving..." : "Mark Returned"}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
