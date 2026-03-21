import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export type AnalyticsRange = "7" | "30" | "90" | "all";

export function getRangeBounds(range: AnalyticsRange): { from: string; to: string } {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (range === "all") {
    return { from: "1970-01-01T00:00:00.000Z", to: to.toISOString() };
  }
  const days = parseInt(range, 10);
  const from = new Date(now.getTime() - days * 86400000);
  return { from: from.toISOString(), to: to.toISOString() };
}

function dayKey(d: string | Date): string {
  const x = typeof d === "string" ? new Date(d) : d;
  return x.toISOString().slice(0, 10);
}

function weekKey(d: string | Date): string {
  const x = typeof d === "string" ? new Date(d) : d;
  const day = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
  const dow = day.getUTCDay() || 7;
  if (dow !== 1) day.setUTCDate(day.getUTCDate() - (dow - 1));
  return day.toISOString().slice(0, 10);
}

function monthKey(d: string | Date): string {
  const x = typeof d === "string" ? new Date(d) : d;
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, "0")}`;
}

export interface TimeSeriesPoint {
  date: string;
  enrollments: number;
  revenueCents: number;
  activeStudents: number;
}

export interface EngagementSummary {
  avgStudyMinutesPerStudent: number;
  /** Lesson completions in range / distinct students who completed at least one */
  avgLessonsCompletedPerActiveStudent: number;
  /** hour 0–23 -> session count */
  sessionsByHour: { hour: number; count: number }[];
  /** 0 = Sun ... 6 = Sat (JS getDay) */
  sessionsByWeekday: { weekday: number; label: string; count: number }[];
  totalStudyMinutes: number;
  uniqueStudentsWithSessions: number;
}

export interface CourseComparisonRow {
  courseId: string;
  title: string;
  enrollmentCount: number;
  revenueCents: number;
  avgCompletionPercent: number;
  avgQuizScore: number | null;
  quizAttemptCount: number;
}

export interface DropOffRow {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  position: number;
  completedCount: number;
  /** students who completed this lesson but not the next */
  stoppedHereEstimate: number;
  dropRatePercent: number;
}

export interface QuizLessonRow {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  avgScore: number;
  passRatePercent: number;
  attemptCount: number;
}

export interface HardestQuestionRow {
  lessonId: string;
  lessonTitle: string;
  questionIndex: number;
  wrongRatePercent: number;
  sampleSize: number;
}

export interface AdminAnalyticsResult {
  range: AnalyticsRange;
  from: string;
  to: string;
  /** Summary totals in range */
  totals: {
    revenueCents: number;
    enrollments: number;
    activeStudents: number;
    /** Students who created an account in the range; for "all", total registered students */
    studentsInPeriod: number;
  };
  enrollmentSeries: TimeSeriesPoint[];
  revenueWeekly: { period: string; revenueCents: number }[];
  revenueMonthly: { period: string; revenueCents: number }[];
  engagement: EngagementSummary;
  courseComparison: CourseComparisonRow[];
  dropOffs: DropOffRow[];
  quizByLesson: QuizLessonRow[];
  hardestQuestions: HardestQuestionRow[];
}

const coursesStructureQuery = defineQuery(`*[_type == "course"] {
  _id,
  title,
  "modules": modules[]-> {
    _id,
    title,
    order,
    "lessons": lessons[]-> {
      _id,
      title,
      order
    }
  }
}`);

const enrollmentsInRangeQuery = defineQuery(`*[_type == "enrollment" && enrolledAt >= $from && enrolledAt <= $to] {
  enrolledAt,
  amount,
  "courseId": course._ref,
  "studentId": student._ref
}`);

const studentsJoinedInRangeQuery = defineQuery(`*[_type == "student" && _createdAt >= $from && _createdAt <= $to] {
  _id
}`);

const sessionsInRangeQuery = defineQuery(`*[_type == "studySession" && startedAt >= $from && startedAt <= $to] {
  startedAt,
  durationSeconds,
  "studentId": student._ref
}`);

const completionsInRangeQuery = defineQuery(`*[_type == "lessonCompletion" && completedAt >= $from && completedAt <= $to] {
  completedAt,
  "lessonId": lesson._ref,
  "courseId": course._ref,
  "studentId": student._ref
}`);

const quizAttemptsInRangeQuery = defineQuery(`*[_type == "quizAttempt" && defined(completedAt) && completedAt >= $from && completedAt <= $to] {
  score,
  passed,
  completedAt,
  answers,
  "lessonId": lesson._ref,
  "studentId": student._ref
}`);

const totalStudentsCountQuery = defineQuery(`count(*[_type == "student"])`);

type CourseModule = {
  _id: string;
  title: string;
  order?: number;
  lessons?: {
    _id: string;
    title: string;
    order?: number;
    videoUrl?: string;
    loomUrl?: string;
    quizCount?: number;
  }[];
};

function flattenOrderedLessons(modules: CourseModule[] | undefined) {
  if (!modules?.length) return [];
  const sorted = [...modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const out: { _id: string; title: string; moduleTitle: string; index: number }[] = [];
  let idx = 0;
  for (const m of sorted) {
    const lessons = [...(m.lessons || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const l of lessons) {
      out.push({
        _id: l._id,
        title: l.title,
        moduleTitle: m.title,
        index: idx++,
      });
    }
  }
  return out;
}

function buildLessonToCourseMap(courses: { _id: string; modules?: CourseModule[] }[]) {
  const map = new Map<string, string>();
  for (const c of courses) {
    const flat = flattenOrderedLessons(c.modules);
    for (const l of flat) {
      map.set(l._id, c._id);
    }
  }
  return map;
}

export async function getAdminAnalytics(range: AnalyticsRange): Promise<AdminAnalyticsResult> {
  const { from, to } = getRangeBounds(range);

  const [coursesRes, enrollmentsRes, sessionsRes, completionsRes, quizRes, studentsJoinedRes, totalStudentsRes] =
    await Promise.all([
      sanityFetch({ query: coursesStructureQuery }),
      sanityFetch({ query: enrollmentsInRangeQuery, params: { from, to } }),
      sanityFetch({ query: sessionsInRangeQuery, params: { from, to } }),
      sanityFetch({ query: completionsInRangeQuery, params: { from, to } }),
      sanityFetch({ query: quizAttemptsInRangeQuery, params: { from, to } }),
      sanityFetch({ query: studentsJoinedInRangeQuery, params: { from, to } }),
      sanityFetch({ query: totalStudentsCountQuery }),
    ]);

  const courses = (coursesRes?.data || []) as {
    _id: string;
    title: string;
    modules?: CourseModule[];
  }[];

  const lessonToCourse = buildLessonToCourseMap(courses);

  const enrollments = (enrollmentsRes?.data || []) as {
    enrolledAt: string;
    amount: number;
    courseId: string;
    studentId: string;
  }[];

  const sessions = (sessionsRes?.data || []) as {
    startedAt: string;
    durationSeconds: number;
    studentId: string;
  }[];

  const completions = (completionsRes?.data || []) as {
    completedAt: string;
    lessonId: string;
    courseId: string;
    studentId: string;
  }[];

  const quizAttempts = (quizRes?.data || []) as {
    score?: number;
    passed?: boolean;
    completedAt: string;
    lessonId: string;
    studentId: string;
    answers?: { questionIndex?: number; isCorrect?: boolean }[];
  }[];

  const studentsJoinedCount = ((studentsJoinedRes?.data || []) as { _id: string }[]).length;
  const totalStudentsRegistered =
    typeof totalStudentsRes?.data === "number" ? totalStudentsRes.data : 0;

  // --- Time series: daily enrollments, revenue, active students
  const dayEnroll = new Map<string, { n: number; rev: number }>();
  const dayStudents = new Map<string, Set<string>>();

  for (const e of enrollments) {
    const k = dayKey(e.enrolledAt);
    const cur = dayEnroll.get(k) || { n: 0, rev: 0 };
    cur.n += 1;
    cur.rev += e.amount || 0;
    dayEnroll.set(k, cur);
  }

  for (const s of sessions) {
    const k = dayKey(s.startedAt);
    if (!dayStudents.has(k)) dayStudents.set(k, new Set());
    dayStudents.get(k)!.add(s.studentId);
  }

  const allDays = new Set<string>([...dayEnroll.keys(), ...dayStudents.keys()]);
  const sortedDays = [...allDays].sort();
  const enrollmentSeries: TimeSeriesPoint[] = sortedDays.map((d) => ({
    date: d,
    enrollments: dayEnroll.get(d)?.n ?? 0,
    revenueCents: dayEnroll.get(d)?.rev ?? 0,
    activeStudents: dayStudents.get(d)?.size ?? 0,
  }));

  // Weekly / monthly revenue from enrollments in range
  const weekRev = new Map<string, number>();
  const monthRev = new Map<string, number>();
  for (const e of enrollments) {
    const wk = weekKey(e.enrolledAt);
    const mk = monthKey(e.enrolledAt);
    weekRev.set(wk, (weekRev.get(wk) || 0) + (e.amount || 0));
    monthRev.set(mk, (monthRev.get(mk) || 0) + (e.amount || 0));
  }
  const revenueWeekly = [...weekRev.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, revenueCents]) => ({ period, revenueCents }));
  const revenueMonthly = [...monthRev.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, revenueCents]) => ({ period, revenueCents }));

  const totalRevenueCents = enrollments.reduce((s, e) => s + (e.amount || 0), 0);
  const uniqueSessionStudents = new Set(sessions.map((s) => s.studentId));

  // Engagement: study time, completion rate in range, hour / weekday
  const totalStudySeconds = sessions.reduce((s, x) => s + (x.durationSeconds || 0), 0);
  const hourCounts = new Array(24).fill(0) as number[];
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayCounts = new Array(7).fill(0) as number[];
  for (const s of sessions) {
    const dt = new Date(s.startedAt);
    hourCounts[dt.getHours()]++;
    weekdayCounts[dt.getDay()]++;
  }

  const distinctCompleters = new Set(completions.map((c) => c.studentId));
  const totalLessonCompletes = completions.length;
  const avgLessonsCompletedPerActiveStudent =
    distinctCompleters.size > 0 ? totalLessonCompletes / distinctCompleters.size : 0;
  const avgStudyMinutesPerStudent =
    uniqueSessionStudents.size > 0 ? totalStudySeconds / uniqueSessionStudents.size / 60 : 0;

  const engagement: EngagementSummary = {
    avgStudyMinutesPerStudent: Math.round(avgStudyMinutesPerStudent * 10) / 10,
    avgLessonsCompletedPerActiveStudent: Math.round(avgLessonsCompletedPerActiveStudent * 10) / 10,
    sessionsByHour: hourCounts.map((count, hour) => ({ hour, count })),
    sessionsByWeekday: weekdayCounts.map((count, weekday) => ({
      weekday,
      label: weekdayLabels[weekday],
      count,
    })),
    totalStudyMinutes: Math.round(totalStudySeconds / 60),
    uniqueStudentsWithSessions: uniqueSessionStudents.size,
  };

  // Course comparison: enrollments & revenue in range; completion & quiz per course
  const courseMeta = new Map(courses.map((c) => [c._id, c.title]));
  const byCourse = new Map<
    string,
    { enrollments: number; revenueCents: number; studentIds: Set<string> }
  >();

  for (const e of enrollments) {
    if (!e.courseId) continue;
    const row = byCourse.get(e.courseId) || {
      enrollments: 0,
      revenueCents: 0,
      studentIds: new Set<string>(),
    };
    row.enrollments += 1;
    row.revenueCents += e.amount || 0;
    row.studentIds.add(e.studentId);
    byCourse.set(e.courseId, row);
  }

  const completionsByCourse = new Map<string, { byStudent: Map<string, Set<string>>; totalLessons: number }>();
  for (const c of courses) {
    const flat = flattenOrderedLessons(c.modules);
    completionsByCourse.set(c._id, {
      byStudent: new Map(),
      totalLessons: flat.length,
    });
  }

  for (const comp of completions) {
    const bucket = completionsByCourse.get(comp.courseId);
    if (!bucket) continue;
    if (!bucket.byStudent.has(comp.studentId)) bucket.byStudent.set(comp.studentId, new Set());
    bucket.byStudent.get(comp.studentId)!.add(comp.lessonId);
  }

  const quizByCourse = new Map<string, { scores: number[]; attempts: number }>();
  for (const q of quizAttempts) {
    const cid = lessonToCourse.get(q.lessonId);
    if (!cid) continue;
    const row = quizByCourse.get(cid) || { scores: [] as number[], attempts: 0 };
    if (typeof q.score === "number") row.scores.push(q.score);
    row.attempts += 1;
    quizByCourse.set(cid, row);
  }

  const courseComparison: CourseComparisonRow[] = courses.map((c) => {
    const bc = byCourse.get(c._id);
    const cb = completionsByCourse.get(c._id);
    let avgCompletion = 0;
    if (cb && cb.totalLessons > 0 && cb.byStudent.size > 0) {
      let sum = 0;
      for (const set of cb.byStudent.values()) {
        sum += set.size / cb.totalLessons;
      }
      avgCompletion = (sum / cb.byStudent.size) * 100;
    }
    const qz = quizByCourse.get(c._id);
    const avgQuiz =
      qz && qz.scores.length > 0 ? qz.scores.reduce((a, b) => a + b, 0) / qz.scores.length : null;

    return {
      courseId: c._id,
      title: c.title,
      enrollmentCount: bc?.enrollments ?? 0,
      revenueCents: bc?.revenueCents ?? 0,
      avgCompletionPercent: Math.round(avgCompletion * 10) / 10,
      avgQuizScore: avgQuiz !== null ? Math.round(avgQuiz * 10) / 10 : null,
      quizAttemptCount: qz?.attempts ?? 0,
    };
  });

  courseComparison.sort((a, b) => b.enrollmentCount - a.enrollmentCount);

  // Drop-off: for each course with lessons, count completions per ordered lesson; find biggest step-down
  const dropOffs: DropOffRow[] = [];
  for (const c of courses) {
    const ordered = flattenOrderedLessons(c.modules);
    if (ordered.length < 2) continue;

    const completedByLesson = ordered.map((lesson) => {
      const set = new Set<string>();
      for (const comp of completions) {
        if (comp.courseId === c._id && comp.lessonId === lesson._id) {
          set.add(comp.studentId);
        }
      }
      return { lesson, count: set.size, students: set };
    });

    for (let i = 0; i < completedByLesson.length - 1; i++) {
      const cur = completedByLesson[i];
      const next = completedByLesson[i + 1];
      let stopped = 0;
      for (const sid of cur.students) {
        if (!next.students.has(sid)) stopped++;
      }
      const dropRate = cur.count > 0 ? (stopped / cur.count) * 100 : 0;
      dropOffs.push({
        courseId: c._id,
        courseTitle: c.title,
        lessonId: cur.lesson._id,
        lessonTitle: cur.lesson.title,
        position: i + 1,
        completedCount: cur.count,
        stoppedHereEstimate: stopped,
        dropRatePercent: Math.round(dropRate * 10) / 10,
      });
    }
  }

  dropOffs.sort((a, b) => b.stoppedHereEstimate - a.stoppedHereEstimate);
  const dropOffTop = dropOffs.slice(0, 15);

  // Quiz by lesson
  const lessonTitles = new Map<string, string>();
  for (const c of courses) {
    const flat = flattenOrderedLessons(c.modules);
    for (const l of flat) {
      lessonTitles.set(l._id, l.title);
    }
  }

  const quizLessonMap = new Map<
    string,
    { scores: number[]; passed: number; attempts: number; courseTitle: string }
  >();

  for (const q of quizAttempts) {
    const cid = lessonToCourse.get(q.lessonId);
    const courseTitle = cid ? courseMeta.get(cid) || "—" : "—";
    const row = quizLessonMap.get(q.lessonId) || {
      scores: [] as number[],
      passed: 0,
      attempts: 0,
      courseTitle,
    };
    if (typeof q.score === "number") row.scores.push(q.score);
    if (q.passed) row.passed += 1;
    row.attempts += 1;
    quizLessonMap.set(q.lessonId, row);
  }

  const quizByLesson: QuizLessonRow[] = [...quizLessonMap.entries()].map(([lessonId, v]) => ({
    lessonId,
    lessonTitle: lessonTitles.get(lessonId) || "Lesson",
    courseTitle: v.courseTitle,
    avgScore:
      v.scores.length > 0
        ? Math.round((v.scores.reduce((a, b) => a + b, 0) / v.scores.length) * 10) / 10
        : 0,
    passRatePercent: v.attempts > 0 ? Math.round((v.passed / v.attempts) * 1000) / 10 : 0,
    attemptCount: v.attempts,
  }));
  quizByLesson.sort((a, b) => b.attemptCount - a.attemptCount);

  // Hardest questions (by wrong rate)
  const qStats = new Map<string, Map<number, { wrong: number; total: number }>>();
  for (const q of quizAttempts) {
    if (!q.answers?.length) continue;
    if (!qStats.has(q.lessonId)) qStats.set(q.lessonId, new Map());
    const m = qStats.get(q.lessonId)!;
    for (const a of q.answers) {
      const qi = typeof a.questionIndex === "number" ? a.questionIndex : 0;
      const row = m.get(qi) || { wrong: 0, total: 0 };
      row.total += 1;
      if (a.isCorrect === false) row.wrong += 1;
      m.set(qi, row);
    }
  }

  const hardestQuestions: HardestQuestionRow[] = [];
  for (const [lessonId, idxMap] of qStats) {
    for (const [questionIndex, { wrong, total }] of idxMap) {
      if (total < 3) continue;
      const wrongRate = (wrong / total) * 100;
      hardestQuestions.push({
        lessonId,
        lessonTitle: lessonTitles.get(lessonId) || "Lesson",
        questionIndex,
        wrongRatePercent: Math.round(wrongRate * 10) / 10,
        sampleSize: total,
      });
    }
  }
  hardestQuestions.sort((a, b) => b.wrongRatePercent - a.wrongRatePercent);
  const hardestTop = hardestQuestions.slice(0, 12);

  const studentsInPeriod = range === "all" ? totalStudentsRegistered : studentsJoinedCount;

  return {
    range,
    from,
    to,
    totals: {
      revenueCents: totalRevenueCents,
      enrollments: enrollments.length,
      activeStudents: uniqueSessionStudents.size,
      studentsInPeriod,
    },
    enrollmentSeries,
    revenueWeekly,
    revenueMonthly,
    engagement,
    courseComparison,
    dropOffs: dropOffTop,
    quizByLesson: quizByLesson.slice(0, 20),
    hardestQuestions: hardestTop,
  };
}
