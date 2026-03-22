import { defineQuery } from "groq";
import { sanityFetch } from "../live";
import { client } from "../client";

function iso(d: Date): string {
  return d.toISOString();
}

/** Rolling window: [currentPeriodStart, now] vs [previousPeriodStart, currentPeriodStart) */
export function getTrendWindows() {
  const now = new Date();
  const periodDays = 7;
  const ms = periodDays * 86400000;
  const currentStart = new Date(now.getTime() - ms);
  const previousStart = new Date(now.getTime() - 2 * ms);
  return {
    now: iso(now),
    currentStart: iso(currentStart),
    previousStart: iso(previousStart),
    periodDays,
  };
}

const activityQuery = defineQuery(`{
  "enrollments": *[_type == "enrollment" && enrolledAt >= $since] | order(enrolledAt desc) [0...12] {
    "at": enrolledAt,
    "studentName": student->firstName + " " + student->lastName,
    "courseTitle": course->title,
    "courseId": course._ref,
    "studentId": student._ref
  },
  "completions": *[_type == "lessonCompletion" && completedAt >= $since] | order(completedAt desc) [0...12] {
    "at": completedAt,
    "studentName": student->firstName + " " + student->lastName,
    "lessonTitle": lesson->title,
    "courseTitle": course->title,
    "lessonId": lesson._ref,
    "courseId": course._ref
  },
  "comments": *[_type == "lessonComment" && createdAt >= $since] | order(createdAt desc) [0...12] {
    "at": createdAt,
    authorType,
    "studentFirst": student->firstName,
    "studentLast": student->lastName,
    "lessonTitle": lesson->title,
    "lessonId": lesson._ref,
    "_id": _id,
    content
  },
  "quizzes": *[_type == "quizAttempt" && defined(completedAt) && completedAt >= $since] | order(completedAt desc) [0...12] {
    "at": completedAt,
    "studentName": student->firstName + " " + student->lastName,
    "lessonTitle": lesson->title,
    "passed": passed,
    "score": score,
    "lessonId": lesson._ref
  }
}`);

const trendsQuery = defineQuery(`{
  "enrollmentsNow": count(*[_type == "enrollment" && enrolledAt >= $currentStart]),
  "enrollmentsPrev": count(*[_type == "enrollment" && enrolledAt >= $previousStart && enrolledAt < $currentStart]),
  "studentsNow": count(*[_type == "student" && _createdAt >= $currentStart]),
  "studentsPrev": count(*[_type == "student" && _createdAt >= $previousStart && _createdAt < $currentStart]),
  "revenueNow": math::sum(*[_type == "enrollment" && enrolledAt >= $currentStart].amount),
  "revenuePrev": math::sum(*[_type == "enrollment" && enrolledAt >= $previousStart && enrolledAt < $currentStart].amount)
}`);

const needsAttentionQuery = defineQuery(`{
  "unansweredThreads": *[_type == "lessonComment" && !defined(parentComment)] {
    _id,
    content,
    createdAt,
    authorType,
    "replyCount": count(*[_type == "lessonComment" && parentComment._ref == ^._id]),
    "lessonTitle": lesson->title,
    "lessonId": lesson._ref,
    "studentFirst": student->firstName,
    "studentLast": student->lastName
  } [replyCount == 0] | order(createdAt asc) [0...8],
  "zeroEnrollmentCourses": *[_type == "course"] {
    _id,
    title,
    "slug": slug.current,
    "enrollmentCount": count(*[_type == "enrollment" && course._ref == ^._id])
  } [enrollmentCount == 0] | order(_createdAt desc) [0...6],
  "inactiveStudentsRaw": *[_type == "student"] | order(_updatedAt desc) [0...40] {
    _id,
    firstName,
    lastName,
    email,
    "lastSession": *[_type == "studySession" && student._ref == ^._id] | order(startedAt desc) [0].startedAt
  },
  "quizAttempts": *[_type == "quizAttempt" && defined(completedAt) && completedAt >= $quizSince] {
    "lessonId": lesson._ref,
    passed,
    score
  }
}`);

