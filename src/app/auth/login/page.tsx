"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/browse");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: "var(--t-bg)" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/hero-bg.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, var(--t-bg) 75%)",
        }}
      />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl p-8"
        style={{
          backgroundColor: "var(--t-surface)",
          border: "1px solid var(--t-border)",
        }}
      >
        <Link
          href="/"
          className="block text-center text-2xl font-bold mb-8"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          <span style={{ color: "var(--t-accent)" }}>Inter</span>
          <span style={{ color: "var(--t-text)" }}>io</span>
        </Link>

        <h1
          className="text-xl font-semibold text-center mb-6"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {t.login.title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs mb-1.5 uppercase tracking-wider"
              style={{ color: "var(--t-text-dim)" }}
            >
              {t.login.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: "var(--t-bg)",
                color: "var(--t-text)",
                border: "1px solid var(--t-border)",
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs mb-1.5 uppercase tracking-wider"
              style={{ color: "var(--t-text-dim)" }}
            >
              {t.login.passwordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: "var(--t-bg)",
                color: "var(--t-text)",
                border: "1px solid var(--t-border)",
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full font-semibold text-sm transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: "var(--t-accent)",
              color: "var(--t-bg)",
            }}
          >
            {loading ? t.login.submitting : t.login.submit}
          </button>
        </form>

        <p
          className="text-sm text-center mt-6"
          style={{ color: "var(--t-text-dim)" }}
        >
          {t.login.noAccount}{" "}
          <Link
            href="/auth/signup"
            className="underline"
            style={{ color: "var(--t-accent)" }}
          >
            {t.login.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}
