import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ProgressAnalytics } from "@/components/ProgressAnalytics";

export default async function AnalyticsPage() {
  const user = await currentUser();
  if (!user?.id) redirect("/sign-in");

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto lg:ml-64">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Track your learning progress and study habits.
            </p>
          </div>
          <ProgressAnalytics />
        </div>
      </main>
    </div>
  );
}
