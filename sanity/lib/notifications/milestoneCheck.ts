import groq from "groq";
import { sanityFetch } from "../live";
import { getStudentByClerkId } from "../student/getStudentByClerkId";
import { getLearningStreak } from "../student/getLearningStreak";
import {
  notifyStreakMilestone,
  notifyCourseCompleted,
} from "./notifications";

export async function checkAndNotifyMilestones(clerkId: string) {
  const student = await getStudentByClerkId(clerkId);
  if (!student?._id) return;

  const [streakData, courseData] = await Promise.all([
    getLearningStreak(clerkId),
    checkCourseCompletions(student._id),
  ]);

  if (streakData.currentStreak > 0) {
    await notifyStreakMilestone(student._id, streakData.currentStreak);
  }

  for (const course of courseData) {
    if (course.justCompleted) {
      await notifyCourseCompleted(
        student._id,
        course.courseTitle,
        course.courseId
      );
    }
  }
}

async function checkCourseCompletions(studentId: string) {
  const result = await sanityFetch({
    query: groq`*[_type == "enrollment" && student._ref == $studentId]{
      "courseId": course._ref,
      "courseTitle": course->title,
      "totalLessons": count(course->modules[]->lessons[]),
      "completedLessons": count(*[_type == "lessonCompletion" && student._ref == $studentId && course._ref == ^.course._ref]),
      "alreadyNotified": count(*[_type == "notification" && student._ref == $studentId && type == "course_completed" && link match ^.course._ref]) > 0
    }`,
    params: { studentId },
  });

  const courses = (result.data || []) as Array<{
    courseId: string;
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    alreadyNotified: boolean;
  }>;

  return courses.map((c) => ({
    ...c,
    justCompleted:
      c.totalLessons > 0 &&
      c.completedLessons >= c.totalLessons &&
      !c.alreadyNotified,
  }));
}
