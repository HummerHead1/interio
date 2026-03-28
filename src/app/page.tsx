import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts } from "@/data/products";
import Link from "next/link";

export default function Home() {
  const featured = getFeaturedProducts();

  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        {/* Hero */}
        <section className="relative px-4 pt-16 pb-12 text-center overflow-hidden">
          {/* Subtle gradient background */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, var(--t-accent) 0%, transparent 60%)",
            }}
          />

          <p
            className="relative text-sm font-medium tracking-widest uppercase mb-4 animate-in"
            style={{ color: "var(--t-accent)" }}
          >
            Augmented Reality Furniture
          </p>
          <h1
            className="relative text-4xl md:text-6xl font-bold leading-tight mb-5 animate-in"
            style={{
              fontFamily: "var(--font-playfair)",
              animationDelay: "0.1s",
            }}
          >
            See it in
            <br />
            <span style={{ color: "var(--t-accent)" }}>your room</span>
          </h1>
          <p
            className="relative max-w-md mx-auto mb-8 animate-in"
            style={{ color: "var(--t-text-dim)", animationDelay: "0.2s" }}
          >
            Browse furniture from IKEA, Bonami & Alza in 3D. Place it in your
            space with AR, then buy from your favourite store.
          </p>
          <div
            className="relative flex items-center justify-center gap-3 animate-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href="/browse"
              className="inline-block font-semibold px-8 py-3 rounded-full transition-colors"
              style={{
                backgroundColor: "var(--t-accent)",
                color: "var(--t-bg)",
              }}
            >
              Browse Furniture
            </Link>
            <a
              href="#how-it-works"
              className="inline-block font-medium px-6 py-3 rounded-full transition-colors"
              style={{
                border: "1px solid var(--t-border)",
                color: "var(--t-text-dim)",
              }}
            >
              How it works
            </a>
          </div>

          {/* Store logos */}
          <div
            className="relative flex items-center justify-center gap-6 mt-10 animate-in"
            style={{ animationDelay: "0.4s" }}
          >
            {["IKEA", "Bonami", "Alza"].map((store) => (
              <span
                key={store}
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: "var(--t-text-dim)", opacity: 0.6 }}
              >
                {store}
              </span>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section className="px-4 pb-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Featured
            </h2>
            <Link
              href="/browse"
              className="text-sm font-medium transition-colors"
              style={{ color: "var(--t-accent)" }}
            >
              View all
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
          className="px-4 py-16 transition-colors duration-300 scroll-mt-16"
          style={{ backgroundColor: "var(--t-surface)" }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-2xl font-semibold mb-10"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Browse",
                  desc: "Explore furniture from Czech stores in interactive 3D",
                  icon: (
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  ),
                },
                {
                  step: "2",
                  title: "Place in AR",
                  desc: "Point your camera and see how furniture looks in your actual room",
                  icon: (
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  ),
                },
                {
                  step: "3",
                  title: "Buy",
                  desc: "Go directly to the store page and complete your purchase",
                  icon: (
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: "var(--t-bg)",
                      color: "var(--t-accent)",
                      border: "1px solid var(--t-border)",
                    }}
                  >
                    {s.icon}
                  </div>
                  <p className="font-semibold mb-1">{s.title}</p>
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
        <section className="px-4 py-16 text-center">
          <h2
            className="text-2xl md:text-3xl font-semibold mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Ready to redesign your space?
          </h2>
          <p
            className="max-w-md mx-auto mb-8"
            style={{ color: "var(--t-text-dim)" }}
          >
            No app download needed. Works right in your browser.
          </p>
          <Link
            href="/browse"
            className="inline-block font-semibold px-8 py-3 rounded-full transition-colors"
            style={{
              backgroundColor: "var(--t-accent)",
              color: "var(--t-bg)",
            }}
          >
            Start Browsing
          </Link>
        </section>
      </main>

      <footer
        className="text-center text-xs py-6 transition-colors duration-300"
        style={{
          color: "var(--t-text-dim)",
          borderTop: "1px solid var(--t-border)",
        }}
      >
        Interio — AR Furniture Placement Prototype
      </footer>
    </>
  );
}
