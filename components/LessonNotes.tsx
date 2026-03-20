"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getLessonNoteAction,
  saveLessonNoteAction,
} from "@/app/actions/lessonNoteActions";
import { StickyNote, Save, Check, Loader2 } from "lucide-react";

interface LessonNotesProps {
  lessonId: string;
}

export function LessonNotes({ lessonId }: LessonNotesProps) {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    getLessonNoteAction(lessonId, user.id).then((result) => {
      if (result.success && result.data?.content) {
        setContent(result.data.content);
        setSavedContent(result.data.content);
      }
      setIsLoading(false);
    });
  }, [lessonId, user?.id]);

  const saveNote = useCallback(
    async (text: string) => {
      if (!user?.id || text === savedContent) return;
      setIsSaving(true);
      const result = await saveLessonNoteAction(lessonId, user.id, text);
      setIsSaving(false);
      if (result.success) {
        setSavedContent(text);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      }
    },
    [lessonId, user?.id, savedContent]
  );

  const handleChange = (value: string) => {
    setContent(value);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveNote(value), 1500);
  };

  const handleBlur = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveNote(content);
  };

  const isDirty = content !== savedContent;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <StickyNote className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium flex-1">My Notes</span>
        {isDirty && (
          <span className="h-2 w-2 rounded-full bg-amber-500" />
        )}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                placeholder="Type your notes for this lesson..."
                className="w-full min-h-[160px] p-4 text-sm bg-transparent resize-y focus:outline-none placeholder:text-muted-foreground/60"
              />
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 text-xs text-muted-foreground">
                <span>
                  {content.length > 0
                    ? `${content.length} characters`
                    : "No notes yet"}
                </span>
                <div className="flex items-center gap-2">
                  {isSaving && (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </span>
                  )}
                  {showSaved && !isSaving && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Check className="h-3 w-3" />
                      Saved
                    </span>
                  )}
                  {isDirty && !isSaving && (
                    <button
                      onClick={() => saveNote(content)}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Save className="h-3 w-3" />
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
