import { defineQuery } from "groq";
import { sanityFetch } from "../live";
import { clerkClient } from "@clerk/nextjs/server";

type ModuleIn = {
  _id: string;
  title: string;
  order?: number;
  lessons?: {
    _id: string;
    title: string;
    order?: number;
    description?: string;
    videoUrl?: string;
    loomUrl?: string;
    quizQuestionCount?: number;
  }[];
};

function flattenOrderedLessons(modules: ModuleIn[] | undefined) {
  if (!modules?.length) return [];
  const sorted = [...modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const out: { _id: string; title: string; moduleTitle: string }[] = [];
  for (const m of sorted) {
    const lessons = [...(m.lessons || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const l of lessons) {
      out.push({
        _id: l._id,
        title: l.title,
        moduleTitle: m.title,
      });
    }
  }
  return out;
}

function getContentHealthWarnings(modules: ModuleIn[] | undefined, description?: string): string[] {
  const w: string[] = [];
  const desc = (description || "").trim();
  if (!desc || desc.length < 8) w.push("Short or missing course description");
  const mods = modules || [];
  if (mods.length === 0) w.push("No modules");
  let noVideo = 0;
  let noQuiz = 0;
  let noLessonDesc = 0;
  for (const m of mods) {
    const lessons = [...(m.lessons || [])];
    if (lessons.length === 0) w.push(`Empty module: ${m.title || "Untitled"}`);
    for (const l of lessons) {
      if (!l.videoUrl && !l.loomUrl) noVideo++;
      if (!l.quizQuestionCount) noQuiz++;
      if (!(l.description || "").trim()) noLessonDesc++;
    }
  }
  if (noVideo) w.push(`${noVideo} lesson(s) without video`);
  if (noQuiz) w.push(`${noQuiz} lesson(s) without quiz`);
  if (noLessonDesc) w.push(`${noLessonDesc} lesson(s) without description`);
  return w;
}

export async function getCourseDetails(courseId: string) {
  const courseDetailsQuery = defineQuery(`*[_type == "course" && _id == $courseId][0] {
    _id,
    title,
    description,
    price,
    isFree,
    publicationStatus,
    "slug": slug.current,
    _createdAt,
    "category": category->{title},
    "instructor": instructor->{name, bio, photo},
    "modules": modules[]-> {
      _id,
      title,
      order,
      "lessons": lessons[]-> {
        _id,
        title,
        order,
        description,
        videoUrl,
        loomUrl,
        "quizQuestionCount": count(quizQuestions)
      }
    },
    "enrollments": *[_type == "enrollment" && course._ref == ^._id] {
      _id,
      enrolledAt,
      amount,
      "student": student-> {
        _id,
        firstName,
        lastName,
        email,
        clerkId,
        imageUrl,
        _createdAt
      }
    }
  }`);

  const result = await sanityFetch({
    query: courseDetailsQuery,
    params: { courseId },
  });

  const course = result?.data;

  if (!course) {
    return null;
  }

  const validEnrollments = await Promise.all(
    (course.enrollments || []).map(async (enrollment: {
      student: { clerkId: string };
    }) => {
      try {
        const client = await clerkClient();
        await client.users.getUser(enrollment.student.clerkId);
        return enrollment;
      } catch {
        return null;
      }
    })
  );

  const filteredEnrollments = validEnrollments.filter(
    (enrollment): enrollment is NonNullable<typeof enrollment> => enrollment !== null
  );

  const totalEnrollments = filteredEnrollments.length;
  const totalRevenueCents = filteredEnrollments.reduce(
    (sum, enrollment) => sum + (enrollment.amount || 0),
    0
  );

  const completionQuery = defineQuery(`{
    "totalLessons": count(*[_type == "lesson" && references($courseId)]),
    "completions": *[_type == "lessonCompletion" && course._ref == $courseId] {
      "studentId": student._ref,
      "lessonId": lesson._ref,
      completedAt
    }
  }`);

  const completionResult = await sanityFetch({
    query: completionQuery,
    params: { courseId },
  });

  const completionData = completionResult?.data || {
    totalLessons: 0,
    completions: [] as {
      studentId: string;
      lessonId: string;
      completedAt?: string;
    }[],
  };

  const modules = course.modules as ModuleIn[] | undefined;
  const orderedLessons = flattenOrderedLessons(modules);
  const totalOrderedLessons =
    orderedLessons.length > 0 ? orderedLessons.length : completionData.totalLessons;

  const studentCompletionMap = new Map<string, number>();
  const studentLastActivity = new Map<string, string>();
  const completionsByLesson = new Map<string, Set<string>>();

  completionData.completions.forEach((completion) => {
    const count = studentCompletionMap.get(completion.studentId) || 0;
    studentCompletionMap.set(completion.studentId, count + 1);
    const prev = studentLastActivity.get(completion.studentId);
    const at = completion.completedAt || "";
    if (!prev || at > prev) studentLastActivity.set(completion.studentId, at);
    if (!completionsByLesson.has(completion.lessonId)) {
      completionsByLesson.set(completion.lessonId, new Set());
    }
    completionsByLesson.get(completion.lessonId)!.add(completion.studentId);
  });

  const averageCompletionRate =
    totalEnrollments > 0 && totalOrderedLessons > 0
      ? Array.from(studentCompletionMap.values()).reduce((sum, count) => sum + count, 0) /
        totalEnrollments /
        totalOrderedLessons
      : 0;

  const studentProgress = filteredEnrollments
    .map((e: { student: { _id: string; firstName?: string; lastName?: string; email?: string } }) => {
      const sid = e.student._id;
      const done = studentCompletionMap.get(sid) || 0;
      const pct =
        totalOrderedLessons > 0 ? Math.round((done / totalOrderedLessons) * 1000) / 10 : 0;
      return {
        student: e.student,
        completedLessons: done,
        totalLessons: totalOrderedLessons,
        progressPercent: pct,
        lastActivity: studentLastActivity.get(sid) || null,
      };
    })
    .sort((a, b) => b.completedLessons - a.completedLessons);

  const funnel = orderedLessons.map((lesson, index) => {
    const studentsHere = completionsByLesson.get(lesson._id);
    const count = studentsHere?.size ?? 0;
    return {
      position: index + 1,
      lessonId: lesson._id,
      title: lesson.title,
      moduleTitle: lesson.moduleTitle,
      completedByCount: count,
      percentOfEnrolled:
        totalEnrollments > 0 ? Math.round((count / totalEnrollments) * 1000) / 10 : 0,
    };
  });

  const quizQuery = defineQuery(`*[_type == "quizAttempt" && lesson._ref in $lessonIds] {
    score,
    passed,
    "lessonId": lesson._ref
  }`);

  const lessonIds = orderedLessons.map((l) => l._id);
  const quizResult =
    lessonIds.length > 0
      ? await sanityFetch({
          query: quizQuery,
          params: { lessonIds },
        })
      : { data: [] };

  const attempts = (quizResult?.data || []) as {
    score?: number;
    passed?: boolean;
    lessonId: string;
  }[];

  const byLessonQuiz = new Map<string, { scores: number[]; pass: number; n: number }>();
  for (const a of attempts) {
    const row = byLessonQuiz.get(a.lessonId) || { scores: [] as number[], pass: 0, n: 0 };
    row.n += 1;
    if (typeof a.score === "number") row.scores.push(a.score);
    if (a.passed) row.pass += 1;
    byLessonQuiz.set(a.lessonId, row);
  }

  const quizByLesson = orderedLessons.map((l) => {
    const q = byLessonQuiz.get(l._id);
    return {
      lessonId: l._id,
      title: l.title,
      avgScore:
        q && q.scores.length > 0
          ? Math.round((q.scores.reduce((a, b) => a + b, 0) / q.scores.length) * 10) / 10
          : null,
      passRate:
        q && q.n > 0 ? Math.round((q.pass / q.n) * 1000) / 10 : null,
      attempts: q?.n ?? 0,
    };
  });

  const contentWarnings = getContentHealthWarnings(modules, course.description);

  return {
    ...course,
    enrollments: filteredEnrollments,
    stats: {
      totalEnrollments,
      totalRevenueCents,
      totalLessons: totalOrderedLessons,
      averageCompletionRate: Math.round(averageCompletionRate * 100),
      totalModules: course.modules?.length || 0,
    },
    orderedLessons,
    studentProgress,
    funnel,
    quizByLesson,
    contentWarnings,
  };
}
