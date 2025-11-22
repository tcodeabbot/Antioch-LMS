import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getCourseStats() {
  // First, get all enrollments to calculate revenue
  const enrollmentsQuery = defineQuery(`*[_type == "enrollment"] {
    _id,
    amount,
    "courseId": course._ref
  }`);

  const enrollmentsResult = await sanityFetch({
    query: enrollmentsQuery,
  });

  const enrollments = enrollmentsResult?.data || [];

  // Get courses with enrollment counts
  const getCourseStatsQuery = defineQuery(`{
    "courses": *[_type == "course"] | order(_createdAt desc) {
      _id,
      title,
      "slug": slug.current,
      price,
      isFree,
      _createdAt,
      "category": category->{title},
      "instructor": instructor->{name},
      "enrollmentCount": count(*[_type == "enrollment" && course._ref == ^._id]),
      "modules": modules[]-> {
        "lessonCount": count(lessons[]->)
      }
    },
    "totalCourses": count(*[_type == "course"]),
    "totalEnrollments": count(*[_type == "enrollment"]),
    "totalStudents": count(*[_type == "student"])
  }`);

  const result = await sanityFetch({
    query: getCourseStatsQuery,
  });

  const data = result?.data || {
    courses: [],
    totalCourses: 0,
    totalEnrollments: 0,
    totalStudents: 0,
  };

  // Calculate total revenue from all enrollments
  const totalRevenue = enrollments.reduce(
    (sum: number, enrollment: any) => sum + (enrollment.amount || 0),
    0
  );

  // Calculate revenue per course
  const coursesWithRevenue = (data.courses || []).map((course: any) => {
    const courseEnrollments = enrollments.filter(
      (enrollment: any) => enrollment.courseId === course._id
    );
    const courseRevenue = courseEnrollments.reduce(
      (sum: number, enrollment: any) => sum + (enrollment.amount || 0),
      0
    );

    return {
      ...course,
      totalRevenue: courseRevenue,
    };
  });

  return {
    ...data,
    courses: coursesWithRevenue,
    totalRevenue,
  };
}

