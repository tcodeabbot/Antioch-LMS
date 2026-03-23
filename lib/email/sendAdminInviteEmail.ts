import { Resend } from "resend";
import {
  getCampaignFromAddress,
  htmlToPlainText,
} from "@/lib/email/templateRender";

const resend = new Resend(process.env.RESEND_API_KEY);

function layout(html: string, baseUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#6d1a36;border-radius:12px 12px 0 0;padding:28px 24px;text-align:center;">
      <h1 style="margin:0;color:white;font-size:22px;">Antioch LMS</h1>
      <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Administrator access</p>
    </div>
    <div style="background:white;padding:28px 24px;border-left:1px solid #e5e5e5;border-right:1px solid #e5e5e5;">
      ${html}
    </div>
    <div style="background:#f0f0f0;border-radius:0 0 12px 12px;padding:16px 24px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#999;">Antioch Christian Resource Center</p>
      <p style="margin:6px 0 0;font-size:11px;color:#999;"><a href="${baseUrl}" style="color:#6d1a36;">${baseUrl}</a></p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Sends a branded transactional email when someone is invited or promoted as admin.
 * Clerk also emails invitation links for new users; this is your copy on your domain (Resend).
 */
export async function sendAdminInviteNotificationEmail(params: {
  to: string;
  baseUrl: string;
  kind: "invitation" | "promoted";
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[sendAdminInviteNotificationEmail] RESEND_API_KEY not set; skipping email");
    return false;
  }

  const { to, baseUrl, kind } = params;
  const signUpUrl = `${baseUrl.replace(/\/$/, "")}/sign-up`;
  const adminUrl = `${baseUrl.replace(/\/$/, "")}/admin`;
  const signInUrl = `${baseUrl.replace(/\/$/, "")}/sign-in`;

  let subject: string;
  let innerHtml: string;

  if (kind === "invitation") {
    subject = "You've been invited as an administrator — Antioch LMS";
    innerHtml = `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333;">
        You&apos;ve been invited to join <strong>Antioch LMS</strong> as an <strong>administrator</strong>.
      </p>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#555;">
        Look for an email from our sign-in provider with a link to accept your invitation and create your account.
        After you sign up, you&apos;ll have access to the admin panel.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${signUpUrl}" style="display:inline-block;background:#6d1a36;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Create your account</a>
      </div>
      <p style="margin:0;font-size:12px;color:#888;line-height:1.5;">
        If the button doesn&apos;t work, copy and paste this link into your browser:<br/>
        <span style="word-break:break-all;color:#6d1a36;">${signUpUrl}</span>
      </p>
    `;
  } else {
    subject = "You're now an administrator — Antioch LMS";
    innerHtml = `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333;">
        Your account has been granted <strong>administrator</strong> access on <strong>Antioch LMS</strong>.
      </p>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#555;">
        Sign out and sign back in if you don&apos;t see the admin area yet. Then open the admin dashboard to manage courses, students, and more.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${adminUrl}" style="display:inline-block;background:#6d1a36;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Open admin dashboard</a>
      </div>
      <p style="margin:16px 0 0;font-size:12px;color:#888;">
        <a href="${signInUrl}" style="color:#6d1a36;">Sign in</a> ·
        <a href="${baseUrl}" style="color:#6d1a36;">Home</a>
      </p>
    `;
  }

  const html = layout(innerHtml, baseUrl);
  const from = getCampaignFromAddress();

  try {
    await resend.emails.send({
      from,
      to,
      subject,
      html,
      text: htmlToPlainText(html),
    });
    return true;
  } catch (err) {
    console.error("[sendAdminInviteNotificationEmail] Resend error:", err);
    return false;
  }
}
