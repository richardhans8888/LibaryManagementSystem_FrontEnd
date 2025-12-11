"use client";
import { useMemo, useState } from "react";

type Member = {
  name: string;
  email: string;
  type: "Standard" | "Premium";
  status: "Active" | "Expired" | "Suspended";
  expiry: string;
  activeLoans: number;
};

const DATA: Member[] = [
  { name: "Jane Doe", email: "jane@example.com", type: "Premium", status: "Active", expiry: "2026-02-12", activeLoans: 2 },
  { name: "John Smith", email: "john@example.com", type: "Standard", status: "Expired", expiry: "2024-11-02", activeLoans: 0 },
  { name: "Ava Brown", email: "ava@example.com", type: "Standard", status: "Suspended", expiry: "2025-08-31", activeLoans: 1 },
];

export default function MembersTable() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");

  const rows = useMemo(() => {
    return DATA.filter((m) =>
      (!q || `${m.name} ${m.email}`.toLowerCase().includes(q.toLowerCase())) &&
      (!status || m.status === status) &&
      (!type || m.type === type)
    );
  }, [q, status, type]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Search name or email" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
          <option value="">Status</option>
          <option>Active</option>
          <option>Expired</option>
          <option>Suspended</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
          <option value="">Type</option>
          <option>Standard</option>
          <option>Premium</option>
        </select>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Expiry</th>
              <th className="px-4 py-2 text-left">Active Loans</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m, i) => (
              <tr key={i} className="border-t border-zinc-100">
                <td className="px-4 py-2">{m.name}</td>
                <td className="px-4 py-2">{m.email}</td>
                <td className="px-4 py-2">{m.type}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${m.status === "Active" ? "bg-green-100" : m.status === "Expired" ? "bg-zinc-200" : "bg-amber-100"}`}>{m.status}</span>
                </td>
                <td className="px-4 py-2">{m.expiry}</td>
                <td className="px-4 py-2">{m.activeLoans}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
