interface ModuleWithLessons {
  _id: string;
  title?: string | null;
  lessons?: Array<{
    _id: string;
    title?: string | null;
    content?: unknown[] | null;
    videoUrl?: string | null;
    loomUrl?: string | null;
    duration?: number | null;
  }> | null;
}

interface FlatLesson {
  _id: string;
  title: string;
  moduleTitle: string;
  hasVideo: boolean;
  contentBlockCount: number;
  duration: number | null;
}

export function flattenLessons(
  modules: ModuleWithLessons[] | null | undefined
): FlatLesson[] {
  if (!modules) return [];

  return modules.flatMap((mod) =>
    (mod.lessons || []).map((lesson) => ({
      _id: lesson._id,
      title: lesson.title || "Untitled",
      moduleTitle: mod.title || "Untitled Module",
      hasVideo: !!(lesson.videoUrl || lesson.loomUrl),
      contentBlockCount: Array.isArray(lesson.content)
        ? lesson.content.length
        : 0,
      duration: lesson.duration ?? null,
    }))
  );
}

export function getLessonNavData(
  modules: ModuleWithLessons[] | null | undefined,
  currentLessonId: string
) {
  const lessons = flattenLessons(modules);
  const currentIndex = lessons.findIndex((l) => l._id === currentLessonId);
  const current = lessons[currentIndex] || null;

  const prev = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const next =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return {
    prevLesson: prev,
    nextLesson: next,
    currentIndex: currentIndex >= 0 ? currentIndex : 0,
    totalLessons: lessons.length,
    durationMinutes: current?.duration ?? null,
    hasVideo: current?.hasVideo ?? false,
  };
}
