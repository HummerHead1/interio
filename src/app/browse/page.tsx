"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory, searchProducts } from "@/data/products";
import { useLanguage } from "@/lib/i18n";

const stores = ["All", "Alza", "Bonami", "XXXLutz"];

export default function BrowsePage() {
  return (
    <Suspense>
      <BrowseContent />
    </Suspense>
  );
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [store, setStore] = useState("All");

  // Read store from URL query param on mount
  useEffect(() => {
    const storeParam = searchParams.get("store");
    if (storeParam && stores.includes(storeParam)) {
      setStore(storeParam);
    }
  }, [searchParams]);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">(
    "default"
  );

  const categories = [
    { key: "all", label: t.browse.categories.all },
    { key: "chairs", label: t.browse.categories.chairs },
    { key: "sofas", label: t.browse.categories.sofas },
    { key: "beds", label: t.browse.categories.beds },
    { key: "tables", label: t.browse.categories.tables },
  ];

  // If searching, search takes priority over category filter
  let filtered = search.trim()
    ? searchProducts(search)
    : getProductsByCategory(category);
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
            {t.browse.title}
          </h1>

          {/* Search bar */}
          <div className="relative mb-4">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--t-text-dim)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value.trim()) setCategory("all");
              }}
              placeholder={t.browse.searchPlaceholder}
              className="w-full pl-11 pr-10 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder:opacity-50"
              style={{
                backgroundColor: "var(--t-surface)",
                color: "var(--t-text)",
                border: "1px solid var(--t-border)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--t-accent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--t-border)";
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: "var(--t-surface-light)",
                  color: "var(--t-text-dim)",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap filter-pill"
                data-active={category === c.key}
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
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap filter-pill"
                data-active={store === s}
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
                {s === "All" ? t.browse.stores.All : s}
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
              <option value="default">{t.browse.sortDefault}</option>
              <option value="price-asc">{t.browse.sortPriceAsc}</option>
              <option value="price-desc">{t.browse.sortPriceDesc}</option>
            </select>
          </div>

          {/* Active filter summary */}
          {(category !== "all" || store !== "All" || search.trim()) && (
            <div className="flex items-center gap-2 pb-3 flex-wrap">
              <span
                className="text-xs"
                style={{ color: "var(--t-text-dim)" }}
              >
                {t.browse.products(filtered.length)}
              </span>
              {search.trim() && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--t-surface-light)",
                    color: "var(--t-accent)",
                  }}
                >
                  &ldquo;{search.trim()}&rdquo;
                </span>
              )}
              {category !== "all" && !search.trim() && (
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
                  setSearch("");
                  setCategory("all");
                  setStore("All");
                  setSortBy("default");
                }}
                className="text-xs underline ml-1"
                style={{ color: "var(--t-text-dim)" }}
              >
                {t.browse.clear}
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
                {t.browse.noProducts}
              </p>
              <button
                onClick={() => {
                  setCategory("all");
                  setStore("All");
                }}
                className="text-sm underline mt-2"
                style={{ color: "var(--t-accent)" }}
              >
                {t.browse.clearFilters}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
