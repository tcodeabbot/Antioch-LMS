import groq from "groq";
import { sanityFetch } from "../live";
import { client } from "../adminClient";
import { getStudentByClerkId } from "./getStudentByClerkId";

export interface StudyTimeStats {
  totalSeconds: number;
  todaySeconds: number;
  weekSeconds: number;
  byCourse: Array<{
    courseId: string;
    courseTitle: string;
    totalSeconds: number;
  }>;
  last30Days: Record<string, number>;
}

export async function recordStudySession(
  clerkId: string,
  lessonId: string,
  courseId: string,
  durationSeconds: number,
  startedAt: string
) {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id || durationSeconds < 5) return null;

  return client.create({
    _type: "studySession",
    student: { _type: "reference", _ref: student._id },
    lesson: { _type: "reference", _ref: lessonId },
    course: { _type: "reference", _ref: courseId },
    durationSeconds: Math.round(durationSeconds),
    startedAt,
  });
}

export async function getStudyTimeStats(
  clerkId: string
): Promise<StudyTimeStats> {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) {
    return {
      totalSeconds: 0,
      todaySeconds: 0,
      weekSeconds: 0,
      byCourse: [],
      last30Days: {},
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  const weekISO = weekAgo.toISOString();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyISO = thirtyDaysAgo.toISOString();

  const result = await sanityFetch({
    query: groq`{
      "total": *[_type == "studySession" && student._ref == $studentId]{
        durationSeconds
      },
      "today": *[_type == "studySession" && student._ref == $studentId && startedAt >= $today]{
        durationSeconds
      },
      "week": *[_type == "studySession" && student._ref == $studentId && startedAt >= $week]{
        durationSeconds
      },
      "byCourse": *[_type == "studySession" && student._ref == $studentId]{
        "courseId": course._ref,
        "courseTitle": course->title,
        durationSeconds
      },
      "last30": *[_type == "studySession" && student._ref == $studentId && startedAt >= $thirty]{
        startedAt,
        durationSeconds
      }
    }`,
    params: {
      studentId: student._id,
      today: todayISO,
      week: weekISO,
      thirty: thirtyISO,
    },
  });

  const data = result.data as {
    total: Array<{ durationSeconds: number }>;
    today: Array<{ durationSeconds: number }>;
    week: Array<{ durationSeconds: number }>;
    byCourse: Array<{
      courseId: string;
      courseTitle: string;
      durationSeconds: number;
    }>;
    last30: Array<{ startedAt: string; durationSeconds: number }>;
  };

  const sumDuration = (arr: Array<{ durationSeconds: number }>) =>
    arr.reduce((s, r) => s + (r.durationSeconds || 0), 0);

  const courseMap = new Map<
    string,
    { courseTitle: string; totalSeconds: number }
  >();
  for (const s of data.byCourse || []) {
    const existing = courseMap.get(s.courseId);
    if (existing) {
      existing.totalSeconds += s.durationSeconds || 0;
    } else {
      courseMap.set(s.courseId, {
        courseTitle: s.courseTitle,
        totalSeconds: s.durationSeconds || 0,
      });
    }
  }

  const last30Days: Record<string, number> = {};
  for (const s of data.last30 || []) {
    const day = s.startedAt.slice(0, 10);
    last30Days[day] = (last30Days[day] || 0) + (s.durationSeconds || 0);
  }

  return {
    totalSeconds: sumDuration(data.total || []),
    todaySeconds: sumDuration(data.today || []),
    weekSeconds: sumDuration(data.week || []),
    byCourse: Array.from(courseMap.entries())
      .map(([courseId, v]) => ({ courseId, ...v }))
      .sort((a, b) => b.totalSeconds - a.totalSeconds),
    last30Days,
  };
}
