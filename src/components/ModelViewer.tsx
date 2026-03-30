"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleLoad = () => onLoad?.();
    const handleARStatus = (e: Event) =>
      onARStatus?.((e as CustomEvent).detail.status);

    el.addEventListener("load", handleLoad);
    el.addEventListener("ar-status", handleARStatus);

    return () => {
      el.removeEventListener("load", handleLoad);
      el.removeEventListener("ar-status", handleARStatus);
    };
  }, [onLoad, onARStatus]);

  return (
    <model-viewer
      ref={ref}
      src={src}
      ios-src={iosSrc}
      alt={alt}
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      auto-rotate
      shadow-intensity="1.5"
      shadow-softness="1"
      tone-mapping="commerce"
      environment-image="neutral"
      exposure="1.1"
      rotation-per-second="12deg"
      interaction-prompt="none"
      poster={poster}
      loading="eager"
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <button slot="ar-button" style={{ display: "none" }} />
    </model-viewer>
  );
}
