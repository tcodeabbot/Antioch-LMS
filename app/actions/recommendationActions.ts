"use server";

import { getRecommendations } from "@/sanity/lib/student/getRecommendations";

export async function getRecommendationsAction(clerkId: string) {
  try {
    const data = await getRecommendations(clerkId);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return {
      success: false,
      data: { continueItems: [], suggestedCourses: [] },
    };
  }
}
