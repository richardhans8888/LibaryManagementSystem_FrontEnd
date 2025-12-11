"use client";
import { useAdminStore } from "@/components/admin/store/AdminStore";
import { useEffect, useState } from "react";

export default function Page() {
  const { loans, books, members, markReturned } = useAdminStore();
  const [nowTs, setNowTs] = useState<number>(0);
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Active Loans</div>
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Member</th>
              <th className="px-4 py-2 text-left">Book</th>
              <th className="px-4 py-2 text-left">Branch</th>
              <th className="px-4 py-2 text-left">Due</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((l) => {
              const book = books.find((b) => b.id === l.bookId);
              const mem = members.find((m) => m.name === l.user);
              const due = new Date(l.dueAt).toLocaleDateString();
              const overdue = l.status === "Overdue" || l.dueAt < nowTs;
              return (
                <tr key={l.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">{mem?.name || l.user}</td>
                  <td className="px-4 py-2">{book?.title}</td>
                  <td className="px-4 py-2">{l.branch}</td>
                  <td className="px-4 py-2">{due}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${overdue ? "bg-rose-100" : "bg-blue-100"}`}>{overdue ? "Overdue" : "Borrowed"}</span>
                  </td>
                  <td className="px-4 py-2">
                    {l.status !== "Returned" ? (
                      <button onClick={() => markReturned(l.id)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">Mark Returned</button>
                    ) : (
                      <span className="text-black/60">Returned</span>
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
