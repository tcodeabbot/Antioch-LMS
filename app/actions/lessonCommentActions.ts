"use server";

import {
  getLessonComments,
  createLessonComment,
  deleteLessonComment,
} from "@/sanity/lib/lessons/lessonComments";

export async function getLessonCommentsAction(lessonId: string) {
  try {
    const comments = await getLessonComments(lessonId);
    return { success: true, data: comments };
  } catch (error) {
    console.error("Error fetching lesson comments:", error);
    return { success: false, data: [] };
  }
}

export async function createLessonCommentAction(
  lessonId: string,
  clerkId: string,
  content: string
) {
  try {
    await createLessonComment(lessonId, clerkId, content);
    return { success: true };
  } catch (error) {
    console.error("Error creating lesson comment:", error);
    return { success: false, error: "Failed to post comment" };
  }
}

export async function deleteLessonCommentAction(
  commentId: string,
  clerkId: string
) {
  try {
    await deleteLessonComment(commentId, clerkId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting lesson comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}
