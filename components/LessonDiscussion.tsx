"use client";

import {
  useState,
  useEffect,
  useTransition,
  useRef,
  useCallback,
} from "react";
import { useUser } from "@clerk/nextjs";
import {
  getLessonCommentsAction,
  createLessonCommentAction,
  editLessonCommentAction,
  deleteLessonCommentAction,
} from "@/app/actions/lessonCommentActions";
import {
  MessageSquare,
  Send,
  Trash2,
  Loader2,
  ChevronDown,
  MessageCircle,
  Reply,
  Pencil,
  X,
  Check,
  CornerDownRight,
  Pin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonComment } from "@/sanity/lib/lessons/lessonComments";

interface LessonDiscussionProps {
  lessonId: string;
  lessonTitle?: string;
  courseId?: string;
}

interface CommentNode extends LessonComment {
  replies: CommentNode[];
}

function buildCommentTree(flat: LessonComment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const c of flat) {
    map.set(c._id, { ...c, replies: [] });
  }

  for (const c of flat) {
    const node = map.get(c._id)!;
    if (c.parentCommentId && map.has(c.parentCommentId)) {
      map.get(c.parentCommentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
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
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function UserAvatar({
  src,
  fallback,
  size = "md",
}: {
  src?: string | null;
  fallback: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-sm";

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn("rounded-full flex-shrink-0 object-cover", sizeClass)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-medium text-primary",
        sizeClass
      )}
    >
      {fallback}
    </div>
  );
}

// --- Inline composer for new comments and replies ---

function CommentComposer({
  avatarSrc,
  avatarFallback,
  placeholder,
  isReply,
  isPending,
  onSubmit,
  onCancel,
  autoFocus,
}: {
  avatarSrc?: string | null;
  avatarFallback: string;
  placeholder: string;
  isReply?: boolean;
  isPending: boolean;
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  return (
    <div className={cn("flex gap-2.5", isReply && "pl-2")}>
      <UserAvatar
        src={avatarSrc}
        fallback={avatarFallback}
        size={isReply ? "sm" : "md"}
      />
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "border border-border bg-muted/20 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all overflow-hidden",
            isReply ? "rounded-lg" : "rounded-xl"
          )}
        >
          <textarea
            ref={ref}
            value={value}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === "Escape" && onCancel) {
                onCancel();
              }
            }}
            placeholder={placeholder}
            rows={1}
            className={cn(
              "w-full bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/50",
              isReply
                ? "px-3 pt-2.5 pb-1.5 text-[13px] min-h-[36px]"
                : "px-3.5 pt-3 pb-2 text-sm min-h-[40px]"
            )}
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
              {typeof navigator !== "undefined" &&
              navigator.platform?.includes("Mac")
                ? "⌘"
                : "Ctrl"}
              +Enter to post
              {onCancel ? " · Esc to cancel" : ""}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!value.trim() || isPending}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                  value.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                {isReply ? "Reply" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Inline editor for editing a comment ---

function CommentEditor({
  initialContent,
  isPending,
  onSave,
  onCancel,
}: {
  initialContent: string;
  isPending: boolean;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialContent);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      ref.current.selectionStart = ref.current.value.length;
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 200)}px`;
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === initialContent) {
      onCancel();
      return;
    }
    onSave(trimmed);
  };

  return (
    <div className="mt-1.5">
      <textarea
        ref={ref}
        value={value}
        onChange={handleInput}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSave();
          }
          if (e.key === "Escape") onCancel();
        }}
        className="w-full px-3 py-2 text-[13px] bg-muted/30 border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 min-h-[36px]"
      />
      <div className="flex items-center gap-1.5 mt-1.5">
        <button
          onClick={handleSave}
          disabled={!value.trim() || isPending}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
        >
          <X className="h-3 w-3" />
          Cancel
        </button>
        <span className="text-[11px] text-muted-foreground/60 ml-auto hidden sm:inline">
          Esc to cancel ·{" "}
          {typeof navigator !== "undefined" &&
          navigator.platform?.includes("Mac")
            ? "⌘"
            : "Ctrl"}
          +Enter to save
        </span>
      </div>
    </div>
  );
}

// --- Single comment row ---

function CommentItem({
  comment,
  isReply,
  userId,
  replyingTo,
  editingId,
  deletingId,
  pendingAction,
  onReply,
  onCancelReply,
  onSubmitReply,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  userAvatarSrc,
  userAvatarFallback,
}: {
  comment: CommentNode;
  isReply?: boolean;
  userId?: string;
  replyingTo: string | null;
  editingId: string | null;
  deletingId: string | null;
  pendingAction: boolean;
  onReply: (id: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (parentId: string, text: string) => void;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  userAvatarSrc?: string | null;
  userAvatarFallback: string;
}) {
  const isStaff = comment.authorType === "admin";
  const isOwn =
    (!isStaff && comment.student?.clerkId === userId) ||
    (isStaff && comment.adminClerkId === userId);
  const isOptimistic = comment._id.startsWith("optimistic-");
  const isDeleting = deletingId === comment._id;
  const isEditing = editingId === comment._id;
  const isReplying = replyingTo === comment._id;

  return (
    <div
      className={cn(
        isOptimistic && "opacity-60",
        isDeleting && "opacity-40 scale-[0.98] transition-all"
      )}
    >
      <div
        className={cn(
          "group rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/40",
          isReply && "ml-6 sm:ml-10",
          comment.pinned && "border border-amber-500/35 bg-amber-500/[0.06]"
        )}
      >
        <div className="flex gap-2.5">
          <UserAvatar
            src={isStaff ? undefined : comment.student?.imageUrl}
            fallback={isStaff ? "S" : comment.student?.firstName?.[0] || "?"}
            size={isReply ? "sm" : "md"}
          />
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={cn(
                  "font-medium leading-none",
                  isReply ? "text-[13px]" : "text-sm"
                )}
              >
                {isStaff
                  ? "Antioch Staff"
                  : `${comment.student?.firstName ?? ""} ${comment.student?.lastName ?? ""}`.trim()}
              </span>
              {comment.pinned && (
                <span className="text-[10px] font-medium text-amber-900 dark:text-amber-100 bg-amber-500/20 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                  <Pin className="h-3 w-3" />
                  Pinned
                </span>
              )}
              {isStaff && (
                <span className="text-[10px] font-medium text-amber-800 dark:text-amber-200 bg-amber-500/15 px-1.5 py-0.5 rounded">
                  Staff
                </span>
              )}
              {isOwn && (
                <span className="text-[10px] font-medium text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">
                  You
                </span>
              )}
              <span className="text-[11px] text-muted-foreground/70 leading-none">
                {isOptimistic ? "Posting..." : timeAgo(comment.createdAt)}
              </span>
              {comment.editedAt && !isOptimistic && (
                <span className="text-[10px] text-muted-foreground/50 italic">
                  (edited)
                </span>
              )}
            </div>

            {/* Content or editor */}
            {isEditing ? (
              <CommentEditor
                initialContent={comment.content}
                isPending={pendingAction}
                onSave={(text) => onSaveEdit(comment._id, text)}
                onCancel={onCancelEdit}
              />
            ) : (
              <p
                className={cn(
                  "text-foreground/80 mt-1 whitespace-pre-wrap break-words leading-relaxed",
                  isReply ? "text-[13px]" : "text-[13px]"
                )}
              >
                {comment.content}
              </p>
            )}

            {/* Action buttons */}
            {!isEditing && !isOptimistic && (
              <div className="flex items-center gap-3 mt-1.5">
                {!isReply && (
                  <button
                    onClick={() => onReply(comment._id)}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground/70 hover:text-primary transition-colors"
                  >
                    <Reply className="h-3 w-3" />
                    Reply
                    {comment.replies.length > 0 && (
                      <span className="text-muted-foreground/50 ml-0.5">
                        ({comment.replies.length})
                      </span>
                    )}
                  </button>
                )}
                {isOwn && (
                  <>
                    <button
                      onClick={() => onEdit(comment._id)}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(comment._id)}
                      disabled={isDeleting}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground/70 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline reply form */}
      {isReplying && (
        <div className="ml-6 sm:ml-10 mt-1 mb-2 pr-3">
          <CommentComposer
            avatarSrc={userAvatarSrc}
            avatarFallback={userAvatarFallback}
            placeholder={`Reply to ${comment.student?.firstName || "this comment"}...`}
            isReply
            isPending={pendingAction}
            onSubmit={(text) => onSubmitReply(comment._id, text)}
            onCancel={onCancelReply}
            autoFocus
          />
        </div>
      )}

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div className="relative">
          <div className="absolute left-[18px] sm:left-[22px] top-0 bottom-2 w-px bg-border/60" />
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              isReply
              userId={userId}
              replyingTo={replyingTo}
              editingId={editingId}
              deletingId={deletingId}
              pendingAction={pendingAction}
              onReply={onReply}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
              onEdit={onEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onDelete={onDelete}
              userAvatarSrc={userAvatarSrc}
              userAvatarFallback={userAvatarFallback}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main component ---

export function LessonDiscussion({
  lessonId,
  lessonTitle,
  courseId,
}: LessonDiscussionProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refreshComments = useCallback(() => {
    return getLessonCommentsAction(lessonId).then((result) => {
      if (result.success) setComments(result.data as LessonComment[]);
    });
  }, [lessonId]);

  useEffect(() => {
    setIsLoading(true);
    refreshComments().finally(() => setIsLoading(false));
  }, [refreshComments]);

  const handlePostComment = (text: string) => {
    if (!user?.id) return;

    const optimistic: LessonComment = {
      _id: `optimistic-${Date.now()}`,
      content: text,
      createdAt: new Date().toISOString(),
      student: {
        _id: "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl || null,
        clerkId: user.id,
      },
    };
    setComments((prev) => [...prev, optimistic]);

    startTransition(async () => {
      const commenterName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || "Someone";
      await createLessonCommentAction(lessonId, user.id, text, {
        lessonTitle,
        courseId,
        commenterName,
      });
      await refreshComments();
    });
  };

  const handleSubmitReply = (parentId: string, text: string) => {
    if (!user?.id) return;
    setReplyingTo(null);

    const optimistic: LessonComment = {
      _id: `optimistic-${Date.now()}`,
      content: text,
      createdAt: new Date().toISOString(),
      parentCommentId: parentId,
      student: {
        _id: "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl || null,
        clerkId: user.id,
      },
    };
    setComments((prev) => [...prev, optimistic]);

    startTransition(async () => {
      const commenterName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || "Someone";
      await createLessonCommentAction(lessonId, user.id, text, {
        lessonTitle,
        courseId,
        commenterName,
        parentCommentId: parentId,
      });
      await refreshComments();
    });
  };

  const handleSaveEdit = (commentId: string, newContent: string) => {
    if (!user?.id) return;
    setEditingId(null);

    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? { ...c, content: newContent, editedAt: new Date().toISOString() }
          : c
      )
    );

    startTransition(async () => {
      await editLessonCommentAction(commentId, user.id, newContent);
      await refreshComments();
    });
  };

  const handleDelete = (commentId: string) => {
    if (!user?.id) return;
    setDeletingId(commentId);

    startTransition(async () => {
      const result = await deleteLessonCommentAction(commentId, user.id);
      if (result.success) {
        setComments((prev) =>
          prev.filter(
            (c) => c._id !== commentId && c.parentCommentId !== commentId
          )
        );
      }
      setDeletingId(null);
    });
  };

  const tree = buildCommentTree(comments);

  const totalCount = comments.filter(
    (c) => !c._id.startsWith("optimistic-")
  ).length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
          <MessageSquare className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold">Discussion</span>
          {totalCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
              {totalCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border">
            {/* New top-level comment */}
            <div className="p-4 sm:p-5">
              <CommentComposer
                avatarSrc={user?.imageUrl}
                avatarFallback={user?.firstName?.[0] || "?"}
                placeholder="Share your thoughts or ask a question..."
                isPending={isPending && !deletingId && !editingId}
                onSubmit={handlePostComment}
              />
            </div>

            {/* Comments list */}
            <div className="max-h-[560px] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Loading discussion...
                  </span>
                </div>
              ) : tree.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                    <MessageCircle className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No comments yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1 max-w-[240px]">
                    Be the first to start the discussion for this lesson.
                  </p>
                </div>
              ) : (
                <div className="px-2 sm:px-3 pb-4 space-y-0.5">
                  {tree.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      userId={user?.id}
                      replyingTo={replyingTo}
                      editingId={editingId}
                      deletingId={deletingId}
                      pendingAction={isPending}
                      onReply={(id) => {
                        setReplyingTo(id);
                        setEditingId(null);
                      }}
                      onCancelReply={() => setReplyingTo(null)}
                      onSubmitReply={handleSubmitReply}
                      onEdit={(id) => {
                        setEditingId(id);
                        setReplyingTo(null);
                      }}
                      onCancelEdit={() => setEditingId(null)}
                      onSaveEdit={handleSaveEdit}
                      onDelete={handleDelete}
                      userAvatarSrc={user?.imageUrl}
                      userAvatarFallback={user?.firstName?.[0] || "?"}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