export type ActivityItem = {
  id: string;
  type: "enrollment" | "completion" | "comment" | "quiz";
  at: string;
  title: string;
  subtitle: string;
  href?: string;
};

function mergeActivity(
  data: {
    enrollments: {
      at: string;
      studentName: string;
      courseTitle: string;
      courseId: string;
    }[];
    completions: {
      at: string;
      studentName: string;
      lessonTitle: string;
      courseTitle: string;
      courseId: string;
    }[];
    comments: {
      at: string;
      authorType?: string;
      studentFirst?: string;
      studentLast?: string;
      lessonTitle: string;
      courseTitle: string;
      lessonId: string;
      courseId: string;
      _id: string;
      content?: string;
    }[];
    quizzes: {
      at: string;
      studentName: string;
      lessonTitle: string;
      passed: boolean;
      score?: number;
      lessonId: string;
    }[];
  },
  baseUrl: string
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const e of data.enrollments || []) {
    items.push({
      id: `en-${e.at}-${e.courseId}`,
      type: "enrollment",
      at: e.at,
      title: `${e.studentName?.trim() || "Student"} enrolled`,
      subtitle: e.courseTitle || "Course",
      href: `/admin/courses/${e.courseId}`,
    });
  }
  for (const c of data.completions || []) {
    items.push({
      id: `co-${c.at}-${c.lessonTitle}`,
      type: "completion",
      at: c.at,
      title: `${c.studentName?.trim() || "Student"} completed a lesson`,
      subtitle: `${c.lessonTitle} · ${c.courseTitle}`,
      href: `/admin/courses/${c.courseId}`,
    });
  }
  for (const c of data.comments || []) {
    const who =
      c.authorType === "admin"
        ? "Staff"
        : `${c.studentFirst || ""} ${c.studentLast || ""}`.trim() || "Someone";
    const prev = (c.content || "").replace(/\s+/g, " ").slice(0, 80);
    items.push({
      id: `cm-${c._id}`,
      type: "comment",
      at: c.at,
      title: `${who} commented`,
      subtitle: `${c.lessonTitle} · ${prev}${prev.length >= 80 ? "…" : ""}`,
      href: `/admin/discussions?lessonId=${c.lessonId}`,
    });
  }
  for (const q of data.quizzes || []) {
    items.push({
      id: `qz-${q.at}-${q.lessonTitle}-${q.studentName}`,
      type: "quiz",
      at: q.at,
      title: `${q.studentName?.trim() || "Student"} ${q.passed ? "passed" : "attempted"} a quiz`,
      subtitle: `${q.lessonTitle}${q.score != null ? ` · ${q.score}%` : ""}`,
    });
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return items.slice(0, 28);
}

export type TrendPct = { current: number; previous: number; deltaPct: number | null };

