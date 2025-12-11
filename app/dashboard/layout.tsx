import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/dashboard/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-6">
        <aside className="lg:sticky lg:top-6">
          <Sidebar />
        </aside>
        <main>
          <DashboardHeader />
          {children}
        </main>
      </div>
    </div>
  );
}
