import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export async function getCategories() {
  const getCategoriesQuery = defineQuery(
    `*[_type == "category"] | order(name asc) { _id, name, "slug": slug.current }`
  );

  const categories = await sanityFetch({ query: getCategoriesQuery });
  return categories.data;
}
