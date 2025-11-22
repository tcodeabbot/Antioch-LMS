import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getAllStudents() {
  const getAllStudentsQuery = defineQuery(`*[_type == "student"] | order(_createdAt desc) {
    _id,
    firstName,
    lastName,
    email,
    clerkId,
    imageUrl,
    _createdAt,
    "enrollmentCount": count(*[_type == "enrollment" && student._ref == ^._id]),
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

  return result?.data || [];
}

