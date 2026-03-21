import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getStudentDetails(studentId: string) {
  const query = defineQuery(`{
    "student": *[_type == "student" && _id == $studentId][0] {
      _id,
      firstName,
      lastName,
      email,
      clerkId,
      imageUrl,
      phone,
      address,
      onboardingCompleted,
      _createdAt
    },
    "enrollments": *[_type == "enrollment" && student._ref == $studentId] | order(enrolledAt desc) {
      _id,
      enrolledAt,
      amount,
      paymentId,
      "course": course-> {
        _id,
        title,
        "slug": slug.current,
        "category": category->{title, name},
        "totalLessons": count(modules[]->lessons[]->,),
        "modules": modules[]-> {
          _id,
          title,
          "lessons": lessons[]-> { _id, title }
        }
      }
    },
    "lessonCompletions": *[_type == "lessonCompletion" && student._ref == $studentId] {
      _id,
      completedAt,
      "lessonId": lesson._ref,
      "courseId": course._ref
    },
    "studySessions": *[_type == "studySession" && student._ref == $studentId] | order(startedAt desc) [0...20] {
      _id,
      durationSeconds,
      startedAt,
      "lessonTitle": lesson->title,
      "courseTitle": course->title
    },
    "totalStudySeconds": math::sum(*[_type == "studySession" && student._ref == $studentId].durationSeconds),
    "quizAttempts": *[_type == "quizAttempt" && student._ref == $studentId] | order(completedAt desc) [0...20] {
      _id,
      score,
      passed,
      completedAt,
      "lessonTitle": lesson->title
    },
    "commentCount": count(*[_type == "lessonComment" && student._ref == $studentId]),
    "recentComments": *[_type == "lessonComment" && student._ref == $studentId] | order(createdAt desc) [0...10] {
      _id,
      content,
      createdAt,
      "lessonTitle": lesson->title,
      "courseTitle": lesson->^.^.title
    },
    "bookmarks": *[_type == "lessonBookmark" && student._ref == $studentId] | order(createdAt desc) {
      _id,
      createdAt,
      "lessonTitle": lesson->title,
      "courseTitle": course->title,
      "courseId": course._ref,
      "lessonId": lesson._ref
    }
  }`);

  const result = await sanityFetch({
    query,
    params: { studentId },
  });

  return result?.data || null;
}
