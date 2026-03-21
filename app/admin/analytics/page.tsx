import { redirect } from "next/navigation";
import Link from "next/link";
import { checkAdminAccess } from "@/lib/adminAuth";
import {
  getAdminAnalytics,
  type AnalyticsRange,
} from "@/sanity/lib/admin/getAdminAnalytics";
import { AdminAnalyticsCharts } from "@/components/admin/AdminAnalyticsCharts";
import { BarChart3, Clock, GraduationCap, Users, DollarSign, BookOpen } from "lucide-react";

function isRange(s: string | undefined): s is AnalyticsRange {
  return s === "7" || s === "30" || s === "90" || s === "all";
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const auth = await checkAdminAccess();

  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const sp = await searchParams;
  const range: AnalyticsRange = isRange(sp.range) ? sp.range : "30";
  const data = await getAdminAnalytics(range);

  const revenue = data.totals.revenueCents / 100;
  const rangeLabel =
    range === "all"
      ? "All time"
      : `Last ${range} days`;

  const links: { value: AnalyticsRange; label: string }[] = [
    { value: "7", label: "7d" },
    { value: "30", label: "30d" },
    { value: "90", label: "90d" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Trends, engagement, and course insights — {rangeLabel.toLowerCase()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <Link
              key={l.value}
              href={`/admin/analytics?range=${l.value}`}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                range === l.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Revenue</p>
              <p className="text-2xl font-bold">
                ${revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-9 w-9 text-primary opacity-80" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Enrollments</p>
              <p className="text-2xl font-bold">{data.totals.enrollments}</p>
            </div>
            <GraduationCap className="h-9 w-9 text-primary opacity-80" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active students</p>
              <p className="text-2xl font-bold">{data.totals.activeStudents}</p>
              <p className="text-xs text-muted-foreground mt-1">Had a study session in range</p>
            </div>
            <Users className="h-9 w-9 text-primary opacity-80" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {range === "all" ? "Total students" : "New students"}
              </p>
              <p className="text-2xl font-bold">{data.totals.studentsInPeriod}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {range === "all" ? "Registered accounts" : "Joined in this period"}
              </p>
            </div>
            <BookOpen className="h-9 w-9 text-primary opacity-80" />
          </div>
        </div>
      </div>

      {/* Engagement strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Avg study time / active student</p>
            <p className="text-xl font-semibold">{data.engagement.avgStudyMinutesPerStudent} min</p>
            <p className="text-xs text-muted-foreground">
              {data.engagement.totalStudyMinutes.toLocaleString()} total study minutes in range
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-start gap-3">
          <BarChart3 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Lessons completed / active completer</p>
            <p className="text-xl font-semibold">
              {data.engagement.avgLessonsCompletedPerActiveStudent}
            </p>
            <p className="text-xs text-muted-foreground">
              Among students who completed at least one lesson in range
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-start gap-3">
          <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Students with sessions</p>
            <p className="text-xl font-semibold">{data.engagement.uniqueStudentsWithSessions}</p>
            <p className="text-xs text-muted-foreground">Unique learners in studySession data</p>
          </div>
        </div>
      </div>

      <AdminAnalyticsCharts data={data} />

      {/* Drop-off */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground mb-2">Drop-off between lessons</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Students who completed a lesson but not the next (largest gaps first). Helps spot where
          courses lose momentum.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3 font-medium">Course</th>
                <th className="p-3 font-medium">After lesson</th>
                <th className="p-3 font-medium">Completed this</th>
                <th className="p-3 font-medium">Stopped before next</th>
                <th className="p-3 font-medium">Drop rate</th>
              </tr>
            </thead>
            <tbody>
              {data.dropOffs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Not enough sequential lesson data in this period.
                  </td>
                </tr>
              ) : (
                data.dropOffs.map((d) => (
                  <tr key={`${d.courseId}-${d.lessonId}`} className="border-t border-border">
                    <td className="p-3 max-w-[180px] truncate" title={d.courseTitle}>
                      {d.courseTitle}
                    </td>
                    <td className="p-3 max-w-[200px] truncate" title={d.lessonTitle}>
                      #{d.position} {d.lessonTitle}
                    </td>
                    <td className="p-3">{d.completedCount}</td>
                    <td className="p-3">{d.stoppedHereEstimate}</td>
                    <td className="p-3">{d.dropRatePercent.toFixed(1)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quiz */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground mb-2">Quiz performance by lesson</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3 font-medium">Lesson</th>
                <th className="p-3 font-medium">Course</th>
                <th className="p-3 font-medium">Attempts</th>
                <th className="p-3 font-medium">Avg score</th>
                <th className="p-3 font-medium">Pass rate</th>
              </tr>
            </thead>
            <tbody>
              {data.quizByLesson.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    No quiz attempts in this period.
                  </td>
                </tr>
              ) : (
                data.quizByLesson.map((q) => (
                  <tr key={q.lessonId} className="border-t border-border">
                    <td className="p-3">{q.lessonTitle}</td>
                    <td className="p-3 max-w-[200px] truncate">{q.courseTitle}</td>
                    <td className="p-3">{q.attemptCount}</td>
                    <td className="p-3">{q.avgScore.toFixed(1)}%</td>
                    <td className="p-3">{q.passRatePercent.toFixed(1)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">Hardest quiz questions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          By wrong-answer rate (min. 3 attempts). Uses per-question flags from quiz attempts.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3 font-medium">Lesson</th>
                <th className="p-3 font-medium">Q #</th>
                <th className="p-3 font-medium">Wrong rate</th>
                <th className="p-3 font-medium">Sample</th>
              </tr>
            </thead>
            <tbody>
              {data.hardestQuestions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    No granular question data in this period.
                  </td>
                </tr>
              ) : (
                data.hardestQuestions.map((h, i) => (
                  <tr key={`${h.lessonId}-${h.questionIndex}-${i}`} className="border-t border-border">
                    <td className="p-3 max-w-[240px] truncate">{h.lessonTitle}</td>
                    <td className="p-3">{h.questionIndex + 1}</td>
                    <td className="p-3">{h.wrongRatePercent.toFixed(1)}%</td>
                    <td className="p-3">{h.sampleSize}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
