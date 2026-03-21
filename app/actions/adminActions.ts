"use server";

import { client } from "@/sanity/lib/adminClient";
import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "groq";
import { checkAdminAccess } from "@/lib/adminAuth";

export async function manualEnrollStudentAction(
  studentId: string,
  courseId: string
) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Verify student exists
    const studentResult = await sanityFetch({
      query: defineQuery(
        `*[_type == "student" && _id == $studentId][0]{ _id }`
      ),
      params: { studentId },
    });
    if (!studentResult.data?._id) {
      return { success: false, error: "Student not found" };
    }

    // Verify course exists
    const courseResult = await sanityFetch({
      query: defineQuery(
        `*[_type == "course" && _id == $courseId][0]{ _id, title }`
      ),
      params: { courseId },
    });
    if (!courseResult.data?._id) {
      return { success: false, error: "Course not found" };
    }

    // Check not already enrolled
    const existingResult = await sanityFetch({
      query: defineQuery(
        `count(*[_type == "enrollment" && student._ref == $studentId && course._ref == $courseId])`
      ),
      params: { studentId, courseId },
    });
    if ((existingResult.data as number) > 0) {
      return { success: false, error: "Student is already enrolled in this course" };
    }

    await client.create({
      _type: "enrollment",
      student: { _type: "reference", _ref: studentId },
      course: { _type: "reference", _ref: courseId },
      amount: 0,
      paymentId: `manual-admin-${Date.now()}`,
      enrolledAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error manually enrolling student:", error);
    return { success: false, error: "Failed to enroll student" };
  }
}

export async function getUnenrolledCoursesAction(studentId: string) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return { success: false, data: [] };
  }

  try {
    const result = await sanityFetch({
      query: defineQuery(`*[_type == "course" && !(_id in *[_type == "enrollment" && student._ref == $studentId].course._ref)] | order(title asc) {
        _id,
        title,
        "category": category->{title, name}
      }`),
      params: { studentId },
    });

    return { success: true, data: result.data || [] };
  } catch (error) {
    console.error("Error fetching unenrolled courses:", error);
    return { success: false, data: [] };
  }
}
