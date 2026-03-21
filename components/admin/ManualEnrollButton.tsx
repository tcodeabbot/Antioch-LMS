"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  manualEnrollStudentAction,
  getUnenrolledCoursesAction,
} from "@/app/actions/adminActions";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, BookOpen, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  _id: string;
  title: string;
  category?: { title?: string; name?: string };
}

export function ManualEnrollButton({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingCourses(true);
    setResult(null);
    setSearch("");
    getUnenrolledCoursesAction(studentId).then((res) => {
      if (res.success) setCourses(res.data as Course[]);
      setIsLoadingCourses(false);
    });
  }, [isOpen, studentId]);

  const handleEnroll = (courseId: string) => {
    startTransition(async () => {
      const res = await manualEnrollStudentAction(studentId, courseId);
      if (res.success) {
        setResult({ type: "success", message: "Student enrolled successfully!" });
        setTimeout(() => {
          setIsOpen(false);
          setResult(null);
          router.refresh();
        }, 1500);
      } else {
        setResult({ type: "error", message: res.error || "Failed to enroll" });
      }
    });
  };

  const filtered = search.trim()
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.category?.title?.toLowerCase().includes(search.toLowerCase()) ||
          c.category?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : courses;

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="sm" className="gap-1.5">
        <Plus className="h-4 w-4" />
        Enroll in Course
      </Button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          Enroll in a Course
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            setIsOpen(false);
            setResult(null);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {result && (
        <div
          className={cn(
            "px-4 py-2.5 text-sm flex items-center gap-2",
            result.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
          )}
        >
          {result.type === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
          {result.message}
        </div>
      )}

      {!result && (
        <>
          <div className="p-3 border-b border-border">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full px-3 py-1.5 text-sm bg-transparent border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="max-h-[240px] overflow-y-auto">
            {isLoadingCourses ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {search
                  ? "No matching courses found."
                  : "All courses are already enrolled."}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((course) => (
                  <button
                    key={course._id}
                    onClick={() => handleEnroll(course._id)}
                    disabled={isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {course.title}
                      </p>
                      {(course.category?.title || course.category?.name) && (
                        <p className="text-xs text-muted-foreground">
                          {course.category.title || course.category.name}
                        </p>
                      )}
                    </div>
                    {isPending && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
