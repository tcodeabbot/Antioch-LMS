"use server";

import { getProgressAnalytics } from "@/sanity/lib/student/getProgressAnalytics";

export async function getProgressAnalyticsAction(clerkId: string) {
  try {
    const analytics = await getProgressAnalytics(clerkId);
    return { success: true, data: analytics };
  } catch (error) {
    console.error("Error fetching progress analytics:", error);
    return {
      success: false,
      data: {
        completionsByDay: {},
        studyByDay: {},
        courseBreakdown: [],
        totalCompletions: 0,
        weeklyCompletions: 0,
        monthlyCompletions: 0,
      },
    };
  }
}
