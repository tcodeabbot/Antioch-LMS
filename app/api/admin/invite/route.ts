import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getAppBaseUrlFromRequest } from "@/lib/getAppBaseUrl";

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function clerkErrMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as {
      errors?: { message?: string; longMessage?: string }[];
      message?: string;
    };
    if (e.errors?.[0]?.longMessage) return e.errors[0].longMessage;
    if (e.errors?.[0]?.message) return e.errors[0].message;
    if (e.message) return e.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

export async function POST(req: NextRequest) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = normalizeEmail(body.email || "");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const client = await clerkClient();

  const existingUsers = await client.users.getUserList({
    emailAddress: [email],
    limit: 5,
  });

  if (existingUsers.totalCount > 0) {
    const user = existingUsers.data[0];
    const prevMeta = (user.publicMetadata || {}) as Record<string, unknown>;
    try {
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
          ...prevMeta,
          role: "admin",
        },
      });
    } catch (err) {
      return NextResponse.json({ error: clerkErrMessage(err) }, { status: 400 });
    }
    return NextResponse.json({
      message: "User promoted to admin successfully. They may need to sign out and back in to see admin access.",
    });
  }

  const baseUrl = getAppBaseUrlFromRequest(req);
  const redirectUrl = `${baseUrl}/sign-up`;

  try {
    await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role: "admin" },
      redirectUrl,
    });
  } catch (err: unknown) {
    const message = clerkErrMessage(err);
    return NextResponse.json(
      {
        error:
          message ||
          "Failed to send invitation. Enable Invitations in Clerk Dashboard → User & Authentication → Email, Phone, Username → Invitations.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "Invitation sent. They will receive an email with a link to complete sign-up.",
  });
}

/** Remove admin role (user stays in Clerk as a learner) */
export async function PATCH(req: NextRequest) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId } = body;
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (userId === auth.userId) {
    return NextResponse.json({ error: "You cannot remove your own admin access." }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const prevMeta = (user.publicMetadata || {}) as Record<string, unknown>;
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...prevMeta,
        role: "user",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: clerkErrMessage(err) }, { status: 400 });
  }

  return NextResponse.json({
    message: "Admin access removed. They will lose admin access on their next session refresh.",
  });
}

/** Revoke a pending Clerk invitation */
export async function DELETE(req: NextRequest) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { invitationId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { invitationId } = body;
  if (!invitationId) {
    return NextResponse.json({ error: "invitationId is required" }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    await client.invitations.revokeInvitation(invitationId);
  } catch (err: unknown) {
    return NextResponse.json({ error: clerkErrMessage(err) }, { status: 400 });
  }

  return NextResponse.json({ message: "Invitation revoked." });
}
