import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export type EmailTemplateListItem = {
  _id: string;
  name: string;
  slug: string;
  category: string | null;
  subject: string;
  active: boolean;
};

const listQuery = defineQuery(`*[_type == "emailTemplate"] | order(_updatedAt desc) {
  _id,
  name,
  "slug": slug.current,
  category,
  subject,
  active
}`);

export async function getEmailTemplatesForAdmin(): Promise<EmailTemplateListItem[]> {
  const result = await sanityFetch({ query: listQuery });
  return (result?.data ?? []) as EmailTemplateListItem[];
}
