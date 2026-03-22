import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getAdminCommandCenterData } from "@/sanity/lib/admin/getAdminCommandCenter";
import { getCourseStats } from "@/sanity/lib/admin/getCourseStats";
import { AdminCommandCenter } from "@/components/admin/AdminCommandCenter";

export default async function AdminDashboardPage() {
  const auth = await checkAdminAccess();

  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const [data, stats] = await Promise.all([
    getAdminCommandCenterData(baseUrl),
    getCourseStats(),
  ]);

  return (
    <AdminCommandCenter
      data={data}
      lifetime={{
        totalCourses: stats.totalCourses || 0,
        totalStudents: stats.totalStudents || 0,
        totalEnrollments: stats.totalEnrollments || 0,
        totalRevenueDollars: (stats.totalRevenue || 0) / 100,
      }}
    />
  );
}
