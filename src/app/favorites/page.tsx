"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/components/AuthProvider";
import { products } from "@/data/products";
import Link from "next/link";

export default function FavoritesPage() {
  const { user, favorites, loading } = useAuth();
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const favProducts = products.filter((p) => favorites.includes(p.id));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(favProducts.map((p) => p.id)));
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-14 flex items-center justify-center">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{
              border: "2px solid var(--t-spinner-track)",
              borderTopColor: "var(--t-accent)",
            }}
          />
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-14 flex items-center justify-center px-4">
          <div className="text-center">
            <h1
              className="text-2xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Sign in to see favorites
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--t-text-dim)" }}>
              Save furniture you love and come back to it later.
            </p>
            <Link
              href="/auth/login"
              className="inline-block font-semibold px-8 py-3 rounded-full"
              style={{
                backgroundColor: "var(--t-accent)",
                color: "var(--t-bg)",
              }}
            >
              Sign in
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        <div className="px-4 pt-6 pb-12 max-w-7xl mx-auto">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              My Favorites
            </h1>

            {favProducts.length >= 2 && !selectMode && (
              <button
                onClick={() => {
                  setSelectMode(true);
                  selectAll();
                }}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors"
                style={{
                  backgroundColor: "var(--t-accent)",
                  color: "var(--t-bg)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                  />
                </svg>
                AR Session
              </button>
            )}
          </div>

          {/* Selection mode bar */}
          {selectMode && (
            <div
              className="flex items-center justify-between gap-3 mb-4 p-3 rounded-xl"
              style={{
                backgroundColor: "var(--t-surface)",
                border: "1px solid var(--t-border)",
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={exitSelectMode}
                  className="text-xs underline"
                  style={{ color: "var(--t-text-dim)" }}
                >
                  Cancel
                </button>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--t-text)" }}
                >
                  {selected.size} selected
                </span>
                <button
                  onClick={() =>
                    selected.size === favProducts.length
                      ? setSelected(new Set())
                      : selectAll()
                  }
                  className="text-xs underline"
                  style={{ color: "var(--t-accent)" }}
                >
                  {selected.size === favProducts.length
                    ? "Deselect all"
                    : "Select all"}
                </button>
              </div>

              <Link
                href={
                  selected.size > 0
                    ? `/ar-session?ids=${Array.from(selected).join(",")}`
                    : "#"
                }
                onClick={(e) => {
                  if (selected.size === 0) e.preventDefault();
                }}
                className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full transition-opacity"
                style={{
                  backgroundColor:
                    selected.size > 0 ? "var(--t-accent)" : "var(--t-border)",
                  color: "var(--t-bg)",
                  opacity: selected.size > 0 ? 1 : 0.5,
                  pointerEvents: selected.size > 0 ? "auto" : "none",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3l14 9-14 9V3z"
                  />
                </svg>
                Start
              </Link>
            </div>
          )}

          {favProducts.length === 0 ? (
            <div className="text-center py-16">
              <p
                className="text-sm mb-4"
                style={{ color: "var(--t-text-dim)" }}
              >
                You haven&apos;t saved any favorites yet.
              </p>
              <Link
                href="/browse"
                className="inline-block font-semibold px-6 py-2.5 rounded-full text-sm"
                style={{
                  backgroundColor: "var(--t-accent)",
                  color: "var(--t-bg)",
                }}
              >
                Browse Furniture
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
              {favProducts.map((p) => (
                <div key={p.id} className="relative">
                  {selectMode && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSelect(p.id);
                      }}
                      className="absolute top-2 left-2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        backgroundColor: selected.has(p.id)
                          ? "var(--t-accent)"
                          : "var(--t-surface)",
                        border: selected.has(p.id)
                          ? "2px solid var(--t-accent)"
                          : "2px solid var(--t-border)",
                        color: "var(--t-bg)",
                      }}
                    >
                      {selected.has(p.id) && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  )}
                  <div
                    style={{
                      opacity:
                        selectMode && !selected.has(p.id) ? 0.5 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    <ProductCard product={p} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Single-item AR session CTA when only 1 favorite */}
          {favProducts.length === 1 && (
            <div className="text-center mt-8">
              <p
                className="text-sm mb-3"
                style={{ color: "var(--t-text-dim)" }}
              >
                Add more favorites to start a multi-item AR session
              </p>
              <Link
                href="/browse"
                className="text-sm underline"
                style={{ color: "var(--t-accent)" }}
              >
                Browse more furniture
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
