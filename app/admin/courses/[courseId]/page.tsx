import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getCourseDetails } from "@/sanity/lib/admin/getCourseDetails";
import {
  ArrowLeft,
  Users,
  DollarSign,
  BookOpen,
  TrendingUp,
  Calendar,
  Mail,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CourseDetailsPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

interface Enrollment {
  _id: string;
  enrolledAt?: string;
  amount?: number;
  student?: {
    firstName: string;
    lastName: string;
    email: string;
    imageUrl?: string;
  };
}

export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  const auth = await checkAdminAccess();

  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const { courseId } = await params;
  const course = await getCourseDetails(courseId);

  if (!course) {
    redirect("/admin");
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {course.title}
        </h1>
        <p className="text-muted-foreground">{course.description}</p>
      </div>

      {/* Course Info */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Category
            </p>
            <p className="text-lg font-semibold text-foreground">
              {course.category?.title || "Uncategorized"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Instructor
            </p>
            <p className="text-lg font-semibold text-foreground">
              {course.instructor?.name || "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Price
            </p>
            <p className="text-lg font-semibold text-foreground">
              {course.isFree ? "Free" : `$${course.price?.toFixed(2)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Enrollments */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </p>
              <p className="text-2xl font-bold text-foreground">
                {course.stats.totalEnrollments}
              </p>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-foreground">
                ${course.stats.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg. Completion
              </p>
              <p className="text-2xl font-bold text-foreground">
                {course.stats.averageCompletionRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Total Lessons */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Lessons
              </p>
              <p className="text-2xl font-bold text-foreground">
                {course.stats.totalLessons}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Structure */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Course Structure
        </h2>
        <div className="space-y-4">
          {course.modules && course.modules.length > 0 ? (
            course.modules
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((module, index) => (
                <div
                  key={module._id}
                  className="border border-border rounded-lg p-4"
                >
                  <h3 className="font-semibold text-foreground mb-2">
                    Module {index + 1}: {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {module.lessons?.length || 0} lesson
                    {module.lessons?.length !== 1 ? "s" : ""}
                  </p>
                  {module.lessons && module.lessons.length > 0 && (
                    <ul className="mt-3 space-y-1 ml-4">
                      {module.lessons
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((lesson, lessonIndex) => (
                          <li
                            key={lesson._id}
                            className="text-sm text-muted-foreground"
                          >
                            {lessonIndex + 1}. {lesson.title}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No modules available
            </p>
          )}
        </div>
      </div>

      {/* Enrolled Students */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Enrolled Students
          </h2>
        </div>

        {course.enrollments && course.enrollments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Enrolled Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {course.enrollments.map((enrollment: Enrollment) => (
                  <tr
                    key={enrollment._id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {enrollment.student?.imageUrl ? (
                          <Image
                            src={enrollment.student.imageUrl}
                            alt={`${enrollment.student.firstName} ${enrollment.student.lastName}`}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {enrollment.student?.firstName}{" "}
                            {enrollment.student?.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {enrollment.student?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground">
                        ${(enrollment.amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {enrollment.enrolledAt
                          ? new Date(enrollment.enrolledAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No enrollments yet
            </h3>
            <p className="text-muted-foreground">
              This course doesn&apos;t have any enrolled students yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
