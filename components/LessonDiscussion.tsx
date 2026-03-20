"use client";

import { useState, useEffect, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getLessonCommentsAction,
  createLessonCommentAction,
  deleteLessonCommentAction,
} from "@/app/actions/lessonCommentActions";
import { MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import type { LessonComment } from "@/sanity/lib/lessons/lessonComments";

interface LessonDiscussionProps {
  lessonId: string;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function LessonDiscussion({ lessonId }: LessonDiscussionProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    getLessonCommentsAction(lessonId).then((result) => {
      if (result.success) setComments(result.data as LessonComment[]);
      setIsLoading(false);
    });
  }, [lessonId, isOpen]);

  const handleSubmit = () => {
    if (!user?.id || !newComment.trim()) return;
    const text = newComment.trim();
    setNewComment("");

    startTransition(async () => {
      const result = await createLessonCommentAction(lessonId, user.id, text);
      if (result.success) {
        const refreshed = await getLessonCommentsAction(lessonId);
        if (refreshed.success) setComments(refreshed.data as LessonComment[]);
      }
    });
  };

  const handleDelete = (commentId: string) => {
    if (!user?.id) return;
    startTransition(async () => {
      const result = await deleteLessonCommentAction(commentId, user.id);
      if (result.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    });
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <MessageSquare className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium flex-1">
          Discussion
          {comments.length > 0 && (
            <span className="ml-1.5 text-xs text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </span>
        <svg
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-border">
          {/* New comment form */}
          <div className="p-4 border-b border-border">
            <div className="flex gap-3">
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt=""
                  className="h-8 w-8 rounded-full flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleSubmit();
                    }
                  }}
                  placeholder="Add to the discussion..."
                  rows={2}
                  className="w-full p-2 text-sm bg-muted/30 border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}+Enter
                    to post
                  </span>
                  <button
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments list */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No comments yet. Start the discussion!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {comments.map((comment) => {
                  const isOwn = comment.student?.clerkId === user?.id;
                  return (
                    <div key={comment._id} className="p-4 group">
                      <div className="flex gap-3">
                        {comment.student?.imageUrl ? (
                          <img
                            src={comment.student.imageUrl}
                            alt=""
                            className="h-8 w-8 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary">
                              {comment.student?.firstName?.[0] || "?"}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {comment.student?.firstName}{" "}
                              {comment.student?.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {timeAgo(comment.createdAt)}
                            </span>
                            {isOwn && (
                              <button
                                onClick={() => handleDelete(comment._id)}
                                className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                title="Delete comment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
