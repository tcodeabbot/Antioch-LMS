import groq from "groq";
import { sanityFetch } from "../live";
import { getStudentByClerkId } from "./getStudentByClerkId";

export interface ProgressAnalytics {
  completionsByDay: Record<string, number>;
  studyByDay: Record<string, number>;
  courseBreakdown: Array<{
    courseId: string;
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    studySeconds: number;
  }>;
  totalCompletions: number;
  weeklyCompletions: number;
  monthlyCompletions: number;
}

export async function getProgressAnalytics(
  clerkId: string
): Promise<ProgressAnalytics> {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) {
    return {
      completionsByDay: {},
      studyByDay: {},
      courseBreakdown: [],
      totalCompletions: 0,
      weeklyCompletions: 0,
      monthlyCompletions: 0,
    };
  }

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const sinceISO = ninetyDaysAgo.toISOString();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekISO = weekAgo.toISOString();

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthISO = monthAgo.toISOString();

  const result = await sanityFetch({
    query: groq`{
      "completions": *[_type == "lessonCompletion" && student._ref == $studentId && completedAt >= $since]{
        completedAt,
        "courseId": course._ref
      },
      "weeklyCount": count(*[_type == "lessonCompletion" && student._ref == $studentId && completedAt >= $week]),
      "monthlyCount": count(*[_type == "lessonCompletion" && student._ref == $studentId && completedAt >= $month]),
      "totalCount": count(*[_type == "lessonCompletion" && student._ref == $studentId]),
      "studySessions": *[_type == "studySession" && student._ref == $studentId && startedAt >= $since]{
        startedAt,
        durationSeconds,
        "courseId": course._ref
      },
      "enrolledCourses": *[_type == "enrollment" && student._ref == $studentId]{
        "courseId": course._ref,
        "courseTitle": course->title,
        "totalLessons": count(course->modules[]->lessons[]),
        "completedLessons": count(*[_type == "lessonCompletion" && student._ref == $studentId && course._ref == ^.course._ref])
      }
    }`,
    params: {
      studentId: student._id,
      since: sinceISO,
      week: weekISO,
      month: monthISO,
    },
  });

  const data = result.data as {
    completions: Array<{ completedAt: string; courseId: string }>;
    weeklyCount: number;
    monthlyCount: number;
    totalCount: number;
    studySessions: Array<{
      startedAt: string;
      durationSeconds: number;
      courseId: string;
    }>;
    enrolledCourses: Array<{
      courseId: string;
      courseTitle: string;
      totalLessons: number;
      completedLessons: number;
    }>;
  };

  const completionsByDay: Record<string, number> = {};
  for (const c of data.completions || []) {
    const day = c.completedAt.slice(0, 10);
    completionsByDay[day] = (completionsByDay[day] || 0) + 1;
  }

  const studyByDay: Record<string, number> = {};
  const studyByCourse: Record<string, number> = {};
  for (const s of data.studySessions || []) {
    const day = s.startedAt.slice(0, 10);
    studyByDay[day] = (studyByDay[day] || 0) + (s.durationSeconds || 0);
    studyByCourse[s.courseId] =
      (studyByCourse[s.courseId] || 0) + (s.durationSeconds || 0);
  }

  const courseBreakdown = (data.enrolledCourses || []).map((c) => ({
    courseId: c.courseId,
    courseTitle: c.courseTitle,
    totalLessons: c.totalLessons || 0,
    completedLessons: c.completedLessons || 0,
    studySeconds: studyByCourse[c.courseId] || 0,
  }));

  return {
    completionsByDay,
    studyByDay,
    courseBreakdown,
    totalCompletions: data.totalCount || 0,
    weeklyCompletions: data.weeklyCount || 0,
    monthlyCompletions: data.monthlyCount || 0,
  };
}
