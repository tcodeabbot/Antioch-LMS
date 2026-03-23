import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/adminAuth";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";

/**
 * Post sign-in / sign-up redirect from Clerk (`forceRedirectUrl`).
 * Sends new learners to onboarding before they hit the dashboard.
 */
export default async function AuthRedirectPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (await isAdmin()) {
    redirect("/admin");
  }

  let onboardingDone = false;
  try {
    const student = await getStudentByClerkId(user.id);
    onboardingDone = student?.onboardingCompleted === true;
  } catch {
    // If Sanity is unreachable, send user to onboarding (safe default)
    redirect("/onboarding");
  }

  if (!onboardingDone) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
