"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getProductById } from "@/data/products";
import { Product } from "@/types/product";
import type { ItemState } from "@/components/SceneEditor";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
});

const SceneEditor = dynamic(() => import("@/components/SceneEditor"), {
  ssr: false,
});

export default function ARSessionPage() {
  return (
    <Suspense>
      <ARSessionContent />
    </Suspense>
  );
}

type ViewMode = "arrange" | "preview3d";

function ARSessionContent() {
  const searchParams = useSearchParams();
  const { user, favorites, loading } = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>("arrange");
  const [combinedSrc, setCombinedSrc] = useState<string | null>(null);
  const [combining, setCombining] = useState(false);
  const [combineError, setCombineError] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const layoutRef = useRef<ItemState[]>([]);
  const blobUrlRef = useRef<string | null>(null);

  const idsParam = searchParams.get("ids");
  const selectedIds = idsParam ? idsParam.split(",") : favorites;

  const sessionProducts: Product[] = selectedIds
    .map((id) => getProductById(id))
    .filter(Boolean) as Product[];

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const handleLayoutChange = useCallback((items: ItemState[]) => {
    layoutRef.current = items;
    // Invalidate combined preview when layout changes
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      setCombinedSrc(null);
    }
  }, []);

  const handleCombine = useCallback(async () => {
    const layout = layoutRef.current;
    if (layout.length === 0) return;
    setCombining(true);
    setCombineError(false);
    setModelLoaded(false);

    try {
      const { combineModelsToGLB } = await import("@/lib/scene-combiner");

      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);

      const items = layout.map((it) => ({
        id: it.id,
        name: it.name,
        modelSrc: it.modelSrc,
        x: it.x,
        z: it.z,
        rotation: it.rotation,
      }));

      const blobUrl = await combineModelsToGLB(items);
      blobUrlRef.current = blobUrl;
      setCombinedSrc(blobUrl);
      setViewMode("preview3d");
    } catch (err) {
      console.error("Failed to combine:", err);
      setCombineError(true);
    } finally {
      setCombining(false);
    }
  }, []);

  const handleAR = useCallback(() => {
    const mv = document.querySelector("model-viewer") as HTMLElement & {
      activateAR: () => void;
    };
    mv?.activateAR();
  }, []);

  // Auth loading
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ backgroundColor: "var(--t-bg)" }}>
        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: "2px solid var(--t-spinner-track)", borderTopColor: "var(--t-accent)" }} />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4" style={{ backgroundColor: "var(--t-bg)" }}>
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: "var(--font-playfair)" }}>Sign in to use AR Session</h1>
          <p className="text-sm mb-6" style={{ color: "var(--t-text-dim)" }}>Save furniture to favorites, then place them all in your room.</p>
          <Link href="/auth/login" className="inline-block font-semibold px-8 py-3 rounded-full" style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}>Sign in</Link>
        </div>
      </div>
    );
  }

  // No products
  if (sessionProducts.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4" style={{ backgroundColor: "var(--t-bg)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--t-text-dim)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: "var(--font-playfair)" }}>No items selected</h1>
          <p className="text-sm mb-6" style={{ color: "var(--t-text-dim)" }}>Add furniture to your favorites first, then start an AR session.</p>
          <Link href="/favorites" className="inline-block font-semibold px-8 py-3 rounded-full" style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}>Go to Favorites</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: "var(--t-bg)" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl" style={{ backgroundColor: "var(--t-header-bg)", borderBottom: "1px solid var(--t-border)" }}>
        <div className="h-14 flex items-center justify-between px-4">
          <Link href="/favorites" className="flex items-center gap-2" style={{ color: "var(--t-text-dim)" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            <span className="text-sm">Back</span>
          </Link>
          <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-playfair)" }}>AR Session</p>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}>
            {sessionProducts.length} items
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex px-4 pb-2 gap-2">
          <button
            onClick={() => setViewMode("arrange")}
            className="flex-1 text-xs font-semibold py-2 rounded-full transition-all"
            style={{
              backgroundColor: viewMode === "arrange" ? "var(--t-accent)" : "transparent",
              color: viewMode === "arrange" ? "var(--t-bg)" : "var(--t-text-dim)",
              border: viewMode === "arrange" ? "none" : "1px solid var(--t-border)",
            }}
          >
            Arrange
          </button>
          <button
            onClick={() => {
              if (combinedSrc) {
                setViewMode("preview3d");
              } else {
                handleCombine();
              }
            }}
            className="flex-1 text-xs font-semibold py-2 rounded-full transition-all"
            style={{
              backgroundColor: viewMode === "preview3d" ? "var(--t-accent)" : "transparent",
              color: viewMode === "preview3d" ? "var(--t-bg)" : "var(--t-text-dim)",
              border: viewMode === "preview3d" ? "none" : "1px solid var(--t-border)",
            }}
          >
            3D Preview
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 pt-28 pb-28 overflow-y-auto">
        <div className="px-4 max-w-lg mx-auto">

          {/* ARRANGE MODE — floor plan editor */}
          {viewMode === "arrange" && (
            <>
              <div className="mb-3">
                <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                  Arrange Your Furniture
                </h2>
                <p className="text-xs" style={{ color: "var(--t-text-dim)" }}>
                  Drag items to position them. Tap an item to select it, then use the rotation buttons.
                  When ready, tap &quot;Preview 3D&quot; to see the combined scene.
                </p>
              </div>

              {/* Floor plan */}
              <SceneEditor
                products={sessionProducts}
                onLayoutChange={handleLayoutChange}
                selectedItemId={selectedItemId}
                onSelectItem={setSelectedItemId}
              />

              {/* Item list with details */}
              <div className="mt-4 space-y-2">
                {sessionProducts.map((p) => {
                  const isSelected = selectedItemId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedItemId(isSelected ? null : p.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200"
                      style={{
                        backgroundColor: isSelected ? "var(--t-surface)" : "transparent",
                        border: isSelected ? "1px solid var(--t-accent)" : "1px solid var(--t-border)",
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ backgroundColor: isSelected ? "var(--t-accent)" : "var(--t-bg)", color: isSelected ? "var(--t-bg)" : "var(--t-text-dim)", border: isSelected ? "none" : "1px solid var(--t-border)" }}>
                        {sessionProducts.indexOf(p) + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--t-text)" }}>{p.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--t-text-dim)" }}>
                          {p.dimensions.width} x {p.dimensions.depth} cm &middot; {p.store}
                        </p>
                      </div>
                      <span className="text-sm font-bold shrink-0" style={{ color: "var(--t-accent)" }}>
                        {p.price.toLocaleString()} Kč
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Total */}
              <div className="mt-3 p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                <span className="text-sm" style={{ color: "var(--t-text-dim)" }}>Total</span>
                <span className="text-lg font-bold" style={{ color: "var(--t-accent)" }}>
                  {sessionProducts.reduce((s, p) => s + p.price, 0).toLocaleString()} Kč
                </span>
              </div>
            </>
          )}

          {/* 3D PREVIEW MODE — combined model-viewer */}
          {viewMode === "preview3d" && (
            <>
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{ height: "50dvh", backgroundColor: "var(--t-model-bg)", border: "1px solid var(--t-border)" }}
              >

                {(!modelLoaded || combining) && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full animate-spin mx-auto mb-3" style={{ border: "2px solid var(--t-spinner-track)", borderTopColor: "var(--t-accent)" }} />
                      <p className="text-xs" style={{ color: "var(--t-text-dim)" }}>
                        {combining ? "Combining models..." : "Loading 3D scene..."}
                      </p>
                    </div>
                  </div>
                )}
                {combinedSrc && (
                  <ModelViewer
                    key={combinedSrc}
                    src={combinedSrc}
                    alt={`Combined scene: ${sessionProducts.map((p) => p.name).join(", ")}`}
                    onLoad={() => setModelLoaded(true)}
                    className="w-full h-full"
                  />
                )}

                {/* Badge */}
                <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: "var(--t-surface)", color: "var(--t-accent)", border: "1px solid var(--t-border)" }}>
                  {sessionProducts.length} items combined
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl text-center" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                <p className="text-xs leading-relaxed" style={{ color: "var(--t-text-dim)" }}>
                  <strong style={{ color: "var(--t-text)" }}>All items in one scene.</strong>{" "}
                  Rotate to inspect. Tap &quot;View in AR&quot; to place this entire arrangement in your room.
                  Go back to &quot;Arrange&quot; to adjust positions.
                </p>
              </div>

              {combineError && (
                <p className="text-xs text-red-400 text-center mt-3">
                  Failed to combine models. Try again.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl px-4 py-3" style={{ backgroundColor: "var(--t-header-bg)", borderTop: "1px solid var(--t-border)" }}>
        {viewMode === "arrange" ? (
          <button
            onClick={handleCombine}
            disabled={combining}
            className="w-full font-semibold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}
          >
            {combining ? (
              <>
                <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                Combining...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
                Preview 3D &amp; AR
              </>
            )}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode("arrange")}
              className="font-semibold py-3.5 px-5 rounded-full transition-colors"
              style={{ backgroundColor: "var(--t-bg)", color: "var(--t-text)", border: "1px solid var(--t-border)" }}
            >
              Rearrange
            </button>
            <button
              onClick={handleAR}
              disabled={!combinedSrc || !modelLoaded}
              className="flex-1 font-semibold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              View All in AR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
