import LoansTable from "@/components/tables/LoansTable";
import DashboardHeader from "@/components/dashboard/Header";

export default function Page() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Loans" subtitle="Track borrow and return" />
      <LoansTable />
    </div>
  );
}
