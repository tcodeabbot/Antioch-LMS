import { clerkClient } from "@clerk/nextjs/server";
import { InviteAdminForm } from "@/components/admin/InviteAdminForm";
import { AdminUserList } from "@/components/admin/AdminUserList";

async function getAdminUsers() {
  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({ limit: 200 });
  return users.filter((u) => u.publicMetadata?.role === "admin");
}

export default async function TeamPage() {
  const adminUsers = await getAdminUsers();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Team Management</h1>
        <p className="text-muted-foreground mt-1">
          Invite administrators and manage team access.
        </p>
      </div>

      <InviteAdminForm />

      <div>
        <h2 className="text-lg font-semibold mb-4">Current Administrators</h2>
        <AdminUserList users={adminUsers.map((u) => ({
          id: u.id,
          name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "No name",
          email: u.emailAddresses[0]?.emailAddress ?? "",
          imageUrl: u.imageUrl,
          createdAt: new Date(u.createdAt).toLocaleDateString(),
        }))} />
      </div>
    </div>
  );
}
