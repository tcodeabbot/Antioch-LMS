import groq from "groq";
import { client } from "../adminClient";
import { sanityFetch } from "../live";
import { getStudentByClerkId } from "../student/getStudentByClerkId";

export interface LessonComment {
  _id: string;
  content: string;
  createdAt: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    imageUrl: string | null;
    clerkId: string;
  };
}

export async function getLessonComments(
  lessonId: string
): Promise<LessonComment[]> {
  const result = await sanityFetch({
    query: groq`*[_type == "lessonComment" && lesson._ref == $lessonId] | order(createdAt desc) {
      _id,
      content,
      createdAt,
      "student": student->{
        _id,
        firstName,
        lastName,
        imageUrl,
        clerkId
      }
    }`,
    params: { lessonId },
  });

  return (result.data as LessonComment[]) || [];
}

export async function createLessonComment(
  lessonId: string,
  clerkId: string,
  content: string
) {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) throw new Error("Student not found");

  return client.create({
    _type: "lessonComment",
    student: { _type: "reference", _ref: student._id },
    lesson: { _type: "reference", _ref: lessonId },
    content,
    createdAt: new Date().toISOString(),
  });
}

export async function deleteLessonComment(commentId: string, clerkId: string) {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) throw new Error("Student not found");

  const comment = await sanityFetch({
    query: groq`*[_type == "lessonComment" && _id == $commentId][0]{
      "studentRef": student._ref
    }`,
    params: { commentId },
  });

  if (comment.data?.studentRef !== student._id) {
    throw new Error("Not authorized to delete this comment");
  }

  return client.delete(commentId);
}
