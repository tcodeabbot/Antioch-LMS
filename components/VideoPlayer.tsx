"use client";

import { useState } from "react";
import { Play } from "lucide-react";

function getEmbedUrl(url: string, autoplay: boolean): string | null {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtu.be")
    ) {
      let videoId = parsed.searchParams.get("v");
      if (!videoId && parsed.hostname.includes("youtu.be")) {
        videoId = parsed.pathname.slice(1);
      }
      if (videoId) {
        const ap = autoplay ? "&autoplay=1" : "";
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1${ap}`;
      }
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").pop();
      if (id) {
        const ap = autoplay ? "?autoplay=1" : "";
        return `https://player.vimeo.com/video/${id}${ap}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

interface VideoPlayerProps {
  url: string;
}

export const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const thumbnailUrl = getEmbedUrl(url, false);
  const playUrl = getEmbedUrl(url, true);

  if (playUrl) {
    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {isPlaying ? (
          <iframe
            src={playUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            title="Lesson video"
          />
        ) : (
          <button
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full group cursor-pointer"
            type="button"
            aria-label="Play video"
          >
            {thumbnailUrl && (
              <img
                src={getYouTubeThumbnail(url)}
                alt="Video thumbnail"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Play
                  className="h-7 w-7 text-primary-foreground ml-1"
                  fill="currentColor"
                />
              </div>
            </div>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video src={url} controls className="w-full h-full" />
    </div>
  );
};

function getYouTubeThumbnail(url: string): string {
  try {
    const parsed = new URL(url);
    let videoId = parsed.searchParams.get("v");
    if (!videoId && parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    }
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  } catch {
    // ignore
  }
  return "";
}
