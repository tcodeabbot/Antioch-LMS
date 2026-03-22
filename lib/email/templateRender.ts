export type TemplateVars = {
  firstName: string;
  lastName: string;
  email: string;
  siteUrl: string;
  dashboardUrl: string;
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Replace {{variable}} with values (case-sensitive keys). */
export function applyTemplateVars(input: string, vars: TemplateVars): string {
  let out = input;
  for (const [key, value] of Object.entries(vars)) {
    const re = new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, "g");
    out = out.replace(re, value);
  }
  return out;
}

/** Simple HTML → text fallback for multipart email. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * If the fragment is already a full HTML document, return as-is.
 * Otherwise wrap in a minimal responsive layout.
 */
export function wrapCampaignHtml(htmlFragment: string, siteUrl: string): string {
  const trimmed = htmlFragment.trim();
  if (/^<!doctype html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return htmlFragment;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    ${htmlFragment}
    <p style="font-size:11px;color:#999;margin-top:24px;text-align:center;">Antioch LMS · <a href="${siteUrl}" style="color:#999;">${siteUrl}</a></p>
  </div>
</body>
</html>`;
}

export function getCampaignFromAddress(): string {
  return (
    process.env.RESEND_CAMPAIGN_FROM ||
    process.env.DIGEST_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    "Antioch LMS <onboarding@resend.dev>"
  );
}
