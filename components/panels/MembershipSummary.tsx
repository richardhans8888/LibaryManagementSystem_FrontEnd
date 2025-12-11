export default function MembershipSummary() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">Membership Summary</div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-zinc-200 p-3 text-center">
          <div className="text-xs text-black/60">Active</div>
          <div className="mt-1 text-lg font-semibold">1,248</div>
        </div>
        <div className="rounded-xl border border-zinc-200 p-3 text-center">
          <div className="text-xs text-black/60">Expired</div>
          <div className="mt-1 text-lg font-semibold">82</div>
        </div>
        <div className="rounded-xl border border-zinc-200 p-3 text-center">
          <div className="text-xs text-black/60">New</div>
          <div className="mt-1 text-lg font-semibold">27</div>
        </div>
      </div>
    </div>
  );
}
