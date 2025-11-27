import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getCourseStats } from "@/sanity/lib/admin/getCourseStats";
import { BookOpen, Users, DollarSign, FileText } from "lucide-react";
import Link from "next/link";

interface Module {
  lessonCount?: number;
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  price?: number;
  isFree?: boolean;
  totalRevenue?: number;
  enrollmentCount?: number;
  category?: {
    title: string;
  };
  instructor?: {
    name: string;
  };
  modules?: Module[];
}

export default async function AdminCoursesPage() {
  const auth = await checkAdminAccess();

  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const stats = await getCourseStats();
  const courses = stats.courses || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Courses
        </h1>
        <p className="text-muted-foreground">
          Manage all courses in your platform
        </p>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Course) => {
            const courseRevenue = (course.totalRevenue || 0) / 100;
            const totalLessons = course.modules?.reduce(
              (sum: number, module: Module) => sum + (module.lessonCount || 0),
              0
            ) || 0;

            return (
              <div
                key={course._id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {course.title}
                  </h3>
                  {course.category && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {course.category.title}
                    </p>
                  )}
                  {course.instructor && (
                    <p className="text-sm text-muted-foreground">
                      Instructor: {course.instructor.name}
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Enrollments</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {course.enrollmentCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Lessons</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {totalLessons}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>Revenue</span>
                    </div>
                    <span className="font-medium text-foreground">
                      ${courseRevenue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium text-foreground">
                      {course.isFree || !course.price || course.price === 0
                        ? "Free"
                        : `$${Number(course.price).toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/courses/${course._id}`}
                    className="flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/courses/${course.slug}`}
                    target="_blank"
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium border border-border hover:bg-accent transition-colors"
                  >
                    Preview
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No courses yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first course in Sanity Studio to get started.
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go to Studio
          </Link>
        </div>
      )}
    </div>
  );
}

