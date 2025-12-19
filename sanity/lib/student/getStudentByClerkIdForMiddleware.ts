import { client } from "../client";

/**
 * Middleware-safe version of getStudentByClerkId
 * Uses the client directly to avoid draft mode issues in middleware
 */
export async function getStudentByClerkIdForMiddleware(clerkId: string) {
  const student = await client.fetch(
    `*[_type == "student" && clerkId == $clerkId][0]`,
    { clerkId }
  );

  return student;
}
