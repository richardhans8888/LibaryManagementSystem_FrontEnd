"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/authors", label: "Authors" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/loans", label: "Loans" },
  { href: "/admin/borrow-requests", label: "Borrow Requests" },
  { href: "/admin/branches", label: "Branches" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function AdminSidebar() {
  const url = usePathname();
  return (
    <div className="w-full lg:w-64 rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="px-4 py-4 border-b border-zinc-200">
        <div className="text-lg font-semibold">Admin Dashboard</div>
      </div>
      <nav className="px-2 py-3 space-y-1">
        {links.map((l) => {
          const active = url === l.href;
          return (
            <Link key={l.href} href={l.href} className={`block rounded-xl px-3 py-2 text-sm ${active ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50"}`}>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
