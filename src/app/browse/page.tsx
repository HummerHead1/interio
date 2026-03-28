"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory } from "@/data/products";

const categories = [
  { key: "all", label: "All" },
  { key: "chairs", label: "Chairs" },
  { key: "sofas", label: "Sofas" },
  { key: "beds", label: "Beds" },
  { key: "tables", label: "Tables" },
];

const stores = ["All", "IKEA", "Bonami", "Alza"];

export default function BrowsePage() {
  const [category, setCategory] = useState("all");
  const [store, setStore] = useState("All");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">(
    "default"
  );

  let filtered = getProductsByCategory(category);
  if (store !== "All") filtered = filtered.filter((p) => p.store === store);
  if (sortBy === "price-asc")
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc")
    filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        <div className="px-4 pt-6 pb-2 max-w-7xl mx-auto">
          <h1
            className="text-3xl font-bold mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Browse Furniture
          </h1>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200"
                style={{
                  backgroundColor:
                    category === c.key ? "var(--t-accent)" : "var(--t-surface)",
                  color:
                    category === c.key ? "var(--t-bg)" : "var(--t-text-dim)",
                  border:
                    category === c.key
                      ? "1px solid transparent"
                      : "1px solid var(--t-border)",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Store filter + Sort */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar items-center">
            {stores.map((s) => (
              <button
                key={s}
                onClick={() => setStore(s)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200"
                style={{
                  backgroundColor:
                    store === s
                      ? "var(--t-accent-light)"
                      : "var(--t-surface)",
                  color:
                    store === s ? "var(--t-bg)" : "var(--t-text-dim)",
                  border:
                    store === s
                      ? "1px solid transparent"
                      : "1px solid var(--t-border)",
                  opacity: store === s ? 1 : 0.85,
                }}
              >
                {s}
              </button>
            ))}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="ml-auto px-3 py-2 rounded-full text-sm outline-none cursor-pointer"
              style={{
                backgroundColor: "var(--t-surface)",
                color: "var(--t-text-dim)",
                border: "1px solid var(--t-border)",
              }}
            >
              <option value="default">Sort</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Active filter summary */}
          {(category !== "all" || store !== "All") && (
            <div className="flex items-center gap-2 pb-3">
              <span
                className="text-xs"
                style={{ color: "var(--t-text-dim)" }}
              >
                {filtered.length} product{filtered.length !== 1 && "s"}
              </span>
              {category !== "all" && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--t-surface-light)",
                    color: "var(--t-accent)",
                  }}
                >
                  {categories.find((c) => c.key === category)?.label}
                </span>
              )}
              {store !== "All" && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--t-surface-light)",
                    color: "var(--t-accent)",
                  }}
                >
                  {store}
                </span>
              )}
              <button
                onClick={() => {
                  setCategory("all");
                  setStore("All");
                  setSortBy("default");
                }}
                className="text-xs underline ml-1"
                style={{ color: "var(--t-text-dim)" }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="px-4 pb-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p style={{ color: "var(--t-text-dim)" }}>
                No products match your filters.
              </p>
              <button
                onClick={() => {
                  setCategory("all");
                  setStore("All");
                }}
                className="text-sm underline mt-2"
                style={{ color: "var(--t-accent)" }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
