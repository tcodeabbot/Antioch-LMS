import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import getCourseBySlug from "@/sanity/lib/courses/getCourseBySlug";
import { isEnrolledInCourse } from "@/sanity/lib/student/isEnrolledInCourse";
import { auth } from "@clerk/nextjs/server";
import CoursePreviewCard from "@/components/CoursePreviewCard";

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  const { userId } = await auth();

  const isEnrolled =
    userId && course?._id
      ? await isEnrolledInCourse(userId, course._id)
      : false;

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-4xl font-bold">Course not found</h1>
      </div>
    );
  }

  const courseImageUrl = course.image ? urlFor(course.image).url() : null;
  const previewThumbnailUrl = course.previewThumbnail
    ? urlFor(course.previewThumbnail).url()
    : courseImageUrl;

  const lessonCount =
    course.modules?.reduce(
      (acc: number, mod: { lessons?: unknown[] | null }) =>
        acc + (mod.lessons?.length || 0),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-background -mt-14 sm:-mt-16">
      {/* Hero Banner */}
      <div className="relative w-full bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="absolute inset-0">
          {course.image && (
            <Image
              src={courseImageUrl || ""}
              alt={course.title || "Course"}
              fill
              sizes="100vw"
              className="object-cover opacity-20"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 pt-24 sm:pt-28 pb-12 sm:pb-16">
          <Link
            href="/"
            prefetch={false}
            className="text-white/70 mb-6 sm:mb-8 flex items-center hover:text-white transition-colors w-fit text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>

          <div className="lg:max-w-[60%]">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                {course.category?.name || "Uncategorized"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {course.title}
            </h1>

            <p className="text-base sm:text-lg text-white/80 mb-6 max-w-2xl leading-relaxed">
              {course.description}
            </p>

            {course.instructor && (
              <div className="flex items-center gap-3">
                {course.instructor.photo && (
                  <div className="relative h-10 w-10">
                    <Image
                      src={urlFor(course.instructor.photo).url() || ""}
                      alt={course.instructor.name || "Instructor"}
                      fill
                      sizes="40px"
                      className="rounded-full object-cover ring-2 ring-white/20"
                    />
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-medium">
                    {course.instructor.name}
                  </p>
                  <p className="text-white/60 text-xs">Instructor</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Course Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            {course.modules && course.modules.length > 0 && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h2 className="text-2xl font-bold mb-2">What you&apos;ll learn</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                  This course contains {course.modules.length}{" "}
                  {course.modules.length === 1 ? "module" : "modules"} and{" "}
                  {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}.
                </p>
                <div className="space-y-4">
                  {course.modules.map((module: any, index: number) => (
                    <div
                      key={module._id}
                      className="border border-border rounded-lg"
                    >
                      <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                        <h3 className="font-medium">
                          Module {index + 1}: {module.title}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {module.lessons?.length || 0}{" "}
                          {(module.lessons?.length || 0) === 1
                            ? "lesson"
                            : "lessons"}
                        </span>
                      </div>
                      <div className="divide-y divide-border">
                        {module.lessons?.map((lesson: any, lessonIndex: number) => (
                          <div
                            key={lesson._id}
                            className="p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                {lessonIndex + 1}
                              </div>
                              <div className="flex items-center gap-3 text-foreground">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {lesson.title}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor */}
            {course.instructor && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h2 className="text-2xl font-bold mb-4">About the Instructor</h2>
                <div className="flex items-start gap-4">
                  {course.instructor.photo && (
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={urlFor(course.instructor.photo).url() || ""}
                        alt={course.instructor.name || "Instructor"}
                        fill
                        sizes="64px"
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {course.instructor.name}
                    </h3>
                    {course.instructor.bio && (
                      <p className="text-muted-foreground mt-2 leading-relaxed">
                        {course.instructor.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Preview Card Sidebar */}
          <div className="order-first lg:order-last lg:-mt-48">
            <CoursePreviewCard
              courseId={course._id}
              isEnrolled={isEnrolled}
              previewVideoUrl={course.previewVideoUrl}
              imageUrl={previewThumbnailUrl}
              title={course.title}
              price={course.price}
              moduleCount={course.modules?.length || 0}
              lessonCount={lessonCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
