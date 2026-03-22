"use server";

import { Resend } from "resend";
import { client } from "@/sanity/lib/client";
import { checkAdminAccess } from "@/lib/adminAuth";
import {
  applyTemplateVars,
  getCampaignFromAddress,
  htmlToPlainText,
  wrapCampaignHtml,
  type TemplateVars,
} from "@/lib/email/templateRender";

const MAX_CAMPAIGN_RECIPIENTS = 100;

type EmailTemplateDoc = {
  _id: string;
  name: string;
  subject: string;
  htmlBody?: string;
  plainTextBody?: string;
};

async function fetchTemplate(id: string): Promise<EmailTemplateDoc | null> {
  return client.fetch(
    `*[_type == "emailTemplate" && _id == $id][0]{
      _id,
      name,
      subject,
      htmlBody,
      plainTextBody
    }`,
    { id }
  );
}

function buildVars(
  partial: Partial<TemplateVars> & Pick<TemplateVars, "siteUrl" | "dashboardUrl">
): TemplateVars {
  return {
    firstName: partial.firstName ?? "",
    lastName: partial.lastName ?? "",
    email: partial.email ?? "",
    siteUrl: partial.siteUrl,
    dashboardUrl: partial.dashboardUrl,
  };
}

async function sendTemplatedEmail(
  to: string,
  template: EmailTemplateDoc,
  vars: TemplateVars
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY is not set. Add it to send email." };
  }

  const subject = applyTemplateVars(template.subject, vars);
  const htmlRaw = template.htmlBody?.trim() ?? "";
  const plainRaw = template.plainTextBody?.trim() ?? "";

  if (!htmlRaw && !plainRaw) {
    return { ok: false, error: "Template has no HTML or plain text body." };
  }

  const htmlBodyRendered = htmlRaw ? applyTemplateVars(htmlRaw, vars) : "";
  const plainRendered = plainRaw
    ? applyTemplateVars(plainRaw, vars)
    : htmlRaw
      ? htmlToPlainText(htmlBodyRendered)
      : "";

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = getCampaignFromAddress();
  const siteUrl = vars.siteUrl;

  const htmlFinal = htmlBodyRendered
    ? wrapCampaignHtml(htmlBodyRendered, siteUrl.replace(/\/$/, ""))
    : undefined;

  try {
    await resend.emails.send({
      from,
      to,
      subject,
      ...(htmlFinal ? { html: htmlFinal } : {}),
      ...(plainRendered ? { text: plainRendered } : {}),
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Failed to send email";
    return { ok: false, error: msg };
  }
}

export async function sendTestEmailAction(templateId: string, toEmail: string) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return { success: false as const, error: "Unauthorized" };
  }

  const email = toEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false as const, error: "Enter a valid email address." };
  }

  const template = await fetchTemplate(templateId);
  if (!template) {
    return { success: false as const, error: "Template not found." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const dashboardUrl = `${siteUrl}/dashboard`;

  const vars = buildVars({
    firstName: "Test",
    lastName: "User",
    email,
    siteUrl,
    dashboardUrl,
  });

  const result = await sendTemplatedEmail(email, template, vars);
  if (!result.ok) {
    return { success: false as const, error: result.error };
  }

  return { success: true as const, message: `Test email sent to ${email}.` };
}

/** Send the same template to explicit email addresses (e.g. pasted list). Uses generic greeting. */
export async function sendCampaignToEmailsAction(templateId: string, rawEmails: string) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return { success: false as const, error: "Unauthorized" };
  }

  const template = await fetchTemplate(templateId);
  if (!template) {
    return { success: false as const, error: "Template not found." };
  }

  const parts = rawEmails
    .split(/[\s,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const unique = [...new Set(parts)].filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

  if (unique.length === 0) {
    return { success: false as const, error: "Add at least one valid email address." };
  }

  if (unique.length > MAX_CAMPAIGN_RECIPIENTS) {
    return {
      success: false as const,
      error: `Maximum ${MAX_CAMPAIGN_RECIPIENTS} recipients per send.`,
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const dashboardUrl = `${siteUrl}/dashboard`;

  let sent = 0;
  const errors: string[] = [];

  for (const email of unique) {
    const local = email.split("@")[0] ?? "Learner";
    const vars = buildVars({
      firstName: local.charAt(0).toUpperCase() + local.slice(1),
      lastName: "",
      email,
      siteUrl,
      dashboardUrl,
    });

    const result = await sendTemplatedEmail(email, template, vars);
    if (result.ok) sent += 1;
    else errors.push(`${email}: ${result.error}`);
  }

  return {
    success: true as const,
    sent,
    failed: errors.length,
    errors: errors.slice(0, 5),
    message: `Sent ${sent} of ${unique.length} email(s).`,
  };
}

/** Send to students by Sanity document IDs (uses first/last name from profile). */
export async function sendCampaignToStudentIdsAction(templateId: string, rawIds: string) {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    return { success: false as const, error: "Unauthorized" };
  }

  const template = await fetchTemplate(templateId);
  if (!template) {
    return { success: false as const, error: "Template not found." };
  }

  const ids = [...new Set(rawIds.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean))];
  if (ids.length === 0) {
    return { success: false as const, error: "Add at least one student document ID." };
  }

  if (ids.length > MAX_CAMPAIGN_RECIPIENTS) {
    return {
      success: false as const,
      error: `Maximum ${MAX_CAMPAIGN_RECIPIENTS} recipients per send.`,
    };
  }

  const rows = await client.fetch<
    { _id: string; email: string; firstName?: string; lastName?: string }[]
  >(
    `*[_type == "student" && _id in $ids]{
      _id,
      email,
      firstName,
      lastName
    }`,
    { ids }
  );

  if (!rows?.length) {
    return { success: false as const, error: "No matching students found for those IDs." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const dashboardUrl = `${siteUrl}/dashboard`;

  let sent = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const vars = buildVars({
      firstName: row.firstName || "Friend",
      lastName: row.lastName || "",
      email: row.email,
      siteUrl,
      dashboardUrl,
    });

    const result = await sendTemplatedEmail(row.email, template, vars);
    if (result.ok) sent += 1;
    else errors.push(`${row.email}: ${result.error}`);
  }

  return {
    success: true as const,
    sent,
    failed: errors.length,
    errors: errors.slice(0, 5),
    message: `Sent ${sent} of ${rows.length} email(s).`,
  };
}
