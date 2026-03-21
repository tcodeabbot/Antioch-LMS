import { clerkClient } from "@clerk/nextjs/server";
import { InviteAdminForm } from "@/components/admin/InviteAdminForm";
import { AdminUserList } from "@/components/admin/AdminUserList";
import { PendingInvitations, type PendingInvitationRow } from "@/components/admin/PendingInvitations";
import { Users } from "lucide-react";

async function getAdminUsers() {
  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({ limit: 200 });
  return users.filter((u) => u.publicMetadata?.role === "admin");
}

async function getPendingInvitations(): Promise<PendingInvitationRow[]> {
  const client = await clerkClient();
  const { data } = await client.invitations.getInvitationList({
    status: "pending",
    limit: 50,
  });
  return data.map((inv) => {
    const meta = inv.publicMetadata as { role?: string } | undefined;
    const created =
      typeof inv.createdAt === "number"
        ? inv.createdAt
        : new Date(inv.createdAt as unknown as string).getTime();
    return {
      id: inv.id,
      emailAddress: inv.emailAddress,
      createdAt: created,
      isAdminInvite: meta?.role === "admin",
    };
  });
}

export default async function TeamPage() {
  const [adminUsers, pendingInvites] = await Promise.all([
    getAdminUsers(),
    getPendingInvitations(),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Team
        </h1>
        <p className="text-muted-foreground mt-2">
          Invite administrators by email. Existing users are promoted immediately; new users get a Clerk
          invitation with admin access after they sign up.
        </p>
      </div>

      <div className="space-y-8">
        <InviteAdminForm />

        <PendingInvitations invitations={pendingInvites} />

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Current administrators</h2>
          <AdminUserList
            users={adminUsers.map((u) => ({
              id: u.id,
              name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "No name",
              email: u.emailAddresses[0]?.emailAddress ?? "",
              imageUrl: u.imageUrl,
              createdAt: new Date(u.createdAt).toLocaleDateString(),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
