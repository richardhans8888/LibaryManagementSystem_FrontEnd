"use client";
import { useEffect, useState } from "react";
import { useAdminStore, BorrowRequest } from "@/components/admin/store/AdminStore";

export default function Page() {
  const { requests, books, approveRequest, cancelRequest, markPickedUp } = useAdminStore();
  const [nowTs, setNowTs] = useState<number>(0);
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);

  const timeLeft = (r: BorrowRequest) => {
    if (!r.pickupDeadline || nowTs === 0) return "—";
    const ms = r.pickupDeadline - nowTs;
    if (ms <= 0) return "Expired";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Borrow Requests</div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Book</th>
              <th className="px-4 py-2 text-left">Digital?</th>
              <th className="px-4 py-2 text-left">Requested</th>
              <th className="px-4 py-2 text-left">Availability</th>
              <th className="px-4 py-2 text-left">Time left</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const book = books.find((b) => b.id === r.bookId);
              return (
                <tr key={r.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">{r.user}</td>
                  <td className="px-4 py-2">{book?.title}</td>
                  <td className="px-4 py-2">{r.digital ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{new Date(r.requestedAt).toLocaleString()}</td>
                  <td className="px-4 py-2">{book?.status}</td>
                  <td className="px-4 py-2">{timeLeft(r)}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${r.status === "Pending" ? "bg-zinc-200" : r.status === "Approved" || r.status === "AwaitingPickup" ? "bg-amber-100" : r.status === "Borrowed" ? "bg-blue-100" : "bg-zinc-100"}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {r.status === "Pending" && (
                      <button onClick={() => approveRequest(r.id)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">Approve</button>
                    )}
                    {r.status !== "Borrowed" && (
                      <button onClick={() => cancelRequest(r.id)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">Cancel</button>
                    )}
                    {(r.status === "Approved" || r.status === "AwaitingPickup") && !r.digital && (
                      <button onClick={() => markPickedUp(r.id)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">Mark Picked Up</button>
                    )}
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
