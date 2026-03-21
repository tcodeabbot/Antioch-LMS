import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEnrolledCourses } from "@/sanity/lib/student/getEnrolledCourses";
import { getCourseProgress } from "@/sanity/lib/lessons/getCourseProgress";
import { GraduationCap, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import { StudyTimeWidget } from "@/components/StudyTimeWidget";
import { ContinueLearning } from "@/components/ContinueLearning";
import { DashboardTabs } from "@/components/DashboardTabs";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user?.id) {
    redirect("/sign-in");
  }

  const student = await getStudentByClerkId(user.id);
  if (!student?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const enrolledCourses = await getEnrolledCourses(user.id);

  const coursesWithProgress = await Promise.all(
    enrolledCourses.map(async ({ course }: { course: any }) => {
      if (!course) return null;
      const progress = await getCourseProgress(user.id, course._id);
      return {
        course,
        progress: progress.courseProgress,
      };
    })
  );

  const validCourses = coursesWithProgress.filter(
    (item: any) => item !== null
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

  const studentName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Student";

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user.firstName || "Student"}! Continue your learning
          journey.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Enrolled Courses
              </p>
              <p className="text-3xl font-bold text-foreground">
                {validCourses.length}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Average Progress
              </p>
              <p className="text-3xl font-bold text-foreground">
                {totalProgress}%
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Completed Courses
              </p>
              <p className="text-3xl font-bold text-foreground">
                {validCourses.filter((item) => item.progress === 100).length}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Study Time */}
      <div className="mb-8">
        <StudyTimeWidget />
      </div>

      {/* Continue Learning + Recommendations */}
      <div className="mb-8">
        <ContinueLearning />
      </div>

      {/* Tabbed: Courses / Certificates */}
      {validCourses.length > 0 ? (
        <DashboardTabs courses={validCourses} studentName={studentName} />
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
    </>
  );
}
