import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/providers/sidebar-provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await checkAdminAccess();

  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto lg:ml-64">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

