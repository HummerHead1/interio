"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { hapticSuccess, hapticLight } from "@/lib/haptics";

export default function FavoriteButton({
  productId,
  size = "md",
}: {
  productId: string;
  size?: "sm" | "md";
}) {
  const { user, favorites, toggleFavorite } = useAuth();
  const router = useRouter();
  const isFav = favorites.includes(productId);
  const px = size === "sm" ? 16 : 22;
  const [animating, setAnimating] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setAnimating(true);
    toggleFavorite(productId);
    isFav ? hapticLight() : hapticSuccess();
    setTimeout(() => setAnimating(false), 350);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      className={`transition-all duration-200 hover:scale-125 active:scale-90 ${animating ? "animate-heart-pop" : ""}`}
      style={{ color: isFav ? "#ef4444" : "var(--t-text-dim)" }}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill={isFav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
