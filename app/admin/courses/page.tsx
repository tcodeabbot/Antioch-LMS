import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getCourseStats } from "@/sanity/lib/admin/getCourseStats";
import { CourseGrid } from "@/components/admin/CourseGrid";

export default async function AdminCoursesPage() {
  const auth = await checkAdminAccess();

  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const stats = await getCourseStats();
  const courses = stats.courses || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Courses
        </h1>
        <p className="text-muted-foreground">
          Manage all courses in your platform
        </p>
      </div>

      <CourseGrid courses={courses} />
    </div>
  );
}
