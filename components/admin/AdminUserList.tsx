"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
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

  async function handleRemove(userId: string, name: string) {
    if (!confirm(`Permanently delete ${name}'s account? This cannot be undone.`)) return;
    setRemoving(userId);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setRemoving(null);
    }
  }

  if (users.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No users with the admin role set via Clerk metadata. Users in the{" "}
        <code className="bg-muted px-1 rounded">ADMIN_EMAILS</code> env var still have access.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Image
                src={user.imageUrl}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-muted-foreground text-xs">{user.email}</p>
              </div>
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">Admin</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">
                Joined {user.createdAt}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => handleRemove(user.id, user.name)}
                disabled={removing === user.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
