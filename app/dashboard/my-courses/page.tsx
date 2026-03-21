import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEnrolledCourses } from "@/sanity/lib/student/getEnrolledCourses";
import { getCourseProgress } from "@/sanity/lib/lessons/getCourseProgress";
import { CourseCard } from "@/components/CourseCard";
import { LearningStreak } from "@/components/LearningStreak";
import { BookmarksList } from "@/components/BookmarksList";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default async function MyCoursesPage() {
  const user = await currentUser();

  if (!user?.id) {
    return redirect("/sign-in");
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
  );

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          My Courses
        </h1>
        <p className="text-muted-foreground">
          All your enrolled courses and learning tools.
        </p>
      </div>

      {validCourses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <LearningStreak />
          <BookmarksList />
        </div>
      )}

      {validCourses.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No courses enrolled yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Browse our courses to get started on your learning journey.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validCourses.map((item: any) => {
            if (!item?.course) return null;
            return (
              <CourseCard
                key={item.course._id}
                course={item.course}
                progress={item.progress}
                href={`/dashboard/courses/${item.course._id}`}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
