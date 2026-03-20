"use server";

import { getLessonNote, saveLessonNote } from "@/sanity/lib/lessons/lessonNotes";

export async function getLessonNoteAction(lessonId: string, clerkId: string) {
  try {
    const note = await getLessonNote(lessonId, clerkId);
    return { success: true, data: note };
  } catch (error) {
    console.error("Error fetching lesson note:", error);
    return { success: false, data: null };
  }
}

export async function saveLessonNoteAction(
  lessonId: string,
  clerkId: string,
  content: string
) {
  try {
    await saveLessonNote(lessonId, clerkId, content);
    return { success: true };
  } catch (error) {
    console.error("Error saving lesson note:", error);
    return { success: false, error: "Failed to save note" };
  }
}
