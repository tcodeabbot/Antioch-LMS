"use client";

import ReactPlayer from "react-player";
// const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface VideoPlayerProps {
  url: string;
}

export const VideoPlayer = ({ url }: VideoPlayerProps) => {
  return (
    //
    <div>
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls
        playing={false}
      />
    </div>
  );
};