function pctDelta(cur: number, prev: number): number | null {
  if (prev === 0 && cur === 0) return null;
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

export type LowQuizLesson = {
  lessonId: string;
  passRate: number;
  attempts: number;
  lessonTitle: string;
  courseTitle: string;
  courseId: string;
};

export type AdminCommandCenterData = Awaited<
  ReturnType<typeof getAdminCommandCenterData>
>;

export async function getAdminCommandCenterData(baseUrl: string) {
  const w = getTrendWindows();
  const activitySince = new Date(Date.now() - 14 * 86400000).toISOString();
  const inactiveSince = new Date(Date.now() - 30 * 86400000).toISOString();
  const quizSince = new Date(Date.now() - 90 * 86400000).toISOString();

  const [activityRes, trendsRes, needsRes] = await Promise.all([
    sanityFetch({
      query: activityQuery,
      params: { since: activitySince },
    }),
    sanityFetch({
      query: trendsQuery,
      params: {
        currentStart: w.currentStart,
        previousStart: w.previousStart,
      },
    }),
    sanityFetch({
      query: needsAttentionQuery,
      params: { inactiveSince, quizSince },
    }),
  ]);

  const activityRaw = activityRes?.data as {
    enrollments: unknown[];
    completions: unknown[];
    comments: unknown[];
    quizzes: unknown[];
  };
  const activityFeed = mergeActivity(
    activityRaw as Parameters<typeof mergeActivity>[0],
    baseUrl
  );

  const t = trendsRes?.data as {
    enrollmentsNow: number;
    enrollmentsPrev: number;
    studentsNow: number;
    studentsPrev: number;
    revenueNow: number | null;
    revenuePrev: number | null;
  };

  const enrollmentsTrend: TrendPct = {
    current: t?.enrollmentsNow ?? 0,
    previous: t?.enrollmentsPrev ?? 0,
    deltaPct: pctDelta(t?.enrollmentsNow ?? 0, t?.enrollmentsPrev ?? 0),
  };
  const studentsTrend: TrendPct = {
    current: t?.studentsNow ?? 0,
    previous: t?.studentsPrev ?? 0,
    deltaPct: pctDelta(t?.studentsNow ?? 0, t?.studentsPrev ?? 0),
  };
  const revNow = (t?.revenueNow ?? 0) / 100;
  const revPrev = (t?.revenuePrev ?? 0) / 100;
  const revenueTrend: TrendPct = {
    current: revNow,
    previous: revPrev,
    deltaPct: pctDelta(revNow, revPrev),
  };

  const needs = needsRes?.data as {
    unansweredThreads: {
      _id: string;
      content: string;
      createdAt: string;
      authorType?: string;
      lessonTitle: string;
      lessonId: string;
      studentFirst?: string;
      studentLast?: string;
    }[];
    zeroEnrollmentCourses: {
      _id: string;
      title: string;
      slug: string;
    }[];
    inactiveStudentsRaw: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      lastSession?: string;
    }[];
    quizAttempts: { lessonId: string; passed: boolean; score?: number }[];
  };

  const inactiveStudents = (needs?.inactiveStudentsRaw || [])
    .filter((s) => !s.lastSession || s.lastSession < inactiveSince)
    .slice(0, 8);

  const lessonAgg = new Map<string, { passed: number; total: number }>();
  for (const a of needs?.quizAttempts || []) {
    const id = a.lessonId;
    if (!id) continue;
    const row = lessonAgg.get(id) || { passed: 0, total: 0 };
    row.total += 1;
    if (a.passed) row.passed += 1;
    lessonAgg.set(id, row);
  }

  const lowCandidates = [...lessonAgg.entries()]
    .filter(([, { passed, total }]) => total >= 5 && passed / total < 0.4)
    .sort((a, b) => a[1].passed / a[1].total - b[1].passed / b[1].total)
    .slice(0, 8);

  const lowIds = lowCandidates.map(([id]) => id);
  const titles =
    lowIds.length > 0
      ? await client.fetch<{ _id: string; title: string }[]>(
          `*[_type == "lesson" && _id in $ids]{ _id, title }`,
          { ids: lowIds }
        )
      : [];
  const titleById = new Map(titles.map((t) => [t._id, t.title]));

  const lowQuizLessons: LowQuizLesson[] = lowCandidates.map(([lessonId, { passed, total }]) => ({
    lessonId,
    passRate: Math.round((passed / total) * 1000) / 10,
    attempts: total,
    lessonTitle: titleById.get(lessonId) || "Lesson",
    courseTitle: "",
    courseId: "",
  }));

  return {
    windows: w,
    activityFeed,
    trends: {
      enrollments: enrollmentsTrend,
      newStudents: studentsTrend,
      revenueDollars: revenueTrend,
    },
    needsAttention: {
      unansweredThreads: needs?.unansweredThreads || [],
      zeroEnrollmentCourses: needs?.zeroEnrollmentCourses || [],
      inactiveStudents,
      lowQuizLessons: lowQuizLessons.slice(0, 6),
    },
  };
}
