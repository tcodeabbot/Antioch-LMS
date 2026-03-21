"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { AdminAnalyticsResult } from "@/sanity/lib/admin/getAdminAnalytics";

function dollars(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function AdminAnalyticsCharts({ data }: { data: AdminAnalyticsResult }) {
  const enrollChart = data.enrollmentSeries;

  const weekRev = data.revenueWeekly.map((w) => ({
    ...w,
    revenue: Math.round(w.revenueCents / 100),
  }));

  const monthRev = data.revenueMonthly.map((m) => ({
    ...m,
    revenue: Math.round(m.revenueCents / 100),
  }));

  const hourData = data.engagement.sessionsByHour.map((h) => ({
    label: `${h.hour}:00`,
    sessions: h.count,
  }));

  const dayData = data.engagement.sessionsByWeekday.map((d) => ({
    name: d.label,
    sessions: d.count,
  }));

  const comparison = data.courseComparison.slice(0, 10).map((c) => ({
    name: c.title.length > 28 ? `${c.title.slice(0, 26)}…` : c.title,
    completion: c.avgCompletionPercent,
    revenue: Math.round(c.revenueCents / 100),
    quiz: c.avgQuizScore ?? null as number | null,
  }));

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Enrollments & active learners</h2>
        <div className="h-72 w-full rounded-lg border border-border bg-card p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={enrollChart}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="enrollments"
                name="Enrollments"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.2)"
              />
              <Area
                type="monotone"
                dataKey="activeStudents"
                name="Active students (sessions)"
                stroke="hsl(142 70% 45%)"
                fill="hsl(142 70% 45% / 0.15)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Revenue by week</h2>
          <div className="h-64 rounded-lg border border-border bg-card p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekRev}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Revenue by month</h2>
          <div className="h-64 rounded-lg border border-border bg-card p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthRev}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="hsl(262 83% 58%)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Sessions by hour (local time)</h2>
          <div className="h-64 rounded-lg border border-border bg-card p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="sessions" fill="hsl(199 89% 48%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Sessions by weekday</h2>
          <div className="h-64 rounded-lg border border-border bg-card p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="sessions" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Course performance</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Enrollment, revenue, completion estimate, and quiz averages in the selected period.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3 font-medium">Course</th>
                <th className="p-3 font-medium">Enrollments</th>
                <th className="p-3 font-medium">Revenue</th>
                <th className="p-3 font-medium">Avg completion</th>
                <th className="p-3 font-medium">Avg quiz</th>
                <th className="p-3 font-medium">Quiz attempts</th>
              </tr>
            </thead>
            <tbody>
              {data.courseComparison.slice(0, 12).map((c) => (
                <tr key={c.courseId} className="border-t border-border">
                  <td className="p-3 max-w-[220px] truncate" title={c.title}>
                    {c.title}
                  </td>
                  <td className="p-3">{c.enrollmentCount}</td>
                  <td className="p-3">{dollars(c.revenueCents)}</td>
                  <td className="p-3">{c.avgCompletionPercent.toFixed(1)}%</td>
                  <td className="p-3">{c.avgQuizScore != null ? `${c.avgQuizScore.toFixed(1)}%` : "—"}</td>
                  <td className="p-3">{c.quizAttemptCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 h-56 rounded-lg border border-border bg-card p-2">
          <p className="text-xs text-muted-foreground mb-1 px-1">Avg. completion % by course</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={comparison} layout="vertical" margin={{ left: 4, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={118} tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="completion" name="Completion %" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
