"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, BookOpen, Clock, Users, BarChart3 } from "lucide-react";
import EnrollButton from "./EnrollButton";

function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    // YouTube: youtube.com/watch?v=ID or youtu.be/ID
    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtu.be")
    ) {
      let videoId = parsed.searchParams.get("v");
      if (!videoId && parsed.hostname.includes("youtu.be")) {
        videoId = parsed.pathname.slice(1);
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      }
    }

    // Vimeo: vimeo.com/ID
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").pop();
      if (id) return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }

    // Loom: loom.com/share/ID
    if (parsed.hostname.includes("loom.com")) {
      return url.replace("/share/", "/embed/").split("?")[0] + "?autoplay=1";
    }

    return null;
  } catch {
    return null;
  }
}

interface CoursePreviewCardProps {
  courseId: string;
  isEnrolled: boolean;
  previewVideoUrl?: string | null;
  imageUrl?: string | null;
  title?: string | null;
  price?: number | null;
  moduleCount: number;
  lessonCount: number;
}

export default function CoursePreviewCard({
  courseId,
  isEnrolled,
  previewVideoUrl,
  imageUrl,
  title,
  price,
  moduleCount,
  lessonCount,
}: CoursePreviewCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const hasVideo = !!previewVideoUrl;
  const embedUrl = previewVideoUrl ? getEmbedUrl(previewVideoUrl) : null;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-lg sticky top-20">
      {/* Video / Image Preview */}
      <div className="relative aspect-video bg-black overflow-hidden">
        {hasVideo && isPlaying && embedUrl ? (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Course preview video"
          />
        ) : (
          <button
            onClick={() => hasVideo && setIsPlaying(true)}
            className="relative w-full h-full group cursor-pointer"
            aria-label={hasVideo ? "Play preview video" : undefined}
            type="button"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title || "Course preview"}
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
            {hasVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Play className="h-7 w-7 text-black ml-1" fill="black" />
                </div>
                <span className="text-white text-sm font-medium drop-shadow">
                  Preview this course
                </span>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-5">
        {/* Price */}
        <div className="text-3xl font-bold text-foreground">
          {price === 0 || price == null ? "Free" : `$${price.toFixed(2)}`}
        </div>

        {/* CTA */}
        <EnrollButton courseId={courseId} isEnrolled={isEnrolled} />

        {/* Course Highlights */}
        <div className="space-y-3 pt-2 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground pt-2">
            This course includes:
          </h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {hasVideo && (
              <li className="flex items-center gap-3">
                <Play className="h-4 w-4 flex-shrink-0" />
                <span>Preview video available</span>
              </li>
            )}
            <li className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span>
                {moduleCount} {moduleCount === 1 ? "module" : "modules"}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 flex-shrink-0" />
              <span>
                {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>Learn at your own pace</span>
            </li>
            <li className="flex items-center gap-3">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>Full lifetime access</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
