import { defineQuery } from "groq";
import { sanityFetch } from "../live";
import { clerkClient } from "@clerk/nextjs/server";

export async function getCourseDetails(courseId: string) {
  // Get course details with enrollments
  const courseDetailsQuery = defineQuery(`*[_type == "course" && _id == $courseId][0] {
    _id,
    title,
    description,
    price,
    isFree,
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
        order
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

  // Filter out enrollments from deleted Clerk users
  const validEnrollments = await Promise.all(
    (course.enrollments || []).map(async (enrollment: any) => {
      try {
        const client = await clerkClient();
        await client.users.getUser(enrollment.student.clerkId);
        return enrollment;
      } catch (error) {
        return null;
      }
    })
  );

  const filteredEnrollments = validEnrollments.filter(
    (enrollment) => enrollment !== null
  );

  // Calculate stats
  const totalEnrollments = filteredEnrollments.length;
  const totalRevenue = filteredEnrollments.reduce(
    (sum: number, enrollment: any) => sum + (enrollment.amount || 0),
    0
  );

  // Get completion data
  const completionQuery = defineQuery(`{
    "totalLessons": count(*[_type == "lesson" && references($courseId)]),
    "completions": *[_type == "lessonCompletion" && course._ref == $courseId] {
      "studentId": student._ref,
      "lessonId": lesson._ref
    }
  }`);

  const completionResult = await sanityFetch({
    query: completionQuery,
    params: { courseId },
  });

  const completionData = completionResult?.data || {
    totalLessons: 0,
    completions: [],
  };

  // Calculate average completion rate
  const studentCompletionMap = new Map();
  completionData.completions.forEach((completion: any) => {
    const count = studentCompletionMap.get(completion.studentId) || 0;
    studentCompletionMap.set(completion.studentId, count + 1);
  });

  const averageCompletionRate =
    totalEnrollments > 0
      ? Array.from(studentCompletionMap.values()).reduce(
          (sum: number, count: number) => sum + count,
          0
        ) /
        totalEnrollments /
        (completionData.totalLessons || 1)
      : 0;

  return {
    ...course,
    enrollments: filteredEnrollments,
    stats: {
      totalEnrollments,
      totalRevenue,
      totalLessons: completionData.totalLessons,
      averageCompletionRate: Math.round(averageCompletionRate * 100),
      totalModules: course.modules?.length || 0,
    },
  };
}
