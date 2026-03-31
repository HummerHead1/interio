"use client";

import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts } from "@/data/products";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function Home() {
  const featured = getFeaturedProducts();
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        {/* Hero */}
        <section className="relative px-4 pt-20 pb-16 text-center overflow-hidden">
          {/* Background room photo */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url('/hero-bg.avif')",
              backgroundSize: "cover",
              backgroundPosition: "center 40%",
              opacity: 0.14,
            }}
          />

          {/* Vignette — bright centre, dark edges — showroom spot effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, var(--t-bg) 100%)",
            }}
          />

          {/* Top & bottom fades */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, var(--t-bg) 0%, transparent 18%, transparent 78%, var(--t-bg) 100%)",
            }}
          />

          {/* Subtle geometric accent — thin horizontal rule above headline */}
          <div
            className="relative mx-auto mb-6"
            style={{
              width: "32px",
              height: "1px",
              background: "var(--t-accent)",
              opacity: 0,
              animation: "lineGrow 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards",
              transformOrigin: "center",
            }}
          />

          <p
            className="relative text-xs font-medium uppercase mb-5 animate-hero-eyebrow"
            style={{
              color: "var(--t-accent)",
              letterSpacing: "0.2em",
              animationDelay: "0.2s",
              opacity: 0,
            }}
          >
            {t.hero.eyebrow}
          </p>

          <h1
            className="relative font-bold leading-none mb-6 animate-hero-headline"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2.6rem, 7vw, 5rem)",
              letterSpacing: "-0.02em",
              animationDelay: "0.35s",
              opacity: 0,
            }}
          >
            {t.hero.headline1}
            <br />
            <span
              style={{
                color: "var(--t-accent)",
                fontStyle: "italic",
                fontWeight: 300,
              }}
            >
              {t.hero.headline2}
            </span>
          </h1>

          <p
            className="relative max-w-sm mx-auto mb-10 leading-relaxed animate-hero-rise"
            style={{
              color: "var(--t-text-dim)",
              fontSize: "0.95rem",
              animationDelay: "0.55s",
              opacity: 0,
            }}
          >
            {t.hero.subtitle}
          </p>

          <div
            className="relative flex items-center justify-center gap-3 flex-wrap animate-hero-rise"
            style={{ animationDelay: "0.7s", opacity: 0 }}
          >
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 font-medium px-7 py-3 rounded-full btn-primary"
              style={{
                backgroundColor: "var(--t-accent)",
                color: "var(--t-bg)",
                fontSize: "0.9rem",
                letterSpacing: "0.01em",
              }}
            >
              {t.hero.cta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="inline-block font-medium px-6 py-3 rounded-full btn-outline"
              style={{
                border: "1px solid var(--t-border)",
                color: "var(--t-text-dim)",
                fontSize: "0.9rem",
              }}
            >
              {t.hero.howItWorks}
            </a>
          </div>

          {/* Store names — minimal separator dots */}
          <div
            className="relative flex items-center justify-center gap-4 mt-12 animate-hero-rise"
            style={{ animationDelay: "0.85s", opacity: 0 }}
          >
            {["Alza", "Bonami", "XXXLutz"].map((store, i) => (
              <span key={store} className="flex items-center gap-4">
                <span
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: "var(--t-text-dim)", opacity: 0.5 }}
                >
                  {store}
                </span>
                {i < 2 && (
                  <span
                    style={{
                      display: "block",
                      width: "3px",
                      height: "3px",
                      borderRadius: "50%",
                      backgroundColor: "var(--t-border)",
                    }}
                  />
                )}
              </span>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section className="px-4 pb-14 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p
                className="text-xs font-medium uppercase tracking-widest mb-2"
                style={{ color: "var(--t-accent2)", letterSpacing: "0.18em" }}
              >
                {t.featured.eyebrow}
              </p>
              <h2
                className="font-semibold leading-tight"
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
                  letterSpacing: "-0.01em",
                }}
              >
                {t.featured.title}
              </h2>
            </div>
            <Link
              href="/browse"
              className="text-sm font-medium link-hover flex items-center gap-1.5"
              style={{ color: "var(--t-text-dim)" }}
            >
              {t.featured.viewAll}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="px-4 py-20 transition-colors duration-300 scroll-mt-16 relative overflow-hidden"
          style={{ backgroundColor: "var(--t-surface)" }}
        >
          {/* Architectural grid accent — very faint */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(var(--t-border) 1px, transparent 1px),
                linear-gradient(90deg, var(--t-border) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
              opacity: 0.35,
              maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
            }}
          />

          <div className="max-w-4xl mx-auto relative">
            {/* Section header */}
            <div className="text-center mb-14">
              <p
                className="text-xs font-medium uppercase tracking-widest mb-3"
                style={{ color: "var(--t-accent2)", letterSpacing: "0.18em" }}
              >
                {t.howItWorks.eyebrow}
              </p>
              <h2
                className="font-semibold leading-tight"
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                  letterSpacing: "-0.015em",
                }}
              >
                {t.howItWorks.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ backgroundColor: "var(--t-border)" }}>
              {[
                {
                  step: "01",
                  title: t.howItWorks.steps[0].title,
                  desc: t.howItWorks.steps[0].desc,
                  icon: (
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  ),
                },
                {
                  step: "02",
                  title: t.howItWorks.steps[1].title,
                  desc: t.howItWorks.steps[1].desc,
                  icon: (
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  ),
                },
                {
                  step: "03",
                  title: t.howItWorks.steps[2].title,
                  desc: t.howItWorks.steps[2].desc,
                  icon: (
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  ),
                },
              ].map((s, i) => (
                <div
                  key={s.step}
                  className="group animate-step-reveal"
                  style={{
                    backgroundColor: "var(--t-surface)",
                    padding: "2rem 1.75rem",
                    animationDelay: `${0.1 + i * 0.12}s`,
                    opacity: 0,
                  }}
                >
                  {/* Step number + icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <span
                      className="font-bold tabular-nums leading-none"
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "2.5rem",
                        color: "var(--t-border)",
                        letterSpacing: "-0.03em",
                        lineHeight: 1,
                        transition: "color 0.3s ease",
                      }}
                    >
                      {s.step}
                    </span>
                    <div
                      className="transition-all duration-300 group-hover:scale-110"
                      style={{ color: "var(--t-accent)" }}
                    >
                      {s.icon}
                    </div>
                  </div>

                  {/* Accent line */}
                  <div
                    className="mb-4"
                    style={{
                      width: "24px",
                      height: "1.5px",
                      background: "var(--t-accent)",
                      opacity: 0.5,
                      transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
                    }}
                  />

                  <p
                    className="font-semibold mb-2 transition-colors duration-200"
                    style={{ fontSize: "1rem", letterSpacing: "-0.01em" }}
                  >
                    {s.title}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--t-text-dim)" }}
                  >
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 text-center">
          <p
            className="text-xs font-medium uppercase tracking-widest mb-4"
            style={{ color: "var(--t-accent2)", letterSpacing: "0.18em" }}
          >
            {t.cta.eyebrow}
          </p>
          <h2
            className="font-semibold mb-4 leading-tight"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              letterSpacing: "-0.015em",
            }}
          >
            {t.cta.title}
          </h2>
          <p
            className="max-w-xs mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--t-text-dim)", fontSize: "0.9rem" }}
          >
            {t.cta.subtitle}
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 font-medium px-8 py-3 rounded-full btn-primary"
            style={{
              backgroundColor: "var(--t-accent)",
              color: "var(--t-bg)",
              fontSize: "0.9rem",
            }}
          >
            {t.cta.button}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      </main>

      <footer
        className="text-center text-sm py-6 transition-colors duration-300 space-y-1.5"
        style={{
          color: "var(--t-text-dim)",
          borderTop: "1px solid var(--t-border)",
        }}
      >
        <p>{t.footer.tagline}</p>
        <p style={{ opacity: 0.6, fontSize: "0.75rem" }}>{t.footer.credits}</p>
      </footer>
    </>
  );
}
