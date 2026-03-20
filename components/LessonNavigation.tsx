"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Clock } from "lucide-react";

interface LessonInfo {
  _id: string;
  title: string;
  moduleTitle: string;
}

interface LessonTopBarProps {
  currentIndex: number;
  totalLessons: number;
  durationMinutes: number | null;
}

export function LessonTopBar({
  currentIndex,
  totalLessons,
  durationMinutes,
}: LessonTopBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Lesson {currentIndex + 1} of {totalLessons}
      </span>
      {durationMinutes != null && durationMinutes > 0 && (
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {durationMinutes} min
        </span>
      )}
    </div>
  );
}

interface LessonBottomNavProps {
  courseId: string;
  prevLesson: LessonInfo | null;
  nextLesson: LessonInfo | null;
}

export function LessonBottomNav({
  courseId,
  prevLesson,
  nextLesson,
}: LessonBottomNavProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-8 sm:mt-10 pt-6 border-t border-border">
      {prevLesson ? (
        <Link
          href={`/dashboard/courses/${courseId}/lessons/${prevLesson._id}`}
          className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors group sm:max-w-[45%]"
        >
          <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
          <div className="text-left min-w-0">
            <p className="text-xs text-muted-foreground">Previous</p>
            <p className="text-sm font-medium truncate">{prevLesson.title}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextLesson ? (
        <Link
          href={`/dashboard/courses/${courseId}/lessons/${nextLesson._id}`}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors group sm:max-w-[45%] sm:ml-auto"
        >
          <div className="text-right min-w-0 flex-1 sm:flex-initial">
            <p className="text-xs text-primary-foreground/70">Next</p>
            <p className="text-sm font-medium truncate">{nextLesson.title}</p>
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0" />
        </Link>
      ) : (
        <div className="px-4 py-3 rounded-lg bg-muted text-muted-foreground text-sm font-medium text-center sm:text-left sm:ml-auto">
          Course complete!
        </div>
      )}
    </div>
  );
}

export function AutoAdvanceHandler({
  courseId,
  nextLessonId,
}: {
  courseId: string;
  nextLessonId: string | null;
}) {
  const router = useRouter();

  const handleVideoEnded = useCallback(() => {
    if (nextLessonId) {
      router.push(`/dashboard/courses/${courseId}/lessons/${nextLessonId}`);
    }
  }, [nextLessonId, courseId, router]);

  if (typeof window !== "undefined") {
    (window as any).__lessonAutoAdvance = handleVideoEnded;
  }

  return null;
}

interface KeyboardShortcutsProps {
  courseId: string;
  prevLessonId: string | null;
  nextLessonId: string | null;
}

export function KeyboardShortcuts({
  courseId,
  prevLessonId,
  nextLessonId,
}: KeyboardShortcutsProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      if (e.key === "ArrowLeft" && prevLessonId) {
        e.preventDefault();
        router.push(`/dashboard/courses/${courseId}/lessons/${prevLessonId}`);
      } else if (e.key === "ArrowRight" && nextLessonId) {
        e.preventDefault();
        router.push(`/dashboard/courses/${courseId}/lessons/${nextLessonId}`);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [courseId, prevLessonId, nextLessonId, router]);

  return null;
}
