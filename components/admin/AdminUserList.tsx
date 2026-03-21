"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  createdAt: string;
}

export function AdminUserList({ users }: { users: AdminUser[] }) {
  const [removing, setRemoving] = useState<string | null>(null);
  const router = useRouter();

  async function handleRemoveFromTeam(userId: string, name: string) {
    if (
      !confirm(
        `Remove admin access for ${name}? They will keep their learner account and enrollments.`
      )
    )
      return;
    setRemoving(userId);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Request failed");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setRemoving(null);
    }
  }

  if (users.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No users with <code className="bg-muted px-1 rounded">publicMetadata.role === &quot;admin&quot;</code>{" "}
        yet. Invite someone above, or set the role in the Clerk dashboard.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3 min-w-0">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                  {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-muted-foreground text-xs truncate">{user.email}</p>
              </div>
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium shrink-0">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground hidden sm:block">Joined {user.createdAt}</span>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => handleRemoveFromTeam(user.id, user.name)}
                disabled={removing === user.id}
              >
                <UserMinus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
