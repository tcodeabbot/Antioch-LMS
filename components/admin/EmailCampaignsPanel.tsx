"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Send, FlaskConical, Users } from "lucide-react";
import type { EmailTemplateListItem } from "@/sanity/lib/admin/getEmailTemplates";
import {
  sendTestEmailAction,
  sendCampaignToEmailsAction,
  sendCampaignToStudentIdsAction,
} from "@/app/actions/emailCampaignActions";

const PLACEHOLDERS = `
{{firstName}}  {{lastName}}  {{email}}  {{siteUrl}}  {{dashboardUrl}}
`.trim();

export function EmailCampaignsPanel({ templates }: { templates: EmailTemplateListItem[] }) {
  const [templateId, setTemplateId] = useState<string>(templates[0]?._id ?? "");
  const [testTo, setTestTo] = useState("");
  const [emailList, setEmailList] = useState("");
  const [studentIds, setStudentIds] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function run(
    key: string,
    fn: () => Promise<{ success: boolean; error?: string; message?: string; errors?: string[] }>
  ) {
    setLoading(key);
    setMessage(null);
    try {
      const r = await fn();
      if (!r.success) {
        setMessage({ type: "err", text: r.error || "Failed" });
        return;
      }
      const extra =
        r.errors?.length && r.errors.length > 0
          ? ` Errors: ${r.errors.join("; ")}`
          : "";
      setMessage({
        type: "ok",
        text: (r.message || "Done.") + extra,
      });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(null);
    }
  }

  const active = templates.find((t) => t._id === templateId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            Offers & email campaigns
          </CardTitle>
          <CardDescription>
            Templates live in{" "}
            <Link href="/studio" className="text-primary underline-offset-2 hover:underline">
              Sanity
            </Link>{" "}
            under <strong>Email templates</strong>. Messages are sent with{" "}
            <strong>Resend</strong> using <strong>HTML</strong> for the design and an automatic{" "}
            <strong>plain-text</strong> part (or your custom plain text) so clients that
            don&apos;t render HTML still get a readable message.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Should emails be HTML?</strong> Yes—use HTML for
            layout, buttons, and branding. Always keep a sensible plain-text fallback (we generate
            one from HTML if you leave it blank). Avoid pasting untrusted HTML from the web.
          </p>
          <p className="font-mono text-xs bg-muted/60 rounded-md p-2">{PLACEHOLDERS}</p>
          <p>
            Set <code className="bg-muted px-1 rounded text-xs">RESEND_API_KEY</code>, and optionally{" "}
            <code className="bg-muted px-1 rounded text-xs">RESEND_CAMPAIGN_FROM</code> or{" "}
            <code className="bg-muted px-1 rounded text-xs">DIGEST_FROM_EMAIL</code> (verified sender
            in Resend).
          </p>
        </CardContent>
      </Card>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            No email templates yet. Open{" "}
            <Link href="/studio" className="text-primary underline-offset-2 hover:underline">
              Studio
            </Link>{" "}
            → create an <strong>Email template</strong> (subject + HTML body).
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Choose template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name} {!t.active ? "(inactive)" : ""} — {t.category || "other"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {active && (
                <p className="text-xs text-muted-foreground">
                  Subject: <span className="font-medium text-foreground">{active.subject}</span>
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="h-4 w-4" />
                Send test email
              </CardTitle>
              <CardDescription>
                Sends to one address with sample first/last name &quot;Test User&quot; so you can
                verify layout in your inbox.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3 sm:items-end max-w-xl">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="test-to">Your email</Label>
                <Input
                  id="test-to"
                  type="email"
                  placeholder="you@example.com"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                />
              </div>
              <Button
                type="button"
                disabled={loading === "test" || !templateId || !testTo.trim()}
                onClick={() =>
                  run("test", () => sendTestEmailAction(templateId, testTo.trim()))
                }
              >
                {loading === "test" ? "Sending…" : "Send test"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="h-4 w-4" />
                Send to addresses
              </CardTitle>
              <CardDescription>
                Comma or line-separated emails. First name is guessed from the local part of the
                address for <code className="text-xs bg-muted px-1 rounded">{"{{firstName}}"}</code>{" "}
                (best for quick blasts; use student IDs for personalization).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-w-2xl">
              <textarea
                className="w-full min-h-[140px] rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={"email1@example.com\nemail2@example.com"}
                rows={6}
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={loading === "emails" || !templateId}
                onClick={() => run("emails", () => sendCampaignToEmailsAction(templateId, emailList))}
              >
                {loading === "emails" ? "Sending…" : "Send campaign"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Send to students by Sanity ID
              </CardTitle>
              <CardDescription>
                Paste <code className="text-xs bg-muted px-1 rounded">student</code> document IDs
                (from Admin → Students or Studio). Uses each student&apos;s first name, last name,
                and email from Sanity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-w-2xl">
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="studentId1 studentId2"
                rows={4}
                value={studentIds}
                onChange={(e) => setStudentIds(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={loading === "students" || !templateId}
                onClick={() =>
                  run("students", () => sendCampaignToStudentIdsAction(templateId, studentIds))
                }
              >
                {loading === "students" ? "Sending…" : "Send to students"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {message && (
        <p
          className={`text-sm rounded-md border px-3 py-2 ${
            message.type === "ok"
              ? "border-green-500/40 bg-green-500/10 text-green-800 dark:text-green-200"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
