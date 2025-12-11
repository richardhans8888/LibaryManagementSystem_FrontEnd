export default function StatCard({ title, value, subtext }: { title: string; value: string | number; subtext?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-black/70">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {subtext ? <div className="mt-1 text-xs text-black/60">{subtext}</div> : null}
    </div>
  );
}
