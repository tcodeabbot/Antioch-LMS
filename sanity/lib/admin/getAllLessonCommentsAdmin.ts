import { client } from "../client";

export type AdminCommentRow = {
  _id: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  authorType?: string;
  adminClerkId?: string;
  pinned?: boolean;
  parentCommentId?: string | null;
  lessonId: string;
  lessonTitle: string | null;
  courseId?: string | null;
  courseTitle?: string | null;
  studentFirst?: string | null;
  studentLast?: string | null;
  studentId?: string | null;
};

const projection = `{
  _id,
  content,
  createdAt,
  editedAt,
  authorType,
  adminClerkId,
  pinned,
  "parentCommentId": parentComment._ref,
  "lessonId": lesson._ref,
  "lessonTitle": lesson->title,
  "courseId": *[_type == "course" && ^.lesson._ref in modules[]->lessons[]._ref][0]._id,
  "courseTitle": *[_type == "course" && ^.lesson._ref in modules[]->lessons[]._ref][0].title,
  "studentFirst": student->firstName,
  "studentLast": student->lastName,
  "studentId": student._ref
}`;

export async function getLessonIdsForCourse(courseId: string): Promise<string[]> {
  const ids = await client.fetch<string[] | null>(
    `*[_type == "course" && _id == $courseId][0].modules[]->lessons[]._ref`,
    { courseId }
  );
  return ids?.filter(Boolean) ?? [];
}

export async function getAllLessonCommentsAdmin(opts: {
  courseId?: string;
  lessonId?: string;
  studentId?: string;
  limit?: number;
}): Promise<AdminCommentRow[]> {
  const lim = Math.min(Math.max(opts.limit ?? 80, 1), 200);

  const base = `*[_type == "lessonComment"`;

  if (opts.lessonId && opts.studentId) {
    return client.fetch(
      `${base} && lesson._ref == $lessonId && student._ref == $studentId] | order(createdAt desc) [0...${lim}] ${projection}`,
      { lessonId: opts.lessonId, studentId: opts.studentId }
    );
  }

  if (opts.lessonId) {
    return client.fetch(
      `${base} && lesson._ref == $lessonId] | order(createdAt desc) [0...${lim}] ${projection}`,
      { lessonId: opts.lessonId }
    );
  }

  if (opts.courseId && opts.studentId) {
    const lessonIds = await getLessonIdsForCourse(opts.courseId);
    if (lessonIds.length === 0) return [];
    return client.fetch(
      `${base} && lesson._ref in $lessonIds && student._ref == $studentId] | order(createdAt desc) [0...${lim}] ${projection}`,
      { lessonIds, studentId: opts.studentId }
    );
  }

  if (opts.courseId) {
    const lessonIds = await getLessonIdsForCourse(opts.courseId);
    if (lessonIds.length === 0) return [];
    return client.fetch(
      `${base} && lesson._ref in $lessonIds] | order(createdAt desc) [0...${lim}] ${projection}`,
      { lessonIds }
    );
  }

  if (opts.studentId) {
    return client.fetch(
      `${base} && student._ref == $studentId] | order(createdAt desc) [0...${lim}] ${projection}`,
      { studentId: opts.studentId }
    );
  }

  return client.fetch(
    `${base}] | order(createdAt desc) [0...${lim}] ${projection}`
  );
}
