import Hero from "@/components/Hero";
import { CourseExplorer } from "@/components/CourseExplorer";
import { getCourses } from "@/sanity/lib/courses/getCourses";
import { getCategories } from "@/sanity/lib/courses/getCategories";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function Home() {
  const [courses, categories] = await Promise.all([
    getCourses(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <CourseExplorer courses={courses} categories={categories} />
    </div>
  );
}
