"use server";

import { client } from "@/sanity/lib/adminClient";
import { checkAdminAccess } from "@/lib/adminAuth";

export async function sendBulkNotificationAction(
  studentIds: string[],
  title: string,
  message: string
) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return { success: false, error: "Unauthorized" };
  }

  if (!studentIds.length || !title.trim()) {
    return { success: false, error: "Student IDs and title are required" };
  }

  try {
    const tx = client.transaction();
    const now = new Date().toISOString();

    for (const studentId of studentIds) {
      tx.create({
        _type: "notification",
        student: { _type: "reference", _ref: studentId },
        type: "general",
        title: title.trim(),
        message: message.trim() || undefined,
        read: false,
        createdAt: now,
      });
    }

    await tx.commit();

    return {
      success: true,
      count: studentIds.length,
    };
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
    return { success: false, error: "Failed to send notifications" };
  }
}
