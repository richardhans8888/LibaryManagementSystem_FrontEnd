"use client";
import { useMemo, useState } from "react";

type Loan = {
  id: number;
  member: string;
  book: string;
  branch: string;
  borrowed: string;
  due: string;
  status: "Borrowed" | "Overdue" | "Returned";
};

const DATA: Loan[] = [
  { id: 1, member: "Jane Doe", book: "1984", branch: "Central", borrowed: "2025-12-10", due: "2025-12-17", status: "Borrowed" },
  { id: 2, member: "John Smith", book: "Sapiens", branch: "East", borrowed: "2025-12-01", due: "2025-12-08", status: "Overdue" },
  { id: 3, member: "Ava Brown", book: "Time", branch: "West", borrowed: "2025-11-28", due: "2025-12-05", status: "Returned" },
];

export default function LoansTable() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [data, setData] = useState<Loan[]>(DATA);

  const rows = useMemo(() => {
    return data.filter((l) =>
      (!q || `${l.member} ${l.book}`.toLowerCase().includes(q.toLowerCase())) &&
      (!status || l.status === status) &&
      (!branch || l.branch === branch)
    );
  }, [q, status, branch, data]);

  const markReturned = (id: number) => {
    setData((curr) => curr.map((l) => (l.id === id ? { ...l, status: "Returned" } : l)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Search" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
          <option value="">Status</option>
          <option>Borrowed</option>
          <option>Overdue</option>
          <option>Returned</option>
        </select>
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
          <option value="">Branch</option>
          <option>Central</option>
          <option>East</option>
          <option>West</option>
        </select>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Member</th>
              <th className="px-4 py-2 text-left">Book</th>
              <th className="px-4 py-2 text-left">Branch</th>
              <th className="px-4 py-2 text-left">Borrowed</th>
              <th className="px-4 py-2 text-left">Due</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-t border-zinc-100">
                <td className="px-4 py-2">{l.member}</td>
                <td className="px-4 py-2">{l.book}</td>
                <td className="px-4 py-2">{l.branch}</td>
                <td className="px-4 py-2">{l.borrowed}</td>
                <td className="px-4 py-2">{l.due}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${l.status === "Borrowed" ? "bg-blue-100" : l.status === "Overdue" ? "bg-rose-100" : "bg-green-100"}`}>{l.status}</span>
                </td>
                <td className="px-4 py-2">
                  {l.status !== "Returned" ? (
                    <button onClick={() => markReturned(l.id)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">Mark Returned</button>
                  ) : (
                    <span className="text-black/60">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
