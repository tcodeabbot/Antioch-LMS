"use server";

import { client } from "@/sanity/lib/adminClient";
import { checkAdminAccess } from "@/lib/adminAuth";

export async function adminDeleteCommentAction(commentId: string) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    const replies = await client.fetch<string[]>(
      `*[_type == "lessonComment" && parentComment._ref == $id]._id`,
      { id: commentId }
    );
    const tx = client.transaction();
    for (const id of replies || []) {
      tx.delete(id);
    }
    tx.delete(commentId);
    await tx.commit();
    return { success: true as const };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "Failed to delete" };
  }
}

export async function adminTogglePinAction(commentId: string, pinned: boolean) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    await client.patch(commentId).set({ pinned }).commit();
    return { success: true as const };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "Failed to update pin" };
  }
}

export async function adminReplyToDiscussionAction(
  lessonId: string,
  parentCommentId: string | null,
  content: string
) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return { success: false as const, error: "Unauthorized" };
  }

  const text = content.trim();
  if (!text) {
    return { success: false as const, error: "Content is required" };
  }

  try {
    const doc = {
      _type: "lessonComment" as const,
      lesson: { _type: "reference" as const, _ref: lessonId },
      content: text,
      createdAt: new Date().toISOString(),
      authorType: "admin" as const,
      adminClerkId: auth.userId,
      pinned: false,
      ...(parentCommentId
        ? { parentComment: { _type: "reference" as const, _ref: parentCommentId } }
        : {}),
    };
    await client.create(doc);
    return { success: true as const };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "Failed to post reply" };
  }
}
