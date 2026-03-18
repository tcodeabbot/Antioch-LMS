import { createClient } from "next-sanity";

const noCdnClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-07-05",
  useCdn: false,
});

/**
 * Middleware-safe version of getStudentByClerkId.
 * Bypasses the CDN so onboarding status is always fresh.
 */
export async function getStudentByClerkIdForMiddleware(clerkId: string) {
  const student = await noCdnClient.fetch(
    `*[_type == "student" && clerkId == $clerkId][0]`,
    { clerkId }
  );

  return student;
}
