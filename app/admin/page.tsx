"use client";
import StatCard from "@/components/cards/StatCard";
import { useAdminStore, BorrowRequest } from "@/components/admin/store/AdminStore";
import { useEffect, useState } from "react";

export default function Page() {
  const { books, loans, requests, branches } = useAdminStore();
  const totalBooks = books.length;
  const activeLoans = loans.filter((l) => l.status === "Borrowed").length;
  const pendingReq = requests.filter((r) => r.status === "Pending").length;
  const overdue = loans.filter((l) => l.status === "Overdue").length;
  const autoCancelledToday = requests.filter((r) => r.status === "Cancelled" && r.pickupDeadline && new Date(r.pickupDeadline).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard title="Total Books" value={totalBooks} />
        <StatCard title="Total Branches" value={branches.length} />
        <StatCard title="Active Loans" value={activeLoans} />
        <StatCard title="Pending Requests" value={pendingReq} />
        <StatCard title="Overdue Books" value={overdue} />
        <StatCard title="Auto-cancelled" value={autoCancelledToday} />
      </div>

      <LatestRequests />
    </div>
  );
}

function LatestRequests() {
  const { requests, books, approveRequest, cancelRequest, markPickedUp } = useAdminStore();
  const [nowTs, setNowTs] = useState<number>(0);
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);
  const latest = requests.slice(0, 10);
  const timeLeft = (r: BorrowRequest) => {
    if (!r.pickupDeadline || nowTs === 0) return "—";
    const ms = r.pickupDeadline - nowTs;
    if (ms <= 0) return "Expired";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold mb-3">Latest Borrow Requests</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Book</th>
              <th className="px-4 py-2 text-left">Branch</th>
              <th className="px-4 py-2 text-left">Digital?</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Time left</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {latest.map((r) => {
              const book = books.find((b) => b.id === r.bookId);
              return (
                <tr key={r.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">{r.user}</td>
                  <td className="px-4 py-2">{book?.title}</td>
                  <td className="px-4 py-2">{r.branch}</td>
                  <td className="px-4 py-2">{r.digital ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${r.status === "Pending" ? "bg-zinc-200" : r.status === "Approved" || r.status === "AwaitingPickup" ? "bg-amber-100" : r.status === "Borrowed" ? "bg-blue-100" : "bg-zinc-100"}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-2">{timeLeft(r)}</td>
                  <td className="px-4 py-2 space-x-2">
                    {r.status === "Pending" && (
                      <button onClick={() => approveRequest(r.id)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">Approve</button>
                    )}
                    {r.status !== "Borrowed" && (
                      <button onClick={() => cancelRequest(r.id)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">Cancel</button>
                    )}
                    {r.status === "Approved" || r.status === "AwaitingPickup" ? (
                      <button onClick={() => markPickedUp(r.id)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">Mark Picked Up</button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
