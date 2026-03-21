"use server";

import {
  getLessonComments,
  createLessonComment,
  deleteLessonComment,
} from "@/sanity/lib/lessons/lessonComments";
import { notifyDiscussionReply } from "@/sanity/lib/notifications/notifications";

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
  content: string,
  meta?: { lessonTitle?: string; courseId?: string; commenterName?: string }
) {
  try {
    await createLessonComment(lessonId, clerkId, content);

    if (meta?.lessonTitle && meta?.courseId && meta?.commenterName) {
      notifyDiscussionReply({
        lessonId,
        lessonTitle: meta.lessonTitle,
        courseId: meta.courseId,
        commenterClerkId: clerkId,
        commenterName: meta.commenterName,
      }).catch(console.error);
    }

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
