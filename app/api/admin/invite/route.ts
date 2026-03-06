import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { checkAdminAccess } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const client = await clerkClient();

  // Check if user already exists in Clerk
  const existingUsers = await client.users.getUserList({ emailAddress: [email] });

  if (existingUsers.totalCount > 0) {
    // User exists — promote them to admin directly
    const user = existingUsers.data[0];
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: { role: "admin" },
    });
    return NextResponse.json({ message: "User promoted to admin successfully." });
  }

  // User doesn't exist — send a Clerk invitation with admin role pre-set
  try {
    await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role: "admin" },
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/sign-up`,
    });
  } catch (err: unknown) {
    const clerkError = err as { errors?: { message: string; longMessage?: string }[] };
    const message =
      clerkError?.errors?.[0]?.longMessage ||
      clerkError?.errors?.[0]?.message ||
      "Failed to send invitation. Check that invitations are enabled in your Clerk dashboard.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ message: "Invitation sent successfully." });
}

export async function DELETE(req: NextRequest) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  // Prevent self-deletion
  if (userId === auth.userId) {
    return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch (err: unknown) {
    const clerkError = err as { errors?: { message: string }[] };
    const message = clerkError?.errors?.[0]?.message || "Failed to delete user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ message: "User deleted successfully." });
}
