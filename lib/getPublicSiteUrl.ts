import { headers } from "next/headers";

/**
 * Canonical public URL for links shown in admin (marketing, invites).
 * Prefer NEXT_PUBLIC_BASE_URL; otherwise derive from the incoming request.
 */
export async function getPublicSiteUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (env) return env;

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;

  return "http://localhost:3000";
}
