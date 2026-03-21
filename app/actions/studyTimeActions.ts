"use server";

import {
  recordStudySession,
  getStudyTimeStats,
} from "@/sanity/lib/student/studyTime";

export async function recordStudySessionAction(
  clerkId: string,
  lessonId: string,
  courseId: string,
  durationSeconds: number,
  startedAt: string
) {
  try {
    await recordStudySession(
      clerkId,
      lessonId,
      courseId,
      durationSeconds,
      startedAt
    );
    return { success: true };
  } catch (error) {
    console.error("Error recording study session:", error);
    return { success: false };
  }
}

export async function getStudyTimeStatsAction(clerkId: string) {
  try {
    const stats = await getStudyTimeStats(clerkId);
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching study time stats:", error);
    return {
      success: false,
      data: {
        totalSeconds: 0,
        todaySeconds: 0,
        weekSeconds: 0,
        byCourse: [],
        last30Days: {},
      },
    };
  }
}
