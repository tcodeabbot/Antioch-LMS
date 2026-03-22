import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import { getCourseStats } from "@/sanity/lib/admin/getCourseStats";
import { getPublicSiteUrl } from "@/lib/getPublicSiteUrl";
import { getEmailTemplatesForAdmin } from "@/sanity/lib/admin/getEmailTemplates";
import { MarketingHub, type MarketingCourseOption } from "@/components/admin/MarketingHub";

export default async function AdminMarketingPage() {
  const auth = await checkAdminAccess();
  if (!auth.isAuthorized) {
    redirect(auth.redirect || "/dashboard");
  }

  const [stats, siteUrl, templates] = await Promise.all([
    getCourseStats(),
    getPublicSiteUrl(),
    getEmailTemplatesForAdmin(),
  ]);

  const courses: MarketingCourseOption[] = (stats.courses || [])
    .filter((c: { slug?: string }) => Boolean(c.slug))
    .map((c: { _id: string; title: string; slug?: string }) => ({
      _id: c._id,
      title: c.title,
      slug: c.slug as string,
    }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <MarketingHub courses={courses} siteUrl={siteUrl} templates={templates} />
    </div>
  );
}
