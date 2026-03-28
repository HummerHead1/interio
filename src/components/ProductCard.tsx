"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Product } from "@/types/product";

const ModelViewer = dynamic(() => import("./ModelViewer"), { ssr: false });

export default function ProductCard({ product }: { product: Product }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: "var(--t-surface)",
          border: "1px solid var(--t-border)",
          boxShadow: "0 2px 12px var(--t-card-shadow)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--t-card-hover-border)";
          e.currentTarget.style.boxShadow = "0 8px 32px var(--t-card-shadow)";
          e.currentTarget.style.transform = "translateY(-4px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--t-border)";
          e.currentTarget.style.boxShadow = "0 2px 12px var(--t-card-shadow)";
          e.currentTarget.style.transform = "translateY(0)";
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
        </div>

        {/* Info */}
        <div className="p-4">
          <p
            className="text-xs font-medium mb-1"
            style={{ color: "var(--t-accent)" }}
          >
            {product.store}
          </p>
          <h3
            className="text-base font-semibold transition-colors"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "var(--t-text)",
            }}
          >
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span
              className="text-lg font-bold"
              style={{ color: "var(--t-text)" }}
            >
              {product.currency === "CZK"
                ? `${product.price.toLocaleString()} Kč`
                : `€${(product.price / 100).toFixed(0)}`}
            </span>
            <div className="flex gap-1">
              {product.variants.map((v) => (
                <span
                  key={v.name}
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: v.color,
                    border: "1px solid var(--t-border)",
                  }}
                />
              ))}
            </div>
          </div>
          <p
            className="text-xs mt-2"
            style={{ color: "var(--t-text-dim)" }}
          >
            {product.dimensions.width} x {product.dimensions.depth} x{" "}
            {product.dimensions.height} cm
          </p>
        </div>
      </div>
    </Link>
  );
}
