"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

function parseErrorPayload(data: unknown): string {
  if (data && typeof data === "object" && "error" in data) {
    const e = (data as { error: unknown }).error;
    if (typeof e === "string") return e;
    if (e && typeof e === "object" && "message" in e && typeof (e as { message: string }).message === "string") {
      return (e as { message: string }).message;
    }
  }
  return "Something went wrong.";
}

export function InviteAdminForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      let data: unknown = {};
      try {
        data = await res.json();
      } catch {
        /* non-JSON */
      }
      if (!res.ok) throw new Error(parseErrorPayload(data));
      setStatus("success");
      setMessage(
        typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : "Done."
      );
      setEmail("");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite administrator
        </CardTitle>
        <CardDescription>
          Existing accounts are promoted immediately. New emails receive a Clerk invitation with the admin
          role applied when they finish sign-up.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={status === "loading"} className="shrink-0">
            {status === "loading" ? "Sending…" : "Send invite"}
          </Button>
        </form>
        {message && (
          <p
            className={`mt-3 text-sm ${status === "success" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
          >
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
