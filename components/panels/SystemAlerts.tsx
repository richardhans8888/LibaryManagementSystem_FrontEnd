export default function SystemAlerts() {
  const alerts = [
    { msg: "Overdue threshold increased", ts: "10:24" },
    { msg: "New branch synced: Eastwood", ts: "09:57" },
    { msg: "Backup completed", ts: "07:12" },
  ];
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">System Alerts</div>
      <ul className="mt-3 space-y-2">
        {alerts.map((a, i) => (
          <li key={i} className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-sm">
            <span>{a.msg}</span>
            <span className="text-black/60 text-xs">{a.ts}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
