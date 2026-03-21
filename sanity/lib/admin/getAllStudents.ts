import { defineQuery } from "groq";
import { sanityFetch } from "../live";
import { clerkClient } from "@clerk/nextjs/server";

export type EngagementLevel = "high" | "medium" | "low" | "inactive";

export interface StudentWithEngagement {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  clerkId: string;
  imageUrl?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  enrollmentCount: number;
  _createdAt: string;
  totalStudySeconds: number;
  completionCount: number;
  commentCount: number;
  lastActivityDate: string | null;
  engagement: EngagementLevel;
  enrollments?: any[];
}

function calculateEngagement(student: {
  totalStudySeconds: number;
  completionCount: number;
  commentCount: number;
  lastActivityDate: string | null;
  enrollmentCount: number;
}): EngagementLevel {
  if (student.enrollmentCount === 0) return "inactive";

  const daysSinceLastActivity = student.lastActivityDate
    ? Math.floor(
        (Date.now() - new Date(student.lastActivityDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 999;

  if (daysSinceLastActivity > 30) return "inactive";

  // Weighted score:  study time 30%, completions 30%, discussion 20%, recency 20%
  const studyScore = Math.min(student.totalStudySeconds / 3600, 10) / 10; // 0-1, capped at 10 hours
  const completionScore = Math.min(student.completionCount / 20, 1); // 0-1, capped at 20 completions
  const discussionScore = Math.min(student.commentCount / 10, 1); // 0-1, capped at 10 comments
  const recencyScore = Math.max(0, 1 - daysSinceLastActivity / 30); // 1 = today, 0 = 30+ days

  const score =
    studyScore * 0.3 +
    completionScore * 0.3 +
    discussionScore * 0.2 +
    recencyScore * 0.2;

  if (score >= 0.5) return "high";
  if (score >= 0.2) return "medium";
  return "low";
}

export async function getAllStudents(): Promise<StudentWithEngagement[]> {
  const getAllStudentsQuery = defineQuery(`*[_type == "student"] | order(_createdAt desc) {
    _id,
    firstName,
    lastName,
    email,
    clerkId,
    imageUrl,
    phone,
    address,
    _createdAt,
    "enrollmentCount": count(*[_type == "enrollment" && student._ref == ^._id]),
    "totalStudySeconds": math::sum(*[_type == "studySession" && student._ref == ^._id].durationSeconds),
    "completionCount": count(*[_type == "lessonCompletion" && student._ref == ^._id]),
    "commentCount": count(*[_type == "lessonComment" && student._ref == ^._id]),
    "lastActivityDate": *[
      _type in ["lessonCompletion", "studySession", "lessonComment", "quizAttempt"]
      && student._ref == ^._id
    ] | order(_createdAt desc) [0]._createdAt,
    "enrollments": *[_type == "enrollment" && student._ref == ^._id] {
      _id,
      enrolledAt,
      amount,
      "course": course-> {
        _id,
        title,
        "slug": slug.current
      }
    }
  }`);

  const result = await sanityFetch({
    query: getAllStudentsQuery,
  });

  const students = result?.data || [];

  const validStudents = await Promise.all(
    students.map(async (student: any) => {
      try {
        const client = await clerkClient();
        await client.users.getUser(student.clerkId);
        return {
          ...student,
          totalStudySeconds: student.totalStudySeconds || 0,
          completionCount: student.completionCount || 0,
          commentCount: student.commentCount || 0,
          engagement: calculateEngagement(student),
        } as StudentWithEngagement;
      } catch {
        return null;
      }
    })
  );

  return validStudents.filter(
    (student): student is StudentWithEngagement => student !== null
  );
}
