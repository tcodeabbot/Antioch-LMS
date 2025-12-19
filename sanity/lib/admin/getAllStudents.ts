import { defineQuery } from "groq";
import { sanityFetch } from "../live";
import { clerkClient } from "@clerk/nextjs/server";

export async function getAllStudents() {
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

  // Filter out students whose Clerk accounts no longer exist
  const validStudents = await Promise.all(
    students.map(async (student: any) => {
      try {
        // Verify the Clerk user still exists
        const client = await clerkClient();
        await client.users.getUser(student.clerkId);
        return student;
      } catch (error) {
        // If user not found in Clerk, return null to filter out
        console.log(`Student ${student.email} (${student.clerkId}) has no active Clerk account`);
        return null;
      }
    })
  );

  // Filter out null values (orphaned students)
  return validStudents.filter((student) => student !== null);
}

