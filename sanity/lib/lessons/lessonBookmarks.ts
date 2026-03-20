import groq from "groq";
import { client } from "../adminClient";
import { sanityFetch } from "../live";
import { getStudentByClerkId } from "../student/getStudentByClerkId";

export interface LessonBookmark {
  _id: string;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  createdAt: string;
}

export async function isLessonBookmarked(
  lessonId: string,
  clerkId: string
): Promise<boolean> {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) return false;

  const result = await sanityFetch({
    query: groq`count(*[_type == "lessonBookmark" && student._ref == $studentId && lesson._ref == $lessonId]) > 0`,
    params: { studentId: student._id, lessonId },
  });

  return !!result.data;
}

export async function toggleLessonBookmark(
  lessonId: string,
  courseId: string,
  clerkId: string
): Promise<boolean> {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) throw new Error("Student not found");

  const existing = await sanityFetch({
    query: groq`*[_type == "lessonBookmark" && student._ref == $studentId && lesson._ref == $lessonId][0]._id`,
    params: { studentId: student._id, lessonId },
  });

  if (existing.data) {
    await client.delete(existing.data as string);
    return false;
  }

  await client.create({
    _type: "lessonBookmark",
    student: { _type: "reference", _ref: student._id },
    lesson: { _type: "reference", _ref: lessonId },
    course: { _type: "reference", _ref: courseId },
    createdAt: new Date().toISOString(),
  });

  return true;
}

export async function getStudentBookmarks(
  clerkId: string
): Promise<LessonBookmark[]> {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) return [];

  const result = await sanityFetch({
    query: groq`*[_type == "lessonBookmark" && student._ref == $studentId] | order(createdAt desc) {
      _id,
      "lessonId": lesson._ref,
      "lessonTitle": lesson->title,
      "courseId": course._ref,
      "courseTitle": course->title,
      createdAt
    }`,
    params: { studentId: student._id },
  });

  return (result.data as LessonBookmark[]) || [];
}
