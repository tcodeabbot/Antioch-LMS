import { currentUser } from "@clerk/nextjs/server";

/**
 * Check if the current user is an administrator
 * Uses Clerk's publicMetadata to check for admin role
 * You can also use environment variables to define admin emails
 */
export async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  
  if (!user) {
    return false;
  }

  // Check if user has admin role in publicMetadata
  const isAdminRole = user.publicMetadata?.role === "admin";
  
  // Alternatively, check against admin emails from environment variable
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(email => email.trim()) || [];
  const isAdminEmail = adminEmails.includes(user.emailAddresses[0]?.emailAddress || "");

  return isAdminRole || isAdminEmail;
}

/**
 * Get admin authorization result
 */
export async function checkAdminAccess() {
  const user = await currentUser();
  
  if (!user) {
    return {
      isAuthorized: false,
      redirect: "/sign-in",
    };
  }

  const admin = await isAdmin();
  
  if (!admin) {
    return {
      isAuthorized: false,
      redirect: "/dashboard",
    };
  }

  return {
    isAuthorized: true,
    userId: user.id,
  };
}

