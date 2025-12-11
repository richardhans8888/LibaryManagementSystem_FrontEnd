"use client";
import { useAdminStore, Book } from "@/components/admin/store/AdminStore";
import { useState } from "react";

export default function Page() {
  const { books, addBook, setBookStatus } = useAdminStore();
  const [form, setForm] = useState<Omit<Book, "id">>({ title: "", author: "", category: "", format: "Physical", branch: "Central", stock: 1, status: "Available" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addBook(form);
    setForm({ title: "", author: "", category: "", format: "Physical", branch: "Central", stock: 1, status: "Available" });
  };

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Books</div>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        <input className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <select className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as "Physical" | "Digital" })}>
          <option>Physical</option>
          <option>Digital</option>
        </select>
        <input className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Branch" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
        <input type="number" className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
        <button type="submit" className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">Add Book</button>
      </form>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Author</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Format</th>
              <th className="px-4 py-2 text-left">Branch</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id} className="border-t border-zinc-100">
                <td className="px-4 py-2">{b.title}</td>
                <td className="px-4 py-2">{b.author}</td>
                <td className="px-4 py-2">{b.category}</td>
                <td className="px-4 py-2">{b.format}</td>
                <td className="px-4 py-2">{b.branch}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${b.status === "Available" ? "bg-green-100" : b.status === "Reserved" ? "bg-amber-100" : "bg-blue-100"}`}>{b.status}</span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => setBookStatus(b.id, "Available")} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">Make Available</button>
                  <button onClick={() => setBookStatus(b.id, "Reserved")} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">Reserve</button>
                  <button onClick={() => setBookStatus(b.id, "Borrowed")} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">Borrow</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
