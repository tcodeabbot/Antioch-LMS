import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getCourseStats() {
  const getCourseStatsQuery = defineQuery(`{
    "courses": *[_type == "course"] | order(_createdAt desc) {
      _id,
      title,
      "slug": slug.current,
      price,
      isFree,
      publicationStatus,
      description,
      _createdAt,
      "category": category->{title},
      "instructor": instructor->{name},
      "enrollmentCount": count(*[_type == "enrollment" && course._ref == ^._id]),
      "totalRevenue": math::sum(*[_type == "enrollment" && course._ref == ^._id].amount),
      "modules": modules[]-> {
        order,
        title,
        "lessonCount": count(lessons[]->),
        "lessons": lessons[]-> {
          _id,
          description,
          videoUrl,
          loomUrl,
          "quizQuestionCount": count(quizQuestions)
        }
      }
    },
    "totalCourses": count(*[_type == "course"]),
    "totalEnrollments": count(*[_type == "enrollment"]),
    "totalRevenue": math::sum(*[_type == "enrollment"].amount),
    "totalStudents": count(*[_type == "student"])
  }`);

  const result = await sanityFetch({
    query: getCourseStatsQuery,
  });

  return result?.data || {
    courses: [],
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    totalStudents: 0,
  };
}

