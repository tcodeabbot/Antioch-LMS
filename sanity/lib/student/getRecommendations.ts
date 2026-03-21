import groq from "groq";
import { sanityFetch } from "../live";
import { getStudentByClerkId } from "./getStudentByClerkId";

export interface ContinueLearning {
  courseId: string;
  courseTitle: string;
  courseImage: string | null;
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  progress: number;
  lastActiveAt: string;
}

export interface SuggestedCourse {
  _id: string;
  title: string;
  slug: string;
  description: string | null;
  image: unknown;
  categoryName: string;
  instructorName: string | null;
  lessonCount: number;
}

export interface Recommendations {
  continueItems: ContinueLearning[];
  suggestedCourses: SuggestedCourse[];
}

export async function getRecommendations(
  clerkId: string
): Promise<Recommendations> {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) {
    return { continueItems: [], suggestedCourses: [] };
  }

  const result = await sanityFetch({
    query: groq`{
      "recentSessions": *[_type == "studySession" && student._ref == $studentId] | order(startedAt desc) [0...20] {
        "courseId": course._ref,
        "courseTitle": course->title,
        "courseImage": course->image,
        "lessonId": lesson._ref,
        "lessonTitle": lesson->title,
        "moduleTitle": *[_type == "module" && references(^.lesson._ref)][0].title,
        startedAt
      },
      "recentCompletions": *[_type == "lessonCompletion" && student._ref == $studentId] | order(completedAt desc) [0...10] {
        "courseId": course._ref,
        "lessonId": lesson._ref,
        completedAt
      },
      "enrolledCourseIds": *[_type == "enrollment" && student._ref == $studentId].course._ref,
      "enrolledCategories": *[_type == "enrollment" && student._ref == $studentId]{
        "categoryId": course->category._ref
      }.categoryId,
      "enrolledCourses": *[_type == "enrollment" && student._ref == $studentId]{
        "courseId": course._ref,
        "totalLessons": count(course->modules[]->lessons[]),
        "completedLessons": count(*[_type == "lessonCompletion" && student._ref == $studentId && course._ref == ^.course._ref])
      }
    }`,
    params: { studentId: student._id },
  });

  const data = result.data as {
    recentSessions: Array<{
      courseId: string;
      courseTitle: string;
      courseImage: unknown;
      lessonId: string;
      lessonTitle: string;
      moduleTitle: string | null;
      startedAt: string;
    }>;
    recentCompletions: Array<{
      courseId: string;
      lessonId: string;
      completedAt: string;
    }>;
    enrolledCourseIds: string[];
    enrolledCategories: string[];
    enrolledCourses: Array<{
      courseId: string;
      totalLessons: number;
      completedLessons: number;
    }>;
  };

  const completedLessonIds = new Set(
    (data.recentCompletions || []).map((c) => c.lessonId)
  );

  const progressMap = new Map<string, number>();
  for (const ec of data.enrolledCourses || []) {
    const pct =
      ec.totalLessons > 0
        ? Math.round((ec.completedLessons / ec.totalLessons) * 100)
        : 0;
    progressMap.set(ec.courseId, pct);
  }

  // Deduplicate by course — show the most recent lesson per course that isn't complete
  const seenCourses = new Set<string>();
  const continueItems: ContinueLearning[] = [];

  for (const s of data.recentSessions || []) {
    if (seenCourses.has(s.courseId)) continue;
    const progress = progressMap.get(s.courseId) ?? 0;
    if (progress >= 100) continue;

    seenCourses.add(s.courseId);
    continueItems.push({
      courseId: s.courseId,
      courseTitle: s.courseTitle,
      courseImage: s.courseImage as string | null,
      lessonId: s.lessonId,
      lessonTitle: s.lessonTitle,
      moduleTitle: s.moduleTitle || "",
      progress,
      lastActiveAt: s.startedAt,
    });

    if (continueItems.length >= 3) break;
  }

  // Suggest courses in the same categories that the student isn't enrolled in
  const enrolledIds = new Set(data.enrolledCourseIds || []);
  const categoryIds = [...new Set(data.enrolledCategories || [])].filter(
    Boolean
  );

  let suggestedCourses: SuggestedCourse[] = [];
  if (categoryIds.length > 0) {
    const suggestResult = await sanityFetch({
      query: groq`*[_type == "course" && category._ref in $categories && !(_id in $enrolled)] [0...6] {
        _id,
        title,
        "slug": slug.current,
        description,
        image,
        "categoryName": category->name,
        "instructorName": instructor->name,
        "lessonCount": count(modules[]->lessons[])
      }`,
      params: {
        categories: categoryIds,
        enrolled: [...enrolledIds],
      },
    });
    suggestedCourses =
      (suggestResult.data as SuggestedCourse[]) || [];
  }

  // If we don't have enough category-based suggestions, fill with popular ones
  if (suggestedCourses.length < 3) {
    const fillResult = await sanityFetch({
      query: groq`*[_type == "course" && !(_id in $enrolled)] | order(_createdAt desc) [0...${6 - suggestedCourses.length}] {
        _id,
        title,
        "slug": slug.current,
        description,
        image,
        "categoryName": category->name,
        "instructorName": instructor->name,
        "lessonCount": count(modules[]->lessons[])
      }`,
      params: { enrolled: [...enrolledIds] },
    });
    const existingIds = new Set(suggestedCourses.map((c) => c._id));
    for (const course of (fillResult.data as SuggestedCourse[]) || []) {
      if (!existingIds.has(course._id)) {
        suggestedCourses.push(course);
      }
    }
  }

  return { continueItems, suggestedCourses };
}
