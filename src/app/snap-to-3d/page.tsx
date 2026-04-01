"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/lib/i18n";
import { hapticSuccess, hapticLight, hapticMedium } from "@/lib/haptics";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
});

/** Resize image to maxDim and return as JPEG base64 data URL */
function compressImage(base64: string, maxDim: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = base64;
  });
}

interface Scan {
  id: string;
  name: string;
  image_data: string;
  meshy_task_id: string;
  status: string;
  model_url: string | null;
  progress?: number;
  created_at: string;
}

export default function SnapToTryPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [scans, setScans] = useState<Scan[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [loadingScans, setLoadingScans] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch user's scans
  const fetchScans = useCallback(async () => {
    try {
      const res = await fetch("/api/snap-to-3d");
      if (res.ok) {
        const data = await res.json();
        setScans(data.scans || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingScans(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchScans();
  }, [user, fetchScans]);

  // Poll for processing scans
  useEffect(() => {
    const hasProcessing = scans.some((s) => s.status === "processing");

    if (hasProcessing) {
      pollRef.current = setInterval(async () => {
        const processingScans = scans.filter((s) => s.status === "processing");
        for (const scan of processingScans) {
          try {
            const res = await fetch(`/api/snap-to-3d?id=${scan.id}`);
            if (res.ok) {
              const updated = await res.json();
              setScans((prev) =>
                prev.map((s) =>
                  s.id === updated.id ? { ...s, ...updated } : s
                )
              );
              if (updated.status === "succeeded") {
                hapticSuccess();
              }
            }
          } catch {
            // ignore
          }
        }
      }, 10000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [scans]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    hapticLight();

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imagePreview) return;
    setUploading(true);
    hapticMedium();

    try {
      setError(null);

      // Compress image before sending — resize to max 1024px
      const compressedImage = await compressImage(imagePreview, 1024);

      const res = await fetch("/api/snap-to-3d", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: compressedImage,
          name: name || "My Furniture",
        }),
      });

      if (res.ok) {
        hapticSuccess();
        setImagePreview(null);
        setName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchScans();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Error ${res.status}`);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (scanId: string) => {
    // Client-side delete via Supabase
    const { createClient } = await import("@/lib/supabase-browser");
    const supabase = createClient();
    await supabase.from("scanned_models").delete().eq("id", scanId);
    setScans((prev) => prev.filter((s) => s.id !== scanId));
    if (selectedScan?.id === scanId) setSelectedScan(null);
    hapticLight();
  };

  if (authLoading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ backgroundColor: "var(--t-bg)" }}
      >
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{
            border: "2px solid var(--t-spinner-track)",
            borderTopColor: "var(--t-accent)",
          }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--t-bg)" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: "var(--t-surface)",
              border: "1px solid var(--t-border)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--t-text-dim)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
          <h1
            className="text-2xl font-semibold mb-3"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {t.snapToTry.signInTitle}
          </h1>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--t-text-dim)" }}
          >
            {t.snapToTry.signInDesc}
          </p>
          <Link
            href="/auth/login"
            className="inline-block font-semibold px-8 py-3 rounded-full"
            style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}
          >
            {t.nav.signIn}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh flex flex-col transition-colors duration-300"
      style={{ backgroundColor: "var(--t-bg)" }}
    >
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: "var(--t-header-bg)",
          borderBottom: "1px solid var(--t-border)",
        }}
      >
        <div className="h-14 flex items-center justify-between px-4 max-w-lg mx-auto">
          <Link
            href="/browse"
            className="flex items-center gap-2"
            style={{ color: "var(--t-text-dim)" }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">{t.snapToTry.back}</span>
          </Link>
          <p
            className="text-sm font-semibold"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {t.snapToTry.title}
          </p>
          <div className="w-12" />
        </div>
      </header>

      <div className="flex-1 pt-20 pb-8 px-4 max-w-lg mx-auto w-full">
        {/* Upload Section */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: "var(--t-surface)",
            border: "1px solid var(--t-border)",
          }}
        >
          <h2
            className="text-lg font-bold mb-1"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {t.snapToTry.uploadTitle}
          </h2>
          <p className="text-xs mb-4" style={{ color: "var(--t-text-dim)" }}>
            {t.snapToTry.uploadDesc}
          </p>

          {/* Upload area */}
          {!imagePreview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] rounded-xl flex flex-col items-center justify-center gap-3 transition-colors"
              style={{
                border: "2px dashed var(--t-border)",
                color: "var(--t-text-dim)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <span className="text-sm font-medium">
                {t.snapToTry.tapToUpload}
              </span>
              <span className="text-xs">{t.snapToTry.photoHint}</span>
            </button>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full aspect-[4/3] object-cover rounded-xl"
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "#fff",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Name input */}
          {imagePreview && (
            <div className="mt-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.snapToTry.namePlaceholder}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: "var(--t-bg)",
                  border: "1px solid var(--t-border)",
                  color: "var(--t-text)",
                }}
              />
            </div>
          )}

          {/* Submit */}
          {imagePreview && (
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full mt-4 font-semibold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: "var(--t-accent)",
                color: "var(--t-bg)",
              }}
            >
              {uploading ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full animate-spin"
                    style={{
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                    }}
                  />
                  {t.snapToTry.generating}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                  {t.snapToTry.generate}
                </>
              )}
            </button>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
          )}
        </div>

        {/* My Scans */}
        <div className="mb-4">
          <h2
            className="text-lg font-bold mb-3"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {t.snapToTry.myScans}
          </h2>

          {loadingScans ? (
            <div className="flex items-center justify-center py-12">
              <div
                className="w-8 h-8 rounded-full animate-spin"
                style={{
                  border: "2px solid var(--t-spinner-track)",
                  borderTopColor: "var(--t-accent)",
                }}
              />
            </div>
          ) : scans.length === 0 ? (
            <div
              className="text-center py-12 rounded-2xl"
              style={{
                backgroundColor: "var(--t-surface)",
                border: "1px solid var(--t-border)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--t-text-dim)" }}>
                {t.snapToTry.noScans}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="rounded-xl overflow-hidden transition-all"
                  style={{
                    backgroundColor: "var(--t-surface)",
                    border:
                      selectedScan?.id === scan.id
                        ? "1px solid var(--t-accent)"
                        : "1px solid var(--t-border)",
                  }}
                >
                  <button
                    onClick={() =>
                      setSelectedScan(
                        selectedScan?.id === scan.id ? null : scan
                      )
                    }
                    className="w-full flex items-center gap-3 p-3 text-left"
                  >
                    {/* Thumbnail */}
                    {scan.image_data ? (
                      <img
                        src={scan.image_data}
                        alt={scan.name}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center"
                        style={{
                          backgroundColor: "var(--t-bg)",
                          border: "1px solid var(--t-border)",
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--t-text-dim)" }}>
                          <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                        </svg>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--t-text)" }}
                      >
                        {scan.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {scan.status === "processing" && (
                          <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--t-accent)" }}>
                            <div
                              className="w-3 h-3 rounded-full animate-spin"
                              style={{
                                border: "1.5px solid var(--t-border)",
                                borderTopColor: "var(--t-accent)",
                              }}
                            />
                            {t.snapToTry.statusProcessing}
                            {scan.progress ? ` ${scan.progress}%` : ""}
                          </span>
                        )}
                        {scan.status === "succeeded" && (
                          <span className="text-xs font-medium" style={{ color: "var(--t-accent2)" }}>
                            {t.snapToTry.statusReady}
                          </span>
                        )}
                        {scan.status === "failed" && (
                          <span className="text-xs font-medium text-red-400">
                            {t.snapToTry.statusFailed}
                          </span>
                        )}
                        {scan.status === "pending" && (
                          <span className="text-xs" style={{ color: "var(--t-text-dim)" }}>
                            {t.snapToTry.statusPending}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(scan.id);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ color: "var(--t-text-dim)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </button>

                  {/* 3D Preview for selected succeeded scan */}
                  {selectedScan?.id === scan.id &&
                    scan.status === "succeeded" &&
                    scan.model_url && (
                      <div className="px-3 pb-3">
                        <div
                          className="rounded-xl overflow-hidden product-studio"
                          style={{ height: "250px" }}
                        >
                          <ModelViewer
                            src={scan.model_url}
                            alt={scan.name}
                            className="w-full h-full"
                          />
                        </div>
                        <button
                          onClick={() => {
                            hapticMedium();
                            const mv = document.querySelector(
                              "model-viewer"
                            ) as HTMLElement & { activateAR: () => void };
                            mv?.activateAR();
                          }}
                          className="w-full mt-2 font-semibold py-3 rounded-full flex items-center justify-center gap-2"
                          style={{
                            backgroundColor: "var(--t-accent)",
                            color: "var(--t-bg)",
                          }}
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                          </svg>
                          {t.snapToTry.viewInAR}
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
