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
  await client.invitations.createInvitation({
    emailAddress: email,
    publicMetadata: { role: "admin" },
    redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/sign-up`,
  });

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

  // Prevent self-demotion
  if (userId === auth.userId) {
    return NextResponse.json({ error: "You cannot remove your own admin access." }, { status: 400 });
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: null },
  });

  return NextResponse.json({ message: "Admin access revoked." });
}
