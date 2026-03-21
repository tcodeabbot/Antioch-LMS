"use client";

import { useStudyTimeTracker } from "@/hooks/useStudyTimeTracker";

interface StudyTimeTrackerProps {
  lessonId: string;
  courseId: string;
}

export function StudyTimeTracker({ lessonId, courseId }: StudyTimeTrackerProps) {
  useStudyTimeTracker(lessonId, courseId);
  return null;
}
