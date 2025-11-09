import { SidebarProvider } from "@/components/providers/sidebar-provider";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
