export default function Page() {
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Settings</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Profile</div>
          <div className="mt-3 space-y-3">
            <input className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Full name" />
            <input className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Email" />
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Notifications</div>
          <div className="mt-3 space-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Email alerts</label>
            <label className="flex items-center gap-2"><input type="checkbox" /> Weekly reports</label>
          </div>
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">System Config</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-xs mb-1">Loan duration (days)</div>
              <input className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" defaultValue={14} />
            </div>
            <div>
              <div className="text-xs mb-1">Overdue threshold</div>
              <input className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" defaultValue={7} />
            </div>
            <div>
              <div className="text-xs mb-1">Max active loans</div>
              <input className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" defaultValue={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
