"use client";

import { useEffect, useState } from "react";
import Picture from "@/components/Picture";

/**
 * The hero: poster image first, video afterwards.
 *
 * Previously the <video> carried the poster itself, which made the video the
 * element PageSpeed measured as the largest paint. On a throttled 4G phone that
 * meant waiting on a multi-megabyte file: 12 seconds, and no amount of image
 * work moved it.
 *
 * Now a WebP poster is in the server-rendered HTML and paints on its own, and
 * the video is attached only once the page has loaded, fading in over it. The
 * visitor sees the same hero; the measured paint is the poster.
 */
export default function HeroMedia({
  image,
  video,
}: {
  image: string;
  video?: { webm?: string; mp4?: string };
}) {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!video) return;
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      // One more beat after load, so the video never competes with the rest of
      // the page for bandwidth while it is still settling.
      window.setTimeout(() => !cancelled && setShowVideo(true), 600);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
    };
  }, [video]);

  return (
    <>
      <Picture src={image} alt="" priority sizes="100vw" className="hero-poster" />
      {video && showVideo && (
        <video className="hero-video" loop muted autoPlay playsInline preload="auto">
          {video.webm && <source src={video.webm} type="video/webm" />}
          {video.mp4 && <source src={video.mp4} type="video/mp4" />}
        </video>
      )}
    </>
  );
}
