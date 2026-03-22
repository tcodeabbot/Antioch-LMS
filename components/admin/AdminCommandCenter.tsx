import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Minus,
  Users,
  DollarSign,
  ClipboardCheck,
} from "lucide-react";
import type { AdminCommandCenterData } from "@/sanity/lib/admin/getAdminCommandCenter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LifetimeTotals = {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  totalRevenueDollars: number;
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function TrendBadge({ deltaPct }: { deltaPct: number | null }) {
  if (deltaPct == null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        vs prior week
      </span>
    );
  }
  const up = deltaPct > 0;
  const down = deltaPct < 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        up && "text-emerald-600 dark:text-emerald-400",
        down && "text-rose-600 dark:text-rose-400",
        !up && !down && "text-muted-foreground"
      )}
    >
      {up && <ArrowUpRight className="h-3.5 w-3.5" />}
      {down && <ArrowDownRight className="h-3.5 w-3.5" />}
      {deltaPct === 0 ? "Flat" : `${deltaPct > 0 ? "+" : ""}${deltaPct}%`}
      <span className="text-muted-foreground font-normal"> vs prior week</span>
    </span>
  );
}

const activityIcon = {
  enrollment: GraduationCap,
  completion: ClipboardCheck,
  comment: MessageSquare,
  quiz: BookOpen,
} as const;

export function AdminCommandCenter({
  data,
  lifetime,
}: {
  data: AdminCommandCenterData;
  lifetime: LifetimeTotals;
}) {
  const { activityFeed, trends, needsAttention, windows } = data;
  const { enrollments, newStudents, revenueDollars } = trends;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Command center
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Recent activity, rolling 7-day trends, and items that need a follow-up.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/courses"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Manage courses
          </Link>
          <Link
            href="/admin/analytics"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium border border-border hover:bg-muted/60 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Link>
          <Link
            href="/admin/discussions"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium border border-border hover:bg-muted/60 transition-colors"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Discussions
          </Link>
        </div>
      </div>

      {/* Rolling window explainer */}
      <p className="text-xs text-muted-foreground">
        Trend cards compare the last {windows.periodDays} days to the previous {windows.periodDays}{" "}
        days. Lifetime totals are shown below each metric.
      </p>

      {/* Stat cards with trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Enrollments (7d)</CardDescription>
              <GraduationCap className="h-5 w-5 text-primary opacity-80" />
            </div>
            <CardTitle className="text-3xl tabular-nums">{enrollments.current}</CardTitle>
            <TrendBadge deltaPct={enrollments.deltaPct} />
            <p className="text-xs text-muted-foreground pt-1">
              All time: {lifetime.totalEnrollments.toLocaleString()} enrollments
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>New students (7d)</CardDescription>
              <Users className="h-5 w-5 text-primary opacity-80" />
            </div>
            <CardTitle className="text-3xl tabular-nums">{newStudents.current}</CardTitle>
            <TrendBadge deltaPct={newStudents.deltaPct} />
            <p className="text-xs text-muted-foreground pt-1">
              All time: {lifetime.totalStudents.toLocaleString()} students
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Revenue (7d)</CardDescription>
              <DollarSign className="h-5 w-5 text-primary opacity-80" />
            </div>
            <CardTitle className="text-3xl tabular-nums">
              $
              {revenueDollars.current.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </CardTitle>
            <TrendBadge deltaPct={revenueDollars.deltaPct} />
            <p className="text-xs text-muted-foreground pt-1">
              All time: $
              {lifetime.totalRevenueDollars.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Courses live</CardDescription>
              <BookOpen className="h-5 w-5 text-primary opacity-80" />
            </div>
            <CardTitle className="text-3xl tabular-nums">{lifetime.totalCourses}</CardTitle>
            <p className="text-sm text-muted-foreground pt-1">
              Published and draft courses in Sanity
            </p>
            <Link
              href="/admin/courses"
              className="text-xs font-medium text-primary hover:underline inline-block pt-2"
            >
              Open course list →
            </Link>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Activity feed */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Activity</CardTitle>
            </div>
            <CardDescription>
              Last ~14 days — enrollments, completions, discussion, and quizzes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityFeed.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No recent activity yet.
              </p>
            ) : (
              <ul className="divide-y divide-border max-h-[520px] overflow-y-auto pr-1">
                {activityFeed.map((item) => {
                  const Icon = activityIcon[item.type];
                  return (
                    <li key={item.id} className="py-3 flex gap-3 first:pt-0">
                      <div className="mt-0.5 h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-foreground/80" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {item.href ? (
                            <Link href={item.href} className="hover:underline">
                              {item.title}
                            </Link>
                          ) : (
                            item.title
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.subtitle}
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">
                          {formatWhen(item.at)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Needs attention */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold">Needs attention</h2>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Unanswered discussions</CardTitle>
              <CardDescription>Top-level posts with no replies yet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {needsAttention.unansweredThreads.length === 0 ? (
                <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
              ) : (
                needsAttention.unansweredThreads.map((t) => {
                  const author =
                    t.authorType === "admin"
                      ? "Staff"
                      : [t.studentFirst, t.studentLast].filter(Boolean).join(" ") || "Student";
                  return (
                    <div
                      key={t._id}
                      className="rounded-lg border border-border p-3 text-sm space-y-1"
                    >
                      <p className="font-medium line-clamp-2">{t.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {author} · {t.lessonTitle}
                      </p>
                      <Link
                        href={`/admin/discussions?lessonId=${t.lessonId}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Moderate →
                      </Link>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Courses with zero enrollments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {needsAttention.zeroEnrollmentCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Every course has at least one enrollment.</p>
              ) : (
                needsAttention.zeroEnrollmentCourses.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="font-medium truncate">{c.title}</span>
                    <Link
                      href={`/admin/courses/${c._id}`}
                      className="text-xs text-primary shrink-0 hover:underline"
                    >
                      View
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Inactive students (30d+)</CardTitle>
              <CardDescription>No study session in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {needsAttention.inactiveStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No inactive students in this sample.</p>
              ) : (
                needsAttention.inactiveStudents.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                    <Link
                      href={`/admin/students/${s._id}`}
                      className="text-xs text-primary shrink-0 hover:underline"
                    >
                      Profile
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Low quiz pass rates</CardTitle>
              <CardDescription>
                ≥5 attempts in the last 90 days, pass rate under 40%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {needsAttention.lowQuizLessons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No lessons match this threshold.</p>
              ) : (
                needsAttention.lowQuizLessons.map((l) => (
                  <div key={l.lessonId} className="text-sm space-y-1">
                    <p className="font-medium">{l.lessonTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.passRate}% pass · {l.attempts} attempts
                    </p>
                    <Link
                      href={`/admin/discussions?lessonId=${l.lessonId}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Open moderation →
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
