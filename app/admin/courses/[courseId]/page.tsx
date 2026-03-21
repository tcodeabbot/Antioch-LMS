import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getCourseDetails } from "@/sanity/lib/admin/getCourseDetails";
import {
  ArrowLeft,
  Users,
  DollarSign,
  BookOpen,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { CourseEnrollmentsTable } from "@/components/admin/CourseEnrollmentsTable";
import { CourseFunnelChart } from "@/components/admin/CourseFunnelChart";

type ModuleBlock = {
  _id: string;
  title: string;
  order?: number;
  lessons?: {
    _id: string;
    title: string;
    order?: number;
  }[];
};

interface CourseDetailsPageProps {
  params: Promise<{
    courseId: string;
  }>;
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

  const revenueDollars = (course.stats.totalRevenueCents || 0) / 100;
  const status = course.publicationStatus || "published";
  const modules = (course.modules || []) as ModuleBlock[];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </Link>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {course.title}
          </h1>
          <span
            className={`text-xs font-medium rounded-full px-2.5 py-1 ${
              status === "published"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : status === "draft"
                  ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {status}
          </span>
        </div>
        <p className="text-muted-foreground">{course.description}</p>
      </div>

      {course.contentWarnings && course.contentWarnings.length > 0 && (
        <div className="mb-8 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 font-medium text-amber-900 dark:text-amber-100 mb-2">
            <AlertTriangle className="h-5 w-5" />
            Content health
          </div>
          <ul className="list-disc pl-5 text-sm text-amber-900/90 dark:text-amber-100/90 space-y-1">
            {course.contentWarnings.map((w: string, i: number) => (
              <li key={`cw-${i}`}>{w}</li>
            ))}
          </ul>
        </div>
      )}

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
              {(course as { isFree?: boolean }).isFree || course.price === 0
                ? "Free"
                : `$${typeof course.price === "number" ? course.price.toFixed(2) : "—"}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                $
                {revenueDollars.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

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

      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Completion funnel
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Distinct enrolled students who completed each lesson (course order). Compare bar lengths to
          see where engagement drops.
        </p>
        <CourseFunnelChart data={course.funnel} />
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-8 overflow-x-auto">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Student progress
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 pr-4 font-medium">Student</th>
              <th className="pb-2 pr-4 font-medium">Lessons done</th>
              <th className="pb-2 pr-4 font-medium">Progress</th>
              <th className="pb-2 font-medium">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {course.studentProgress.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-muted-foreground">
                  No enrollments yet.
                </td>
              </tr>
            ) : (
              course.studentProgress.map(
                (row: {
                  student: {
                    _id: string;
                    firstName?: string;
                    lastName?: string;
                    email?: string;
                  };
                  completedLessons: number;
                  totalLessons: number;
                  progressPercent: number;
                  lastActivity: string | null;
                }) => (
                  <tr key={row.student._id} className="border-b border-border/60">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/admin/students/${row.student._id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {row.student.firstName} {row.student.lastName}
                      </Link>
                      <div className="text-xs text-muted-foreground">{row.student.email}</div>
                    </td>
                    <td className="py-2 pr-4">
                      {row.completedLessons} / {row.totalLessons}
                    </td>
                    <td className="py-2 pr-4">{row.progressPercent}%</td>
                    <td className="py-2 text-muted-foreground">
                      {row.lastActivity
                        ? new Date(row.lastActivity).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-8 overflow-x-auto">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Quiz performance (all time, this course)
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 pr-4 font-medium">Lesson</th>
              <th className="pb-2 pr-4 font-medium">Attempts</th>
              <th className="pb-2 pr-4 font-medium">Avg score</th>
              <th className="pb-2 font-medium">Pass rate</th>
            </tr>
          </thead>
          <tbody>
            {course.quizByLesson.every((q: { attempts: number }) => q.attempts === 0) ? (
              <tr>
                <td colSpan={4} className="py-6 text-muted-foreground">
                  No quiz attempts recorded for lessons in this course.
                </td>
              </tr>
            ) : (
              course.quizByLesson.map(
                (q: {
                  lessonId: string;
                  title: string;
                  avgScore: number | null;
                  passRate: number | null;
                  attempts: number;
                }) => (
                  <tr key={q.lessonId} className="border-b border-border/60">
                    <td className="py-2 pr-4">{q.title}</td>
                    <td className="py-2 pr-4">{q.attempts}</td>
                    <td className="py-2 pr-4">
                      {q.avgScore != null ? `${q.avgScore}%` : "—"}
                    </td>
                    <td className="py-2">{q.passRate != null ? `${q.passRate}%` : "—"}</td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Course Structure
        </h2>
        <div className="space-y-4">
          {modules.length > 0 ? (
            [...modules]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
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
                      {[...module.lessons]
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
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

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Enrolled Students
        </h2>
        <CourseEnrollmentsTable enrollments={course.enrollments || []} />
      </div>
    </div>
  );
}
