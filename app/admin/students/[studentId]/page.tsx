import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getStudentDetails } from "@/sanity/lib/admin/getStudentDetails";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Clock,
  TrendingUp,
  MessageSquare,
  Bookmark,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { EngagementBadge } from "@/components/admin/StudentsTable";
import type { EngagementLevel } from "@/sanity/lib/admin/getAllStudents";

function calculateEngagement(stats: {
  totalStudySeconds: number;
  completionCount: number;
  commentCount: number;
  enrollmentCount: number;
  lastActivityDate: string | null;
}): EngagementLevel {
  if (stats.enrollmentCount === 0) return "inactive";
  const daysSinceLastActivity = stats.lastActivityDate
    ? Math.floor(
        (Date.now() - new Date(stats.lastActivityDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 999;
  if (daysSinceLastActivity > 30) return "inactive";
  const studyScore = Math.min(stats.totalStudySeconds / 3600, 10) / 10;
  const completionScore = Math.min(stats.completionCount / 20, 1);
  const discussionScore = Math.min(stats.commentCount / 10, 1);
  const recencyScore = Math.max(0, 1 - daysSinceLastActivity / 30);
  const score =
    studyScore * 0.3 +
    completionScore * 0.3 +
    discussionScore * 0.2 +
    recencyScore * 0.2;
  if (score >= 0.5) return "high";
  if (score >= 0.2) return "medium";
  return "low";
}

interface StudentDetailPageProps {
  params: Promise<{ studentId: string }>;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const { studentId } = await params;
  const data = await getStudentDetails(studentId);

  if (!data?.student) {
    redirect("/admin/students");
  }

  const { student, enrollments, lessonCompletions, studySessions, totalStudySeconds, quizAttempts, commentCount, recentComments, bookmarks, completionCount, lastActivityDate } = data;

  const engagement = calculateEngagement({
    totalStudySeconds: totalStudySeconds || 0,
    completionCount: completionCount || 0,
    commentCount: commentCount || 0,
    enrollmentCount: enrollments?.length || 0,
    lastActivityDate: lastActivityDate || null,
  });

  // Calculate course progress
  const courseProgress = (enrollments || []).map((enrollment: any) => {
    const courseId = enrollment.course?._id;
    const totalLessons = enrollment.course?.totalLessons || 0;
    const completedLessons = (lessonCompletions || []).filter(
      (lc: any) => lc.courseId === courseId
    ).length;
    const progress =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
    return {
      ...enrollment,
      completedLessons,
      totalLessons,
      progress,
    };
  });

  const avgCompletion =
    courseProgress.length > 0
      ? Math.round(
          courseProgress.reduce((s: number, c: any) => s + c.progress, 0) /
            courseProgress.length
        )
      : 0;

  const address = student.address;
  const locationStr = address
    ? [address.city, address.state, address.country].filter(Boolean).join(", ")
    : null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href="/admin/students"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </Link>

      {/* Profile header */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {student.imageUrl ? (
            <Image
              src={student.imageUrl}
              alt={`${student.firstName} ${student.lastName}`}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-10 w-10 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {student.firstName} {student.lastName}
              </h1>
              <EngagementBadge level={engagement} />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {student.email}
              </span>
              {student.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {student.phone}
                </span>
              )}
              {locationStr && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {locationStr}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Joined{" "}
                {student._createdAt
                  ? new Date(student._createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Courses Enrolled
              </p>
              <p className="text-2xl font-bold text-foreground">
                {enrollments?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Study Time
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatDuration(totalStudySeconds || 0)}
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
                Avg Completion
              </p>
              <p className="text-2xl font-bold text-foreground">
                {avgCompletion}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Discussion Comments
              </p>
              <p className="text-2xl font-bold text-foreground">
                {commentCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Enrolled Courses
          </h2>
        </div>
        {courseProgress.length > 0 ? (
          <div className="divide-y divide-border">
            {courseProgress.map((enrollment: any) => (
              <div
                key={enrollment._id}
                className="p-6 hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/courses/${enrollment.course?._id}`}
                      className="text-base font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {enrollment.course?.title || "Unknown Course"}
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {(enrollment.course?.category?.title ||
                        enrollment.course?.category?.name) && (
                        <span>
                          {enrollment.course.category.title ||
                            enrollment.course.category.name}
                        </span>
                      )}
                      <span>
                        Enrolled{" "}
                        {enrollment.enrolledAt
                          ? new Date(
                              enrollment.enrolledAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                      <span>
                        $
                        {((enrollment.amount || 0) / 100).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="w-full sm:w-48 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {enrollment.completedLessons}/{enrollment.totalLessons}{" "}
                        lessons
                      </span>
                      <span className="font-medium text-foreground">
                        {enrollment.progress}%
                      </span>
                    </div>
                    <Progress
                      value={enrollment.progress}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              This student hasn&apos;t enrolled in any courses yet.
            </p>
          </div>
        )}
      </div>

      {/* Activity sections - side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Study Sessions */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Study Sessions
            </h2>
          </div>
          {studySessions && studySessions.length > 0 ? (
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {studySessions.map((session: any) => (
                <div key={session._id} className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.lessonTitle || "Unknown Lesson"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.courseTitle}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-medium text-foreground">
                        {formatDuration(session.durationSeconds || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.startedAt
                          ? new Date(session.startedAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No study sessions recorded yet.
            </div>
          )}
        </div>

        {/* Quiz Attempts */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Quiz Attempts
            </h2>
          </div>
          {quizAttempts && quizAttempts.length > 0 ? (
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {quizAttempts.map((attempt: any) => (
                <div key={attempt._id} className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {attempt.lessonTitle || "Unknown Lesson"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.completedAt
                          ? new Date(
                              attempt.completedAt
                            ).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span
                        className={`text-sm font-semibold ${attempt.passed ? "text-emerald-600" : "text-amber-600"}`}
                      >
                        {attempt.score}%
                      </span>
                      {attempt.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No quiz attempts yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Comments & Bookmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Comments */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Comments
            </h2>
          </div>
          {recentComments && recentComments.length > 0 ? (
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {recentComments.map((comment: any) => (
                <div key={comment._id} className="px-6 py-3">
                  <p className="text-sm text-foreground line-clamp-2">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {comment.lessonTitle && (
                      <span>on {comment.lessonTitle}</span>
                    )}
                    <span>
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No comments yet.
            </div>
          )}
        </div>

        {/* Bookmarks */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Bookmarked Lessons
            </h2>
          </div>
          {bookmarks && bookmarks.length > 0 ? (
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {bookmarks.map((bm: any) => (
                <div key={bm._id} className="px-6 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {bm.lessonTitle || "Unknown Lesson"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{bm.courseTitle}</span>
                    <span>
                      {bm.createdAt
                        ? new Date(bm.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No bookmarks yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
