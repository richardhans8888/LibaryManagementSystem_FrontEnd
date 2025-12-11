export default function TopCategories() {
  const items = [
    { name: "Fiction", value: 72 },
    { name: "Science", value: 54 },
    { name: "History", value: 38 },
    { name: "Children", value: 31 },
  ];
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">Top Borrowed Categories</div>
      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <div key={it.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{it.name}</span>
              <span>{it.value}%</span>
            </div>
            <div className="h-2 w-full rounded bg-zinc-100">
              <div className="h-2 rounded bg-zinc-900" style={{ width: `${it.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
