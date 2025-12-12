export default function AdminHeader() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <div className="text-xl font-semibold">Dashboard</div>
      </div>
      <div className="flex items-center gap-3">
        <input className="w-56 rounded-2xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Search" />
        <div className="h-8 w-8 rounded-full bg-zinc-200" />
      </div>
    </div>
  );
}

