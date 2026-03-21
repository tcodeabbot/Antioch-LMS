import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProgressAnalytics } from "@/components/ProgressAnalytics";

export default async function AnalyticsPage() {
  const user = await currentUser();
  if (!user?.id) redirect("/sign-in");

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Track your learning progress and study habits.
        </p>
      </div>
      <ProgressAnalytics />
    </>
  );
}
