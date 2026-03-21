import type { Metadata } from "next";
import { SanityLive } from "@/sanity/lib/live";
import { SidebarProvider } from "@/components/providers/sidebar-provider";

export const metadata: Metadata = {
  title: "Antioch LMS — Dashboard",
  description: "Antioch Christian Resource Center Learning Management System",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="h-full">{children}</div>
      <SanityLive />
    </SidebarProvider>
  );
}
