/**
 * Public site origin for build-time config (Sanity Presentation, stega).
 * Prefers explicit env; falls back to Vercel URLs. Rejects accidental
 * `https://undefined` when a template literal had no env value at build time.
 */
export function resolvePublicSiteOriginSync(): string {
  const tryOrigin = (raw: string | undefined): string | null => {
    if (!raw?.trim()) return null;
    let s = raw.trim().replace(/\/$/, "");
    if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
    try {
      const u = new URL(s);
      if (!u.hostname || u.hostname === "undefined") return null;
      return `${u.protocol}//${u.host}`;
    } catch {
      return null;
    }
  };

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const vercelDeploy = process.env.VERCEL_URL;

  return (
    tryOrigin(process.env.NEXT_PUBLIC_BASE_URL) ??
    tryOrigin(process.env.SANITY_STUDIO_PREVIEW_URL) ??
    tryOrigin(vercelProd ? `https://${vercelProd}` : undefined) ??
    tryOrigin(vercelDeploy ? `https://${vercelDeploy}` : undefined) ??
    "http://localhost:3000"
  );
}
