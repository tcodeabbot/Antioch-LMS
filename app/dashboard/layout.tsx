import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { SanityLive } from "@/sanity/lib/live";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto lg:ml-64">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
      <SanityLive />
    </SidebarProvider>
  );
}
