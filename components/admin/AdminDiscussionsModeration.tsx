"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  adminDeleteCommentAction,
  adminReplyToDiscussionAction,
  adminTogglePinAction,
} from "@/app/actions/adminDiscussionActions";
import type { AdminCommentRow } from "@/sanity/lib/admin/getAllLessonCommentsAdmin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Loader2, MessageSquare, Pin, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CourseOpt = { _id: string; title: string };
type LessonOpt = { _id: string; title: string };
type StudentOpt = { _id: string; label: string };

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminDiscussionsModeration({
  initialComments,
  courses,
  lessonsByCourse,
  students,
}: {
  initialComments: AdminCommentRow[];
  courses: CourseOpt[];
  lessonsByCourse: Record<string, LessonOpt[]>;
  students: StudentOpt[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<string | null>(null);

  const courseId = searchParams.get("courseId") || "";
  const lessonId = searchParams.get("lessonId") || "";
  const studentId = searchParams.get("studentId") || "";

  const lessonOptions = useMemo(() => {
    if (!courseId) return [];
    return lessonsByCourse[courseId] || [];
  }, [courseId, lessonsByCourse]);

  function pushFilters(next: { courseId?: string; lessonId?: string; studentId?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const c = next.courseId !== undefined ? next.courseId : courseId;
    const l = next.lessonId !== undefined ? next.lessonId : lessonId;
    const s = next.studentId !== undefined ? next.studentId : studentId;

    if (c) params.set("courseId", c);
    else params.delete("courseId");
    if (l) params.set("lessonId", l);
    else params.delete("lessonId");
    if (s) params.set("studentId", s);
    else params.delete("studentId");

    startTransition(() => {
      router.push(`/admin/discussions?${params.toString()}`);
    });
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this comment and its replies?")) return;
    setError(null);
    startTransition(async () => {
      const res = await adminDeleteCommentAction(id);
      if (!res.success) setError(res.error || "Delete failed");
      router.refresh();
    });
  }

  async function onPin(id: string, pinned: boolean) {
    setError(null);
    startTransition(async () => {
      const res = await adminTogglePinAction(id, !pinned);
      if (!res.success) setError(res.error || "Pin failed");
      router.refresh();
    });
  }

  async function onReply(row: AdminCommentRow) {
    const text = (replyText[row._id] || "").trim();
    if (!text) return;
    setError(null);
    startTransition(async () => {
      const res = await adminReplyToDiscussionAction(row.lessonId, row._id, text);
      if (!res.success) setError(res.error || "Reply failed");
      else {
        setReplyText((m) => ({ ...m, [row._id]: "" }));
        setReplyOpen(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Comments are shown newest first. Narrow by course, lesson, or student.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Course</Label>
            <Select
              value={courseId || "__all__"}
              onValueChange={(v) => {
                const next = v === "__all__" ? "" : v;
                pushFilters({ courseId: next, lessonId: "" });
              }}
              disabled={pending}
            >
              <SelectTrigger>
                <SelectValue placeholder="All courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Lesson</Label>
            <Select
              value={lessonId || "__all__"}
              onValueChange={(v) => {
                const next = v === "__all__" ? "" : v;
                pushFilters({ lessonId: next });
              }}
              disabled={pending || (!courseId && lessonOptions.length === 0)}
            >
              <SelectTrigger>
                <SelectValue placeholder={courseId ? "All lessons in course" : "Pick a course first"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">
                  {courseId ? "All lessons in course" : "All lessons"}
                </SelectItem>
                {lessonOptions.map((l) => (
                  <SelectItem key={l._id} value={l._id}>
                    {l.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Student</Label>
            <Select
              value={studentId || "__all__"}
              onValueChange={(v) => {
                const next = v === "__all__" ? "" : v;
                pushFilters({ studentId: next });
              }}
              disabled={pending}
            >
              <SelectTrigger>
                <SelectValue placeholder="All students" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="__all__">All students</SelectItem>
                {students.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm">
            {initialComments.length} comment{initialComments.length === 1 ? "" : "s"}
          </span>
        </div>

        {initialComments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              No comments match these filters.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4">
            {initialComments.map((row) => {
              const isStaff = row.authorType === "admin";
              const name = isStaff
                ? "Antioch Staff"
                : [row.studentFirst, row.studentLast].filter(Boolean).join(" ") || "Student";
              const learnerHref =
                row.courseId && row.lessonId
                  ? `/dashboard/courses/${row.courseId}/lessons/${row.lessonId}`
                  : null;

              return (
                <li key={row._id}>
                  <Card
                    className={cn(
                      row.pinned && "border-amber-500/40 bg-amber-500/[0.04]"
                    )}
                  >
                    <CardHeader className="pb-2 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm">{name}</span>
                        {isStaff && (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-amber-900 dark:text-amber-100 bg-amber-500/20 px-1.5 py-0.5 rounded">
                            Staff
                          </span>
                        )}
                        {row.pinned && (
                          <span className="text-[10px] font-medium text-amber-900 dark:text-amber-100 bg-amber-500/15 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                            <Pin className="h-3 w-3" />
                            Pinned
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatWhen(row.createdAt)}
                        </span>
                      </div>
                      <CardDescription className="text-xs">
                        {row.courseTitle && <span>{row.courseTitle} · </span>}
                        {row.lessonTitle || "Lesson"}
                        {row.parentCommentId && (
                          <span className="text-muted-foreground"> · reply</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm whitespace-pre-wrap break-words">{row.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {learnerHref && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={learnerHref} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              Open lesson
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPin(row._id, !!row.pinned)}
                          disabled={pending}
                        >
                          {pending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Pin className="h-3.5 w-3.5 mr-1" />
                          )}
                          {row.pinned ? "Unpin" : "Pin"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(row._id)}
                          disabled={pending}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setReplyOpen((id) => (id === row._id ? null : row._id))
                          }
                        >
                          Reply as staff
                        </Button>
                      </div>
                      {replyOpen === row._id && (
                        <div className="space-y-2 pt-2 border-t border-border">
                          <Label className="text-xs">Reply as staff (shows with Staff badge)</Label>
                          <textarea
                            className={cn(
                              "flex min-h-[88px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            )}
                            value={replyText[row._id] || ""}
                            onChange={(e) =>
                              setReplyText((m) => ({ ...m, [row._id]: e.target.value }))
                            }
                            placeholder="Write a reply…"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => onReply(row)}
                              disabled={pending || !(replyText[row._id] || "").trim()}
                            >
                              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                              Post reply
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setReplyOpen(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
