import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getAllEnrollments } from "@/sanity/lib/admin/getAllEnrollments";
import { GraduationCap, DollarSign } from "lucide-react";
import { EnrollmentsTable } from "@/components/admin/EnrollmentsTable";

interface Enrollment {
  amount?: number;
}

export default async function AdminEnrollmentsPage() {
  const auth = await checkAdminAccess();

  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const enrollments = await getAllEnrollments();
  const totalRevenue =
    enrollments.reduce(
      (sum: number, enrollment: Enrollment) => sum + (enrollment.amount || 0),
      0
    ) / 100;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Enrollments
        </h1>
        <p className="text-muted-foreground">
          View all course enrollments and payments
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </p>
              <p className="text-2xl font-bold text-foreground">
                {enrollments.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-foreground">
                $
                {totalRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <EnrollmentsTable enrollments={enrollments} />
    </div>
  );
}
