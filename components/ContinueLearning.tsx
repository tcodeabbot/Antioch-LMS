"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getRecommendationsAction } from "@/app/actions/recommendationActions";
import { PlayCircle, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface ContinueLearningItem {
  courseId: string;
  courseTitle: string;
  courseImage: string | null;
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  progress: number;
  lastActiveAt: string;
}

interface SuggestedCourse {
  _id: string;
  title: string;
  slug: string;
  description: string | null;
  image: unknown;
  categoryName: string;
  instructorName: string | null;
  lessonCount: number;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export function ContinueLearning() {
  const { user } = useUser();
  const [continueItems, setContinueItems] = useState<ContinueLearningItem[]>(
    []
  );
  const [suggestedCourses, setSuggestedCourses] = useState<SuggestedCourse[]>(
    []
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getRecommendationsAction(user.id).then((res) => {
      if (res.success) {
        setContinueItems(res.data.continueItems);
        setSuggestedCourses(res.data.suggestedCourses);
      }
      setLoaded(true);
    });
  }, [user?.id]);

  if (!loaded) return null;

  return (
    <div className="space-y-8">
      {/* Continue Where You Left Off */}
      {continueItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              Continue Where You Left Off
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {continueItems.map((item) => (
              <Link
                key={`${item.courseId}-${item.lessonId}`}
                href={`/dashboard/courses/${item.courseId}/lessons/${item.lessonId}`}
                className="group rounded-lg border border-border bg-card hover:border-primary/40 transition-all overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm line-clamp-1">
                      {item.courseTitle}
                    </h3>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {timeAgo(item.lastActiveAt)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                    {item.moduleTitle && `${item.moduleTitle} · `}
                    {item.lessonTitle}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                      {item.progress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary group-hover:underline">
                    <span>Resume</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Courses */}
      {suggestedCourses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedCourses.slice(0, 3).map((course) => {
              const imageUrl = course.image
                ? urlFor(course.image as Parameters<typeof urlFor>[0]).url()
                : null;
              return (
                <Link
                  key={course._id}
                  href={`/courses/${course.slug}`}
                  className="group rounded-lg border border-border bg-card hover:border-primary/40 transition-all overflow-hidden"
                >
                  {imageUrl && (
                    <div className="relative w-full h-32 bg-muted">
                      <Image
                        src={imageUrl}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium mb-2">
                      {course.categoryName}
                    </span>
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {course.instructorName && (
                        <span>{course.instructorName}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.lessonCount} lessons
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
