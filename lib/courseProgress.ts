import { GetCompletionsQueryResult, Module } from "@/sanity.types";

export function calculateTotalLessons(modules: Module[] | null): number {
  if (!modules) return 0;
  const uniqueLessonIds = new Set<string>();
  for (const mod of modules) {
    for (const lesson of mod.lessons || []) {
      if (lesson._id) uniqueLessonIds.add(lesson._id);
    }
  }
  return uniqueLessonIds.size;
}

export function calculateCourseProgress(
  modules: Module[] | null,
  completedLessons: GetCompletionsQueryResult["completedLessons"]
): number {
  const totalLessons = calculateTotalLessons(modules);
  const uniqueCompleted = new Set(
    completedLessons.map((c) => c.lesson?._id).filter(Boolean)
  );

  return Math.round(
    totalLessons > 0 ? (uniqueCompleted.size / totalLessons) * 100 : 0
  );
}
