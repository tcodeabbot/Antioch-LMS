"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getStudentBookmarksAction } from "@/app/actions/bookmarkActions";
import { Bookmark, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import type { LessonBookmark } from "@/sanity/lib/lessons/lessonBookmarks";

export function BookmarksList() {
  const { user } = useUser();
  const [bookmarks, setBookmarks] = useState<LessonBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user?.id || !isOpen) return;
    setIsLoading(true);
    getStudentBookmarksAction(user.id).then((res) => {
      if (res.success) setBookmarks(res.data as LessonBookmark[]);
      setIsLoading(false);
    });
  }, [user?.id, isOpen]);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <Bookmark className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold flex-1">Bookmarked Lessons</span>
        <svg
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-border">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No bookmarked lessons yet.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {bookmarks.map((bm) => (
                <Link
                  key={bm._id}
                  href={`/dashboard/courses/${bm.courseId}/lessons/${bm.lessonId}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
                >
                  <Bookmark className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {bm.lessonTitle}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {bm.courseTitle}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
