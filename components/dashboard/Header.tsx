import Link from "next/link";

export default function DashboardHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <div className="text-xl font-semibold">{title || "Dashboard"}</div>
        <div className="text-sm text-black/60">{subtitle || "Library management overview"}</div>
      </div>
      <div className="flex items-center gap-3">
        <input
          className="w-56 rounded-2xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Search"
        />
        <Link href="/?login=1" className="rounded-2xl border border-zinc-300 px-3 py-2 text-sm">Sign In</Link>
      </div>
    </div>
  );
}
