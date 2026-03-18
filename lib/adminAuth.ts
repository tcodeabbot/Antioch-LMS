import { currentUser } from "@clerk/nextjs/server";

/**
 * Check if the current user is an administrator.
 * Reads `role` from Clerk publicMetadata (set via Dashboard or API).
 */
export async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;
  return user.publicMetadata?.role === "admin";
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

