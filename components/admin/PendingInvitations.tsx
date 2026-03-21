"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Ban } from "lucide-react";

export type PendingInvitationRow = {
  id: string;
  emailAddress: string;
  createdAt: number;
  /** true if this invite was created with admin metadata */
  isAdminInvite: boolean;
};

export function PendingInvitations({ invitations }: { invitations: PendingInvitationRow[] }) {
  const router = useRouter();
  const [revoking, setRevoking] = useState<string | null>(null);

  async function revoke(id: string) {
    if (!confirm("Revoke this invitation? The link in the email will stop working.")) return;
    setRevoking(id);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to revoke");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke");
    } finally {
      setRevoking(null);
    }
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Pending invitations
          </CardTitle>
          <CardDescription>No pending invitations right now.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Pending invitations
        </CardTitle>
        <CardDescription>
          Invitations that haven&apos;t been accepted yet. Admin invites include the admin role when the
          user completes sign-up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-border px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{inv.emailAddress}</p>
              <p className="text-xs text-muted-foreground">
                Sent {new Date(inv.createdAt).toLocaleString()}
                {inv.isAdminInvite && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                    Admin role
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => revoke(inv.id)}
              disabled={revoking === inv.id}
            >
              <Ban className="h-3.5 w-3.5 mr-1.5" />
              {revoking === inv.id ? "Revoking…" : "Revoke"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
