export default function Page() {
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Reports</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Borrowed vs Returned</div>
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs mb-1">Borrowed</div>
              <div className="h-3 rounded bg-zinc-100">
                <div className="h-3 rounded bg-zinc-900 w-3/4" />
              </div>
            </div>
            <div>
              <div className="text-xs mb-1">Returned</div>
              <div className="h-3 rounded bg-zinc-100">
                <div className="h-3 rounded bg-zinc-900 w-2/3" />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Category Distribution</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ["Fiction", 70],
              ["Science", 55],
              ["History", 38],
              ["Children", 31],
            ].map(([name, pct]) => (
              <div key={name as string}>
                <div className="text-xs mb-1">{name as string}</div>
                <div className="h-2 rounded bg-zinc-100">
                  <div className="h-2 rounded bg-zinc-900" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Branch Comparison</div>
          <div className="mt-4 space-y-3">
            {[
              ["Central", 80],
              ["East", 60],
              ["West", 50],
            ].map(([name, pct]) => (
              <div key={name as string}>
                <div className="text-xs mb-1">{name as string}</div>
                <div className="h-2 rounded bg-zinc-100">
                  <div className="h-2 rounded bg-zinc-900" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
