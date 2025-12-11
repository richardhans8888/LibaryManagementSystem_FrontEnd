import MembersTable from "@/components/tables/MembersTable";
import DashboardHeader from "@/components/dashboard/Header";

export default function Page() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Members" subtitle="Manage membership" />
      <MembersTable />
    </div>
  );
}
