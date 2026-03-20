"use server";

import {
  isLessonBookmarked,
  toggleLessonBookmark,
  getStudentBookmarks,
} from "@/sanity/lib/lessons/lessonBookmarks";

export async function isLessonBookmarkedAction(
  lessonId: string,
  clerkId: string
) {
  try {
    const bookmarked = await isLessonBookmarked(lessonId, clerkId);
    return { success: true, data: bookmarked };
  } catch (error) {
    console.error("Error checking bookmark:", error);
    return { success: false, data: false };
  }
}

export async function toggleBookmarkAction(
  lessonId: string,
  courseId: string,
  clerkId: string
) {
  try {
    const isNowBookmarked = await toggleLessonBookmark(
      lessonId,
      courseId,
      clerkId
    );
    return { success: true, data: isNowBookmarked };
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return { success: false, error: "Failed to toggle bookmark" };
  }
}

export async function getStudentBookmarksAction(clerkId: string) {
  try {
    const bookmarks = await getStudentBookmarks(clerkId);
    return { success: true, data: bookmarks };
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return { success: false, data: [] };
  }
}
