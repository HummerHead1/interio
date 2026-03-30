"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { theme, toggle } = useTheme();
  const { user, profile, isAdmin, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300"
      style={{
        backgroundColor: "var(--t-header-bg)",
        borderColor: "var(--t-border)",
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="transition-opacity duration-200 hover:opacity-75 flex items-baseline gap-px"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "1.2rem",
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: "var(--t-accent)", fontStyle: "italic", fontWeight: 300 }}>Inter</span>
          <span style={{ color: "var(--t-text)", fontWeight: 600 }}>io</span>
          {/* Superscript AR badge */}
          <span
            className="ml-1 font-medium"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.5rem",
              letterSpacing: "0.08em",
              color: "var(--t-accent2)",
              fontStyle: "normal",
              verticalAlign: "super",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            AR
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/browse"
            aria-label="Search furniture"
            className="w-9 h-9 rounded-full flex items-center justify-center icon-btn"
            style={{
              backgroundColor: "var(--t-surface)",
              border: "1px solid var(--t-border)",
              color: "var(--t-text-dim)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full flex items-center justify-center icon-btn"
            style={{
              backgroundColor: "var(--t-surface)",
              border: "1px solid var(--t-border)",
              color: "var(--t-text-dim)",
            }}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Auth section */}
          {loading ? (
            <div
              className="w-9 h-9 rounded-full"
              style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}
            />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase icon-btn"
                style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}
                title={profile?.display_name || user.email || ""}
              >
                {(profile?.display_name || user.email || "U").charAt(0).toUpperCase()}
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-12 w-56 rounded-xl overflow-hidden shadow-xl animate-slide-down"
                  style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: "var(--t-border)" }}>
                    <p className="text-sm font-medium truncate">{profile?.display_name || "User"}</p>
                    <p className="text-xs truncate" style={{ color: "var(--t-text-dim)" }}>{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium" style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}>Admin</span>
                    )}
                  </div>
                  <Link href="/favorites" onClick={() => setMenuOpen(false)} className="menu-item flex items-center gap-2 px-4 py-2.5 text-sm" style={{ color: "var(--t-text)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    My Favorites
                  </Link>
                  <Link href="/ar-session" onClick={() => setMenuOpen(false)} className="menu-item flex items-center gap-2 px-4 py-2.5 text-sm" style={{ color: "var(--t-text)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                    AR Session
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="menu-item flex items-center gap-2 px-4 py-2.5 text-sm" style={{ color: "var(--t-text)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="menu-item flex items-center gap-2 w-full px-4 py-2.5 text-sm border-t"
                    style={{ color: "var(--t-text-dim)", borderColor: "var(--t-border)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap btn-primary"
              style={{ backgroundColor: "var(--t-accent)", color: "var(--t-bg)" }}
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
