import type { NextRequest } from "next/server";

/**
 * Public site URL for redirects (Clerk invitations, emails).
 * Prefer NEXT_PUBLIC_BASE_URL; fall back to request host in API routes.
 */
export function getAppBaseUrlFromRequest(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (env) return env;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}
