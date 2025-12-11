"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/books", label: "Books" },
  { href: "/dashboard/members", label: "Members" },
  { href: "/dashboard/loans", label: "Loans" },
  { href: "/dashboard/branches", label: "Branches" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function Sidebar() {
  const url = usePathname();
  return (
    <div className="w-full lg:w-64 rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="px-4 py-4 border-b border-zinc-200">
        <div className="text-lg font-semibold">Member Dashboard</div>
      </div>
      <nav className="px-2 py-3 space-y-1">
        {links.map((l) => {
          const active = url === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-xl px-3 py-2 text-sm ${active ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
