export default function DashboardHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <div className="text-xl font-semibold">{title || "Dashboard"}</div>
        <div className="text-sm text-black/60">{subtitle || "Library management overview"}</div>
      </div>
    </div>
  );
}
