"use server";

import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/adminClient";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";

interface OnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface StudentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  onboardingCompleted: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export async function submitOnboarding(data: OnboardingData) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if student already exists
    const existingStudent = await getStudentByClerkId(user.id);

    if (existingStudent && existingStudent.onboardingCompleted) {
      // Already onboarded, prevent re-submission
      return { success: true };
    }

    // Validate only required fields are present
    const requiredFields: (keyof OnboardingData)[] = [
      "firstName",
      "lastName",
      "email",
      "phone",
    ];

    for (const field of requiredFields) {
      if (!data[field]?.trim()) {
        return { success: false, error: `${field} is required` };
      }
    }

    // Check if any address fields are provided
    const hasAddress =
      data.street?.trim() ||
      data.city?.trim() ||
      data.state?.trim() ||
      data.postalCode?.trim() ||
      data.country?.trim();

    // Prepare the update/create data
    const studentData: StudentData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      onboardingCompleted: true,
    };

    // Only add address if at least one field is provided
    if (hasAddress) {
      studentData.address = {
        street: data.street || "",
        city: data.city || "",
        state: data.state || "",
        postalCode: data.postalCode || "",
        country: data.country || "",
      };
    }

    // Create or update student record
    if (existingStudent) {
      // Update existing student
      await client
        .patch(existingStudent._id)
        .set({
          ...studentData,
          imageUrl: user.imageUrl || existingStudent.imageUrl,
        })
        .commit();
    } else {
      // Create new student
      await client.create({
        _type: "student",
        clerkId: user.id,
        ...studentData,
        imageUrl: user.imageUrl || "",
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting onboarding:", error);
    return { success: false, error: "Failed to save onboarding data" };
  }
}
