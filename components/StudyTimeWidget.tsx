"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getStudyTimeStatsAction } from "@/app/actions/studyTimeActions";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyTimeStats {
  totalSeconds: number;
  todaySeconds: number;
  weekSeconds: number;
  byCourse: Array<{
    courseId: string;
    courseTitle: string;
    totalSeconds: number;
  }>;
  last30Days: Record<string, number>;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export function StudyTimeWidget() {
  const { user } = useUser();
  const [stats, setStats] = useState<StudyTimeStats | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    getStudyTimeStatsAction(user.id).then((res) => {
      if (res.success) setStats(res.data);
    });
  }, [user?.id]);

  if (!stats) return null;
  if (stats.totalSeconds === 0 && stats.byCourse.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-sm">Study Time</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {formatDuration(stats.todaySeconds)}
          </div>
          <div className="text-xs text-muted-foreground">Today</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {formatDuration(stats.weekSeconds)}
          </div>
          <div className="text-xs text-muted-foreground">This Week</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-muted-foreground">
            {formatDuration(stats.totalSeconds)}
          </div>
          <div className="text-xs text-muted-foreground">All Time</div>
        </div>
      </div>

      {stats.byCourse.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            By Course
          </p>
          {stats.byCourse.slice(0, 4).map((c) => {
            const pct =
              stats.totalSeconds > 0
                ? Math.round((c.totalSeconds / stats.totalSeconds) * 100)
                : 0;
            return (
              <div key={c.courseId}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="truncate font-medium max-w-[65%]">
                    {c.courseTitle}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDuration(c.totalSeconds)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/70 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mini 7-day chart */}
      <div className="mt-4">
        <MiniWeekChart last30Days={stats.last30Days} />
      </div>
    </div>
  );
}

function MiniWeekChart({ last30Days }: { last30Days: Record<string, number> }) {
  const days = getLast7Days();
  const maxSec = Math.max(
    ...days.map((d) => last30Days[d.key] || 0),
    1
  );

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        Last 7 Days
      </p>
      <div className="flex items-end justify-between gap-1 h-12">
        {days.map((day) => {
          const secs = last30Days[day.key] || 0;
          const height = secs > 0 ? Math.max(4, (secs / maxSec) * 48) : 4;
          return (
            <div
              key={day.key}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "w-full rounded-sm transition-all",
                  secs > 0
                    ? "bg-primary/60"
                    : "bg-muted",
                  day.isToday && "ring-1 ring-primary/40"
                )}
                style={{ height: `${height}px` }}
                title={`${day.label}: ${formatDuration(secs)}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        {days.map((day) => (
          <div
            key={day.key}
            className="flex-1 text-center text-[9px] text-muted-foreground"
          >
            {day.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function getLast7Days() {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const d = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(d);
    date.setDate(d.getDate() - i);
    days.push({
      key: date.toISOString().slice(0, 10),
      label: labels[date.getDay()],
      isToday: i === 0,
    });
  }
  return days;
}
