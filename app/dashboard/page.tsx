import StatCard from "@/components/cards/StatCard";
import MembershipSummary from "@/components/panels/MembershipSummary";
import TopCategories from "@/components/panels/TopCategories";
import SystemAlerts from "@/components/panels/SystemAlerts";

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Books" value={124_532} subtext="Across 6 branches" />
        <StatCard title="Active Members" value={12_480} subtext="+27 this week" />
        <StatCard title="Borrowed Today" value={138} subtext="Until now" />
        <StatCard title="Overdue Loans" value={82} subtext="Require action" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Recent Loans</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <select className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
              <option>Status</option>
              <option>Borrowed</option>
              <option>Overdue</option>
              <option>Returned</option>
            </select>
            <select className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
              <option>Branch</option>
              <option>Central</option>
              <option>East</option>
              <option>West</option>
            </select>
            <input className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="dd/mm/yyyy" />
            <input className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="Search" />
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-2 text-left">Member</th>
                  <th className="px-4 py-2 text-left">Book</th>
                  <th className="px-4 py-2 text-left">Branch</th>
                  <th className="px-4 py-2 text-left">Borrowed</th>
                  <th className="px-4 py-2 text-left">Due</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Jane Doe", "1984", "Central", "Dec 10", "Dec 17", "Borrowed"],
                  ["John Smith", "Sapiens", "East", "Dec 1", "Dec 8", "Overdue"],
                  ["Ava Brown", "Time", "West", "Nov 28", "Dec 5", "Returned"],
                ].map((r, i) => (
                  <tr key={i} className="border-t border-zinc-100">
                    {r.map((c, j) => (
                      <td key={j} className="px-4 py-2">{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-6">
          <MembershipSummary />
          <TopCategories />
          <SystemAlerts />
        </div>
      </div>
    </div>
  );
}
