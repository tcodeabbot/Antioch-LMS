"use server";

import {
  getLessonComments,
  createLessonComment,
  editLessonComment,
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
  meta?: {
    lessonTitle?: string;
    courseId?: string;
    commenterName?: string;
    parentCommentId?: string;
  }
) {
  try {
    await createLessonComment(
      lessonId,
      clerkId,
      content,
      meta?.parentCommentId
    );

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

export async function editLessonCommentAction(
  commentId: string,
  clerkId: string,
  newContent: string
) {
  try {
    await editLessonComment(commentId, clerkId, newContent);
    return { success: true };
  } catch (error) {
    console.error("Error editing lesson comment:", error);
    return { success: false, error: "Failed to edit comment" };
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
