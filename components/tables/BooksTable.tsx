"use client";
import { useMemo, useState } from "react";

type Book = {
  title: string;
  author: string;
  category: string;
  branch: string;
  format: "Hardcover" | "Paperback" | "eBook";
  status: "Available" | "Checked Out";
};

const DATA: Book[] = [
  { title: "1984", author: "George Orwell", category: "Fiction", branch: "Central", format: "Hardcover", status: "Available" },
  { title: "Brief History of Time", author: "Stephen Hawking", category: "Science", branch: "West", format: "Paperback", status: "Checked Out" },
  { title: "Sapiens", author: "Yuval Noah Harari", category: "History", branch: "East", format: "eBook", status: "Available" },
];

export default function BooksTable() {
  const [q, setQ] = useState("");
  const [availability, setAvailability] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const rows = useMemo(() => {
    return DATA.filter((b) =>
      (!q || `${b.title} ${b.author}`.toLowerCase().includes(q.toLowerCase())) &&
      (!availability || b.status === availability) &&
      (!branch || b.branch === branch) &&
      (!category || b.category === category)
    );
  }, [q, availability, branch, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Search" />
        <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
          <option value="">Availability</option>
          <option>Available</option>
          <option>Checked Out</option>
        </select>
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
          <option value="">Branch</option>
          <option>Central</option>
          <option>East</option>
          <option>West</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
          <option value="">Category</option>
          <option>Fiction</option>
          <option>Science</option>
          <option>History</option>
        </select>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Author</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Branch</th>
              <th className="px-4 py-2 text-left">Format</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b, i) => (
              <tr key={i} className="border-t border-zinc-100">
                <td className="px-4 py-2">{b.title}</td>
                <td className="px-4 py-2">{b.author}</td>
                <td className="px-4 py-2">{b.category}</td>
                <td className="px-4 py-2">{b.branch}</td>
                <td className="px-4 py-2">{b.format}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${b.status === "Available" ? "bg-green-100" : "bg-amber-100"}`}>{b.status}</span>
                </td>
                <td className="px-4 py-2">
                  <button className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
