import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEnrolledCourses } from "@/sanity/lib/student/getEnrolledCourses";
import { getCourseProgress } from "@/sanity/lib/lessons/getCourseProgress";
import { CourseCard } from "@/components/CourseCard";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { GraduationCap, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user?.id) {
    redirect("/sign-in");
  }

  const enrolledCourses = await getEnrolledCourses(user.id);

  // Get progress for each enrolled course
  const coursesWithProgress = await Promise.all(
    enrolledCourses.map(async ({ course }) => {
      if (!course) return null;
      const progress = await getCourseProgress(user.id, course._id);
      return {
        course,
        progress: progress.courseProgress
      };
    })
  );

  const validCourses = coursesWithProgress.filter(
    (item) => item !== null
  ) as Array<{
    course: NonNullable<(typeof coursesWithProgress)[0]>["course"];
    progress: number;
  }>;

  const totalProgress =
    validCourses.length > 0
      ? Math.round(
          validCourses.reduce((sum, item) => sum + item.progress, 0) /
            validCourses.length
        )
      : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:ml-64">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Continue your learning journey.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Enrolled Courses
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {validCourses.length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Average Progress
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalProgress}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Completed Courses
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {
                      validCourses.filter((item) => item.progress === 100)
                        .length
                    }
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Courses Section */}
          {validCourses.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  My Enrolled Courses
                </h2>
                <Link
                  href="/my-courses"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {validCourses.map((item) => (
                  <CourseCard
                    key={item.course._id}
                    course={item.course}
                    progress={item.progress}
                    href={`/dashboard/courses/${item.course._id}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No courses enrolled yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start your learning journey by browsing and enrolling in courses
                that interest you.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
