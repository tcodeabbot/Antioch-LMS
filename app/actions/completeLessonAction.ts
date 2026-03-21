"use server";

import { completeLessonById } from "@/sanity/lib/lessons/completeLessonById";
import { checkAndNotifyMilestones } from "@/sanity/lib/notifications/milestoneCheck";

export async function completeLessonAction(lessonId: string, clerkId: string) {
  try {
    await completeLessonById({
      lessonId,
      clerkId,
    });

    checkAndNotifyMilestones(clerkId).catch(console.error);

    return { success: true };
  } catch (error) {
    console.error("Error completing lesson:", error);
    return { success: false, error: "Failed to complete lesson" };
  }
}
