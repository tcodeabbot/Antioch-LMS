import groq from "groq";
import { client } from "../adminClient";
import { sanityFetch } from "../live";
import { getStudentByClerkId } from "../student/getStudentByClerkId";

export interface LessonComment {
  _id: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  parentCommentId?: string;
  authorType?: "student" | "admin";
  adminClerkId?: string;
  pinned?: boolean;
  student?: {
    _id: string;
    firstName: string;
    lastName: string;
    imageUrl: string | null;
    clerkId: string;
  };
}

/**
 * Fetches all comments for a lesson as a flat list.
 * The UI builds the tree structure client-side using parentCommentId.
 */
export async function getLessonComments(
  lessonId: string
): Promise<LessonComment[]> {
  const result = await sanityFetch({
    query: groq`*[_type == "lessonComment" && lesson._ref == $lessonId] | order(pinned desc, createdAt asc) {
      _id,
      content,
      createdAt,
      editedAt,
      authorType,
      adminClerkId,
      pinned,
      "parentCommentId": parentComment._ref,
      "student": student->{
        _id,
        firstName,
        lastName,
        imageUrl,
        clerkId
      }
    }`,
    params: { lessonId },
  });

  return (result.data as LessonComment[]) || [];
}

export async function createLessonComment(
  lessonId: string,
  clerkId: string,
  content: string,
  parentCommentId?: string
) {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) throw new Error("Student not found");

  const doc: Record<string, unknown> = {
    _type: "lessonComment",
    authorType: "student",
    student: { _type: "reference", _ref: student._id },
    lesson: { _type: "reference", _ref: lessonId },
    content,
    createdAt: new Date().toISOString(),
    pinned: false,
  };

  if (parentCommentId) {
    doc.parentComment = { _type: "reference", _ref: parentCommentId };
  }

  return client.create(doc);
}

export async function editLessonComment(
  commentId: string,
  clerkId: string,
  newContent: string
) {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) throw new Error("Student not found");

  const meta = await sanityFetch({
    query: groq`*[_type == "lessonComment" && _id == $commentId][0]{
      "studentRef": student._ref,
      authorType
    }`,
    params: { commentId },
  });
  const m = meta.data as { studentRef?: string; authorType?: string } | null;
  if (m?.authorType === "admin") {
    throw new Error("Staff comments can be edited from the admin panel");
  }
  if (m?.studentRef !== student._id) {
    throw new Error("Not authorized to edit this comment");
  }

  return client
    .patch(commentId)
    .set({ content: newContent, editedAt: new Date().toISOString() })
    .commit();
}

export async function deleteLessonComment(commentId: string, clerkId: string) {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) throw new Error("Student not found");

  const meta = await sanityFetch({
    query: groq`*[_type == "lessonComment" && _id == $commentId][0]{
      "studentRef": student._ref,
      authorType
    }`,
    params: { commentId },
  });
  const dm = meta.data as { studentRef?: string; authorType?: string } | null;
  if (dm?.authorType === "admin") {
    throw new Error("Staff comments can be removed from the admin panel");
  }
  if (dm?.studentRef !== student._id) {
    throw new Error("Not authorized to delete this comment");
  }

  // Also delete all replies to this comment
  const replies = await sanityFetch({
    query: groq`*[_type == "lessonComment" && parentComment._ref == $commentId]._id`,
    params: { commentId },
  });

  const replyIds = (replies.data as string[]) || [];

  if (replyIds.length > 0) {
    const tx = client.transaction();
    for (const replyId of replyIds) {
      tx.delete(replyId);
    }
    tx.delete(commentId);
    return tx.commit();
  }

  return client.delete(commentId);
}
