"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Link2,
  Copy,
  Check,
  Megaphone,
  Mail,
  Share2,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { EmailCampaignsPanel } from "@/components/admin/EmailCampaignsPanel";
import type { EmailTemplateListItem } from "@/sanity/lib/admin/getEmailTemplates";

export type MarketingCourseOption = {
  _id: string;
  title: string;
  slug: string;
};

function CopyField({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <Input readOnly value={value} className="font-mono text-xs" />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function MarketingHub({
  courses,
  siteUrl,
  templates,
}: {
  courses: MarketingCourseOption[];
  siteUrl: string;
  templates: EmailTemplateListItem[];
}) {
  const [tab, setTab] = useState<"links" | "offers">("links");
  const base = siteUrl.replace(/\/$/, "");
  const [selectedId, setSelectedId] = useState<string>(courses[0]?._id ?? "");

  const selected = useMemo(
    () => courses.find((c) => c._id === selectedId) ?? courses[0],
    [courses, selectedId]
  );

  const courseUrl = selected ? `${base}/courses/${selected.slug}` : "";
  const shareLine = selected
    ? `Check out "${selected.title}" on Antioch LMS — ${courseUrl}`
    : "";

  const mailto = selected
    ? `mailto:?subject=${encodeURIComponent(`Course: ${selected.title}`)}&body=${encodeURIComponent(shareLine)}`
    : "";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="h-8 w-8 text-primary" />
          Marketing
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Share links, run offers, and send templated emails to learners.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setTab("links")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-md border-b-2 -mb-px transition-colors",
            tab === "links"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Links & sharing
        </button>
        <button
          type="button"
          onClick={() => setTab("offers")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-md border-b-2 -mb-px transition-colors",
            tab === "offers"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Offers & email
        </button>
      </div>

      {tab === "offers" ? (
        <EmailCampaignsPanel templates={templates} />
      ) : (
        <>
      {/* Quick links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5" />
            Site & conversion links
          </CardTitle>
          <CardDescription>
            URLs you’ll use in emails, social posts, and ads. Edit site copy in{" "}
            <Link href="/studio" className="text-primary underline-offset-2 hover:underline">
              Sanity Studio
            </Link>
            . Set{" "}
            <code className="bg-muted px-1 rounded text-xs">NEXT_PUBLIC_BASE_URL</code> in production so
            these match your domain.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <CopyField
            label="Homepage"
            value={`${base}/`}
            hint="Hero + course explorer; main entry for ads and social."
          />
          <CopyField
            label="Learner dashboard"
            value={`${base}/dashboard`}
            hint="Use in “Continue learning” emails (requires sign-in)."
          />
          <CopyField label="Sign up" value={`${base}/sign-up`} hint="New accounts" />
          <CopyField label="Sign in" value={`${base}/sign-in`} hint="Returning learners" />
        </CardContent>
      </Card>

      {/* Share a course */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5" />
            Share a course
          </CardTitle>
          <CardDescription>
            Pick a published course and copy its public URL or a ready-made one-liner for social and
            email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No courses in Sanity yet. Add courses in Studio, then return here to grab links.
            </p>
          ) : (
            <>
              <div className="space-y-2 max-w-md">
                <Label>Course</Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CopyField
                label="Public course URL"
                value={courseUrl}
                hint="Use in link-in-bio, newsletters, and paid ads."
              />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Suggested share text</Label>
                <textarea
                  readOnly
                  className="w-full min-h-[72px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={shareLine}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={async () => {
                      await navigator.clipboard.writeText(shareLine);
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy text
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="gap-1.5" asChild>
                    <a href={mailto}>
                      <Mail className="h-3.5 w-3.5" />
                      Open in email
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* What to build next */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Ideas for this tab (pick what fits your goals)
          </CardTitle>
          <CardDescription>
            Nothing here is required—these are common next steps when you&apos;re ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Coupons & limited offers</p>
                <p className="text-muted-foreground">
                  Stripe Promotion Codes or native &quot;free weekend&quot; rules, surfaced on the course
                  page and in checkout.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">UTM link builder</p>
                <p className="text-muted-foreground">
                  Append <code className="bg-muted px-1 rounded text-xs">utm_source</code>,{" "}
                  <code className="bg-muted px-1 rounded text-xs">utm_campaign</code> to any URL and store
                  them for reporting (often with GA4 or Plausible).
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Homepage hero & featured courses</p>
                <p className="text-muted-foreground">
                  Curate which courses appear above the fold—usually a Sanity document or site settings,
                  not hard-coded.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Referrals & partner tracking</p>
                <p className="text-muted-foreground">
                  Unique referral codes per church/partner, with simple dashboards for signups attributed
                  to each link.
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}
