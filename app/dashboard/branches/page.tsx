export default function Page() {
  const branches = [
    { name: "Central", city: "Springfield", total: 42532, active: 812, status: "Open" },
    { name: "East", city: "Lakeview", total: 18321, active: 344, status: "Open" },
    { name: "West", city: "Glen Park", total: 15214, active: 297, status: "Open" },
  ];
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Branches</div>
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">City</th>
              <th className="px-4 py-2 text-left">Total Books</th>
              <th className="px-4 py-2 text-left">Active Loans</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.name} className="border-t border-zinc-100">
                <td className="px-4 py-2">{b.name}</td>
                <td className="px-4 py-2">{b.city}</td>
                <td className="px-4 py-2">{b.total}</td>
                <td className="px-4 py-2">{b.active}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs">{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
