"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { getProgressAnalyticsAction } from "@/app/actions/analyticsActions";
import {
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressAnalytics {
  completionsByDay: Record<string, number>;
  studyByDay: Record<string, number>;
  courseBreakdown: Array<{
    courseId: string;
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    studySeconds: number;
  }>;
  totalCompletions: number;
  weeklyCompletions: number;
  monthlyCompletions: number;
}

type Period = "7d" | "30d" | "90d";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function getDaysArray(count: number): string[] {
  const days: string[] = [];
  const d = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(d);
    date.setDate(d.getDate() - i);
    days.push(date.toISOString().slice(0, 10));
  }
  return days;
}

export function ProgressAnalytics() {
  const { user } = useUser();
  const [data, setData] = useState<ProgressAnalytics | null>(null);
  const [period, setPeriod] = useState<Period>("30d");

  useEffect(() => {
    if (!user?.id) return;
    getProgressAnalyticsAction(user.id).then((res) => {
      if (res.success) setData(res.data);
    });
  }, [user?.id]);

  if (!data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          label="This Week"
          value={data.weeklyCompletions}
          unit="lessons"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          label="This Month"
          value={data.monthlyCompletions}
          unit="lessons"
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5 text-amber-600" />}
          label="All Time"
          value={data.totalCompletions}
          unit="lessons"
        />
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        {(["7d", "30d", "90d"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              period === p
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
          </button>
        ))}
      </div>

      {/* Completion Activity Chart */}
      <ActivityChart
        title="Lesson Completions"
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        data={data.completionsByDay}
        days={periodDays}
        color="emerald"
      />

      {/* Study Time Chart */}
      <ActivityChart
        title="Study Time"
        icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        data={data.studyByDay}
        days={periodDays}
        color="primary"
        formatValue={formatDuration}
      />

      {/* Course Breakdown */}
      {data.courseBreakdown.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold text-sm mb-4">
            Course Progress Breakdown
          </h3>
          <div className="space-y-4">
            {data.courseBreakdown.map((course) => {
              const pct =
                course.totalLessons > 0
                  ? Math.round(
                      (course.completedLessons / course.totalLessons) * 100
                    )
                  : 0;
              return (
                <div key={course.courseId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium truncate max-w-[60%]">
                      {course.courseTitle}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {course.studySeconds > 0 && (
                        <span>{formatDuration(course.studySeconds)}</span>
                      )}
                      <span>
                        {course.completedLessons}/{course.totalLessons} lessons
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          pct === 100
                            ? "bg-emerald-500"
                            : "bg-primary"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium tabular-nums w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function ActivityChart({
  title,
  icon,
  data,
  days: dayCount,
  color,
  formatValue,
}: {
  title: string;
  icon: React.ReactNode;
  data: Record<string, number>;
  days: number;
  color: "emerald" | "primary";
  formatValue?: (val: number) => string;
}) {
  const days = useMemo(() => getDaysArray(dayCount), [dayCount]);
  const values = days.map((d) => data[d] || 0);
  const maxVal = Math.max(...values, 1);

  const barColor =
    color === "emerald"
      ? "bg-emerald-500/70 dark:bg-emerald-500/50"
      : "bg-primary/70 dark:bg-primary/50";

  const showEvery = dayCount <= 7 ? 1 : dayCount <= 30 ? 5 : 10;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="flex items-end gap-px h-32">
        {days.map((day, i) => {
          const val = values[i];
          const height = val > 0 ? Math.max(4, (val / maxVal) * 128) : 2;
          return (
            <div
              key={day}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              <div
                className={cn(
                  "w-full rounded-t-sm transition-all",
                  val > 0 ? barColor : "bg-muted/60"
                )}
                style={{ height: `${height}px` }}
              />
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 whitespace-nowrap px-2 py-1 rounded bg-foreground text-background text-[10px]">
                {formatDate(day)}: {formatValue ? formatValue(val) : val}
              </div>
            </div>
          );
        })}
      </div>
      {/* X-axis labels */}
      <div className="flex mt-1">
        {days.map((day, i) => (
          <div key={day} className="flex-1 text-center">
            {i % showEvery === 0 ? (
              <span className="text-[9px] text-muted-foreground">
                {formatShortDate(day)}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
