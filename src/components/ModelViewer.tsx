"use client";

import { useEffect, useRef, useState } from "react";
import { hapticLight, hapticMedium } from "@/lib/haptics";
interface ModelViewerProps {
  src: string;
  iosSrc?: string;
  alt: string;
  poster?: string;
  className?: string;
  onLoad?: () => void;
  onARStatus?: (status: string) => void;
}

export default function ModelViewer({
  src,
  iosSrc,
  alt,
  poster,
  className,
  onLoad,
  onARStatus,
}: ModelViewerProps) {
  const ref = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  // Reset loaded state when src changes
  useEffect(() => {
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleLoad = () => {
      setLoaded(true);
      hapticLight();
      onLoad?.();
    };
    const handleARStatus = (e: Event) => {
      const status = (e as CustomEvent).detail.status;
      if (status === "session-started") hapticMedium();
      onARStatus?.(status);
    };

    el.addEventListener("load", handleLoad);
    el.addEventListener("ar-status", handleARStatus);

    return () => {
      el.removeEventListener("load", handleLoad);
      el.removeEventListener("ar-status", handleARStatus);
    };
  }, [onLoad, onARStatus]);

  return (
    <div
      className={`model-viewer-entrance ${loaded ? "model-loaded" : ""} ${className || ""}`}
      style={{ width: "100%", height: "100%" }}
    >
      <model-viewer
        ref={ref}
        src={src}
        ios-src={iosSrc}
        alt={alt}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="2.5"
        shadow-softness="0.8"
        tone-mapping="aces"
        environment-image="/env/room.hdr"
        exposure="1.2"
        skybox-height="1.5m"
        rotation-per-second="12deg"
        interaction-prompt="none"
        poster={poster}
        loading="eager"
        style={{ width: "100%", height: "100%" }}
      >
        <button slot="ar-button" style={{ display: "none" }} />
      </model-viewer>
    </div>
  );
}
