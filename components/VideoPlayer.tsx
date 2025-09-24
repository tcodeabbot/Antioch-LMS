"use client";

import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="relative aspect-video bg-gray-200 animate-pulse" />
  )
}) as any;

interface VideoPlayerProps {
  url: string;
}

export const VideoPlayer = ({ url }: VideoPlayerProps) => {
  return (
    <div className="relative aspect-video">
      <ReactPlayer
        src={url}
        width="100%"
        height="100%"
        controls
        playing={false}
      />
    </div>
  );
};
