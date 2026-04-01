"use client";

import { useParams } from "next/navigation";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getProductById } from "@/data/products";
import FavoriteButton from "@/components/FavoriteButton";
import { useLanguage } from "@/lib/i18n";
import { hapticHeavy } from "@/lib/haptics";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
});

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [arStatus, setArStatus] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleAR = useCallback(() => {
    hapticHeavy();
    const mv = document.querySelector("model-viewer") as HTMLElement & {
      activateAR: () => void;
    };
    mv?.activateAR();
  }, []);

  if (!product) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: "var(--t-text-dim)" }} className="mb-4">
            {t.product.notFound}
          </p>
          <Link
            href="/browse"
            className="underline"
            style={{ color: "var(--t-accent)" }}
          >
            {t.product.browseProducts}
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
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-colors duration-300"
        style={{
          backgroundColor: "var(--t-header-bg)",
          borderBottom: "1px solid var(--t-border)",
        }}
      >
        <div className="h-14 flex items-center px-4">
          <Link
            href="/browse"
            className="transition-colors mr-4"
            style={{ color: "var(--t-text-dim)" }}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <span className="text-sm" style={{ color: "var(--t-text-dim)" }}>
            {product.store}
          </span>
        </div>
      </header>

      {/* 3D Viewer — studio backdrop */}
      <div
        className="relative pt-14 product-studio transition-colors duration-300"
        style={{ height: "55dvh" }}
      >
        {!modelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-[3]">
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-full animate-spin mx-auto mb-3"
                style={{
                  border: "2px solid var(--t-spinner-track)",
                  borderTopColor: "var(--t-accent)",
                }}
              />
              <p className="text-xs" style={{ color: "var(--t-text-dim)" }}>
                {t.product.loadingModel}
              </p>
            </div>
          </div>
        )}
        <ModelViewer
          src={product.variants[selectedVariant]?.modelSrc || product.modelSrc}
          iosSrc={product.iosSrc}
          alt={product.name}
          onLoad={() => setModelLoaded(true)}
          onARStatus={setArStatus}
          className="w-full h-full relative z-[2]"
        />

        {/* Favorite Button */}
        <div
          className="absolute bottom-4 right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: "var(--t-surface)",
            border: "1px solid var(--t-border)",
          }}
        >
          <FavoriteButton productId={product.id} size="md" />
        </div>

        {arStatus === "failed" && (
          <div
            className="absolute bottom-16 right-4 z-20 text-xs px-3 py-2 rounded-lg"
            style={{
              backgroundColor: "var(--t-surface)",
              color: "var(--t-text-dim)",
              border: "1px solid var(--t-border)",
            }}
          >
            {t.product.arRequiresMobile}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div
        className="flex-1 rounded-t-3xl -mt-4 relative z-10 px-5 pt-6 pb-24 overflow-y-auto transition-colors duration-300"
        style={{ backgroundColor: "var(--t-surface)" }}
      >
        <div className="max-w-lg mx-auto">
          {/* Name + Price */}
          <div className="flex items-start justify-between mb-2">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {product.name}
            </h1>
            <span
              className="text-2xl font-bold shrink-0 ml-4"
              style={{ color: "var(--t-accent)" }}
            >
              {product.currency === "CZK"
                ? `${product.price.toLocaleString()} Kč`
                : `€${(product.price / 100).toFixed(0)}`}
            </span>
          </div>

          <p className="text-sm mb-4" style={{ color: "var(--t-text-dim)" }}>
            {t.product.from}{" "}
            <Link
              href={`/browse?store=${encodeURIComponent(product.store)}`}
              className="font-medium underline-offset-2 hover:underline"
              style={{ color: "var(--t-accent)" }}
            >
              {product.store}
            </Link>
          </p>

          {/* Variants */}
          <div className="mb-5">
            <p
              className="text-xs mb-2 uppercase tracking-wider"
              style={{ color: "var(--t-text-dim)" }}
            >
              {t.product.colour} — {product.variants[selectedVariant]?.name}
            </p>
            <div className="flex gap-2">
              {product.variants.map((v, i) => (
                <button
                  key={v.name}
                  onClick={() => setSelectedVariant(i)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{
                    backgroundColor: v.color,
                    border:
                      i === selectedVariant
                        ? "2px solid var(--t-accent)"
                        : "2px solid var(--t-border)",
                    transform: i === selectedVariant ? "scale(1.1)" : "scale(1)",
                  }}
                  title={v.name}
                />
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: t.product.width, val: product.dimensions.width },
              { label: t.product.depth, val: product.dimensions.depth },
              { label: t.product.height, val: product.dimensions.height },
            ].map((d) => (
              <div
                key={d.label}
                className="rounded-xl p-3 text-center transition-colors duration-300"
                style={{ backgroundColor: "var(--t-bg)" }}
              >
                <p className="text-xs" style={{ color: "var(--t-text-dim)" }}>
                  {d.label}
                </p>
                <p className="text-sm font-semibold mt-1">{d.val} {t.product.cm}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: "var(--t-text-dim)" }}
          >
            {product.description}
          </p>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl px-4 py-3 flex gap-3 transition-colors duration-300"
        style={{
          backgroundColor: "var(--t-header-bg)",
          borderTop: "1px solid var(--t-border)",
        }}
      >
        <button
          onClick={handleAR}
          className="flex-1 font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: "var(--t-bg)",
            color: "var(--t-text)",
            border: "1px solid var(--t-border)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          {t.product.viewInAR}
        </button>
        <a
          href={product.buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: "var(--t-accent)",
            color: "var(--t-bg)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            <path d="M12 3v9M9 9l3 3 3-3" />
          </svg>
          {t.product.buyAt(product.store)}
        </a>
      </div>
    </div>
  );
}
