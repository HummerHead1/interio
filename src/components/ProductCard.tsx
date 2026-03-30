"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Product } from "@/types/product";
import FavoriteButton from "./FavoriteButton";

const ModelViewer = dynamic(() => import("./ModelViewer"), { ssr: false });

export default function ProductCard({ product }: { product: Product }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div
        className="relative rounded-2xl overflow-hidden product-card"
        style={{
          backgroundColor: "var(--t-surface)",
          border: "1px solid var(--t-border)",
          boxShadow: "0 2px 12px var(--t-card-shadow)",
        }}
      >
        {/* 3D Preview */}
        <div
          className="relative aspect-square"
          style={{ backgroundColor: "var(--t-model-bg)" }}
        >
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-8 h-8 rounded-full animate-spin"
                style={{
                  border: "2px solid var(--t-spinner-track)",
                  borderTopColor: "var(--t-accent)",
                }}
              />
            </div>
          )}
          <ModelViewer
            src={product.modelSrc}
            alt={product.name}
            onLoad={() => setLoaded(true)}
          />
          {/* Favorite button */}
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton productId={product.id} size="sm" />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 pt-3">
          {/* Store tag + color swatches row */}
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--t-accent2)", letterSpacing: "0.12em", fontSize: "0.65rem" }}
            >
              {product.store}
            </p>
            <div className="flex gap-1.5">
              {product.variants.map((v) => (
                <span
                  key={v.name}
                  className="w-2.5 h-2.5 rounded-full transition-transform duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: v.color,
                    border: "1px solid var(--t-border)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Thin rule */}
          <div
            className="mb-3"
            style={{
              height: "1px",
              background: "var(--t-border)",
              opacity: 0.6,
            }}
          />

          <h3
            className="font-medium leading-snug transition-colors duration-200 group-hover:text-[var(--t-accent)] mb-3"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "var(--t-text)",
              fontSize: "0.95rem",
              letterSpacing: "-0.01em",
            }}
          >
            {product.name}
          </h3>

          <div className="flex items-end justify-between">
            <span
              className="font-semibold tabular-nums"
              style={{
                color: "var(--t-text)",
                fontSize: "1.05rem",
                letterSpacing: "-0.02em",
              }}
            >
              {product.currency === "CZK"
                ? `${product.price.toLocaleString()} Kč`
                : `€${(product.price / 100).toFixed(0)}`}
            </span>
            <p
              className="text-xs leading-tight text-right"
              style={{ color: "var(--t-text-dim)", fontSize: "0.65rem" }}
            >
              {product.dimensions.width}&thinsp;×&thinsp;{product.dimensions.depth}&thinsp;×&thinsp;{product.dimensions.height}&thinsp;cm
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
