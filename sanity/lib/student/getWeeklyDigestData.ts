import groq from "groq";
import { sanityFetch } from "../live";

export interface StudentDigest {
  studentId: string;
  email: string;
  firstName: string;
  lessonsCompletedThisWeek: number;
  studyMinutesThisWeek: number;
  currentStreak: number;
  coursesInProgress: Array<{
    courseTitle: string;
    progress: number;
  }>;
}

export async function getAllStudentDigests(): Promise<StudentDigest[]> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekISO = weekAgo.toISOString();

  const result = await sanityFetch({
    query: groq`*[_type == "student" && defined(email)] {
      "_studentId": _id,
      "email": email,
      "firstName": coalesce(firstName, "Student"),
      "lessonsCompletedThisWeek": count(*[_type == "lessonCompletion" && student._ref == ^._id && completedAt >= $weekAgo]),
      "studySecondsThisWeek": math::sum(*[_type == "studySession" && student._ref == ^._id && startedAt >= $weekAgo].durationSeconds),
      "enrollments": *[_type == "enrollment" && student._ref == ^._id] {
        "courseTitle": course->title,
        "totalLessons": count(course->modules[]->lessons[]),
        "completedLessons": count(*[_type == "lessonCompletion" && student._ref == ^.^._id && course._ref == ^.course._ref])
      }
    }`,
    params: { weekAgo: weekISO },
  });

  const students = (result.data || []) as Array<{
    _studentId: string;
    email: string;
    firstName: string;
    lessonsCompletedThisWeek: number;
    studySecondsThisWeek: number;
    enrollments: Array<{
      courseTitle: string;
      totalLessons: number;
      completedLessons: number;
    }>;
  }>;

  return students
    .filter((s) => s.email && s.enrollments.length > 0)
    .map((s) => ({
      studentId: s._studentId,
      email: s.email,
      firstName: s.firstName,
      lessonsCompletedThisWeek: s.lessonsCompletedThisWeek || 0,
      studyMinutesThisWeek: Math.round(
        (s.studySecondsThisWeek || 0) / 60
      ),
      currentStreak: 0,
      coursesInProgress: s.enrollments
        .filter((e) => e.totalLessons > 0 && e.completedLessons < e.totalLessons)
        .map((e) => ({
          courseTitle: e.courseTitle,
          progress: Math.round(
            (e.completedLessons / e.totalLessons) * 100
          ),
        })),
    }));
}
