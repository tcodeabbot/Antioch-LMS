"use client";

import { useState, useEffect, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import {
  isLessonBookmarkedAction,
  toggleBookmarkAction,
} from "@/app/actions/bookmarkActions";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonBookmarkButtonProps {
  lessonId: string;
  courseId: string;
}

export function LessonBookmarkButton({
  lessonId,
  courseId,
}: LessonBookmarkButtonProps) {
  const { user } = useUser();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user?.id) return;
    isLessonBookmarkedAction(lessonId, user.id).then((res) => {
      if (res.success) setIsBookmarked(res.data);
      setIsLoaded(true);
    });
  }, [lessonId, user?.id]);

  function handleToggle() {
    if (!user?.id) return;
    startTransition(async () => {
      const res = await toggleBookmarkAction(lessonId, courseId, user.id);
      if (res.success && res.data !== undefined) {
        setIsBookmarked(res.data);
      }
    });
  }

  if (!isLoaded) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this lesson"}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
        isBookmarked
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Bookmark
        className={cn("h-3.5 w-3.5", isBookmarked && "fill-current")}
      />
      {isBookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
