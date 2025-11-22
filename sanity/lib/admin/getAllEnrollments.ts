import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getAllEnrollments() {
  const getAllEnrollmentsQuery = defineQuery(`*[_type == "enrollment"] | order(enrolledAt desc) {
    _id,
    enrolledAt,
    amount,
    paymentId,
    "student": student-> {
      _id,
      firstName,
      lastName,
      email,
      imageUrl,
      clerkId
    },
    "course": course-> {
      _id,
      title,
      "slug": slug.current,
      "category": category->{title},
      "instructor": instructor->{name}
    }
  }`);

  const result = await sanityFetch({
    query: getAllEnrollmentsQuery,
  });

  return result?.data || [];
}

