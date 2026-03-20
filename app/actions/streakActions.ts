"use server";

import { getLearningStreak } from "@/sanity/lib/student/getLearningStreak";

export async function getLearningStreakAction(clerkId: string) {
  try {
    const streak = await getLearningStreak(clerkId);
    return { success: true, data: streak };
  } catch (error) {
    console.error("Error fetching learning streak:", error);
    return {
      success: false,
      data: { currentStreak: 0, longestStreak: 0, todayCompleted: 0, last30Days: {} },
    };
  }
}
