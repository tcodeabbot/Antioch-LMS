import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Welcome to Antioch LMS Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-background border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              My Courses
            </h2>
            <p className="text-muted-foreground">
              Access your enrolled courses and track your progress.
            </p>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Recent Activity
            </h2>
            <p className="text-muted-foreground">
              View your recent learning activities and achievements.
            </p>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Profile
            </h2>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
