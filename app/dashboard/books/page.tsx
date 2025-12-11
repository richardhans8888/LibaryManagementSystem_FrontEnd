import BooksTable from "@/components/tables/BooksTable";
import DashboardHeader from "@/components/dashboard/Header";

export default function Page() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Books" subtitle="Browse and filter books" />
      <BooksTable />
    </div>
  );
}
