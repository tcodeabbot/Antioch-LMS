"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
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
    <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <BookOpen className="h-4 w-4" />
        Lesson {currentIndex + 1} of {totalLessons}
      </span>
      {durationMinutes != null && durationMinutes > 0 && (
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
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
    <div className="flex items-center justify-between gap-4 mt-10 pt-6 border-t border-border">
      {prevLesson ? (
        <Link
          href={`/dashboard/courses/${courseId}/lessons/${prevLesson._id}`}
          className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors group max-w-[45%]"
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
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors group max-w-[45%]"
        >
          <div className="text-right min-w-0">
            <p className="text-xs text-primary-foreground/70">Next</p>
            <p className="text-sm font-medium truncate">{nextLesson.title}</p>
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0" />
        </Link>
      ) : (
        <div className="px-4 py-3 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
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
