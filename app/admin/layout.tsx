"use client";
import { AdminStoreProvider } from "@/components/admin/store/AdminStore";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminStoreProvider>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-6">
          <aside className="lg:sticky lg:top-6">
            <AdminSidebar />
          </aside>
          <main>
            <AdminHeader />
            {children}
          </main>
        </div>
      </div>
    </AdminStoreProvider>
  );
}

