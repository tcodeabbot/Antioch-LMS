"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getLearningStreakAction } from "@/app/actions/streakActions";
import { Flame, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: number;
  last30Days: Record<string, number>;
}

export function LearningStreak() {
  const { user } = useUser();
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    getLearningStreakAction(user.id).then((res) => {
      if (res.success) setStreak(res.data);
    });
  }, [user?.id]);

  if (!streak) return null;

  const last7Days = getLast7Days();

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <Flame className={cn("h-5 w-5", streak.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground")} />
        <h3 className="font-semibold text-sm">Learning Streak</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className={cn(
            "text-2xl font-bold",
            streak.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
          )}>
            {streak.currentStreak}
          </div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{streak.longestStreak}</div>
          <div className="text-xs text-muted-foreground">Best Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{streak.todayCompleted}</div>
          <div className="text-xs text-muted-foreground">Today</div>
        </div>
      </div>

      {/* 7-day activity grid */}
      <div className="flex items-center justify-between gap-1">
        {last7Days.map((day) => {
          const count = streak.last30Days[day.key] || 0;
          const isToday = day.isToday;
          return (
            <div key={day.key} className="flex-1 text-center">
              <div className="text-[10px] text-muted-foreground mb-1">{day.label}</div>
              <div
                className={cn(
                  "mx-auto h-7 w-7 rounded-md flex items-center justify-center text-xs font-medium",
                  count > 0
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground/50",
                  isToday && "ring-2 ring-primary/30"
                )}
              >
                {count > 0 ? count : "—"}
              </div>
            </div>
          );
        })}
      </div>

      {streak.currentStreak >= 3 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
          <Trophy className="h-3.5 w-3.5" />
          <span>{streak.currentStreak} day streak! Keep it going!</span>
        </div>
      )}
      {streak.currentStreak === 0 && streak.longestStreak > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Target className="h-3.5 w-3.5" />
          <span>Complete a lesson today to start a new streak!</span>
        </div>
      )}
    </div>
  );
}

function getLast7Days() {
  const days = [];
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const d = new Date();
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
