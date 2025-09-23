import Hero from "@/components/Hero";
import { CourseCard } from "@/components/CourseCard";
import { getCourses } from "@/sanity/lib/courses/getCourses";

export const dynamic = "force-static";
export const revalidate = 3600; // revalidate at most every hour

export default async function Home() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-background">
      <Hero />

      {/* Courses Grid */}
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-8">
          <div className="h-px flex-1 bg-gradient-to-r from-border/0 via-border to-border/0" />
          <span className="text-sm font-medium text-muted-foreground">
            Featured Courses
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-border/0 via-border to-border/0" />
        </div>

        {/* Typography Test */}
        <div className="prose prose-lg max-w-none mb-8">
          <h2>Typography Test</h2>
          <p>
            This is a test paragraph to verify that Tailwind Typography is
            working correctly. The prose classes should style this content
            beautifully.
          </p>
          <ul>
            <li>First list item</li>
            <li>Second list item</li>
            <li>Third list item</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              href={`/courses/${course.slug}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
