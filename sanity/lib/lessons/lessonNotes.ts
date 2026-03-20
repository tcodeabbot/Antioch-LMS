import groq from "groq";
import { client } from "../adminClient";
import { sanityFetch } from "../live";
import { getStudentByClerkId } from "../student/getStudentByClerkId";

export async function getLessonNote(lessonId: string, clerkId: string) {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) return null;

  const result = await sanityFetch({
    query: groq`*[_type == "lessonNote" && student._ref == $studentId && lesson._ref == $lessonId][0]{
      _id,
      content,
      updatedAt
    }`,
    params: { studentId: student._id, lessonId },
  });

  return result.data;
}

export async function saveLessonNote(
  lessonId: string,
  clerkId: string,
  content: string
) {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) throw new Error("Student not found");

  const existing = await sanityFetch({
    query: groq`*[_type == "lessonNote" && student._ref == $studentId && lesson._ref == $lessonId][0]._id`,
    params: { studentId: student._id, lessonId },
  });

  const now = new Date().toISOString();

  if (existing.data) {
    return client.patch(existing.data).set({ content, updatedAt: now }).commit();
  }

  return client.create({
    _type: "lessonNote",
    student: { _type: "reference", _ref: student._id },
    lesson: { _type: "reference", _ref: lessonId },
    content,
    updatedAt: now,
  });
}
