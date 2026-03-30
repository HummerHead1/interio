"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If email confirmation is disabled, user is signed in immediately
    if (data.session) {
      router.push("/browse");
      router.refresh();
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden"
        style={{ backgroundColor: "var(--t-bg)" }}
      >
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
          className="relative z-10 w-full max-w-sm rounded-2xl p-8 text-center"
          style={{
            backgroundColor: "var(--t-surface)",
            border: "1px solid var(--t-border)",
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
            style={{
              backgroundColor: "var(--t-bg)",
              border: "1px solid var(--t-border)",
            }}
          >
            ✓
          </div>
          <h2 className="text-lg font-semibold mb-2">Check your email</h2>
          <p className="text-sm mb-6" style={{ color: "var(--t-text-dim)" }}>
            We sent a confirmation link to <strong>{email}</strong>
          </p>
          <Link
            href="/auth/login"
            className="text-sm underline"
            style={{ color: "var(--t-accent)" }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
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
          Create account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs mb-1.5 uppercase tracking-wider"
              style={{ color: "var(--t-text-dim)" }}
            >
              Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
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
              Email
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
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p
          className="text-sm text-center mt-6"
          style={{ color: "var(--t-text-dim)" }}
        >
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="underline"
            style={{ color: "var(--t-accent)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
