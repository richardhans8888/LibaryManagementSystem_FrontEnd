"use client";
import { useAdminStore, Branch } from "@/components/admin/store/AdminStore";
import { useState } from "react";

export default function Page() {
  const { branches, addBranch, editBranch } = useAdminStore();
  const [form, setForm] = useState<Omit<Branch, "id">>({ name: "", location: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addBranch(form);
    setForm({ name: "", location: "" });
  };
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Branches</div>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <button type="submit" className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">Add Branch</button>
      </form>
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id} className="border-t border-zinc-100">
                <td className="px-4 py-2">{b.name}</td>
                <td className="px-4 py-2">{b.location}</td>
                <td className="px-4 py-2">
                  <button onClick={() => editBranch(b.id, { name: b.name + "*" })} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
