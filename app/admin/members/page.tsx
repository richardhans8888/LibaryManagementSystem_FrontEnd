"use client";
import { useAdminStore } from "@/components/admin/store/AdminStore";

export default function Page() {
  const { members } = useAdminStore();
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Members</div>
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-zinc-100">
                <td className="px-4 py-2">{m.name}</td>
                <td className="px-4 py-2">{m.email}</td>
                <td className="px-4 py-2">{m.type}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${m.status === "Active" ? "bg-green-100" : m.status === "Suspended" ? "bg-amber-100" : "bg-zinc-200"}`}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

