#!/usr/bin/env node
/**
 * 🚀 Batch add multiple products from a list of URLs.
 *
 * Usage:
 *   node scripts/batch-add-products.mjs
 *
 * Edit the PRODUCTS array below with your product URLs.
 * Each entry needs: url, category, and optionally featured flag.
 * The script runs them sequentially (Meshy has rate limits).
 */

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, "auto-add-product.mjs");

// ════════════════════════════════════════════════════════
// 📝 EDIT THIS LIST — add your product URLs here
// ════════════════════════════════════════════════════════
const PRODUCTS = [
  // Alza
  // { url: "https://www.alza.cz/alzaergo-chair-abyss-2-cerna-d9785217.htm", category: "chairs", featured: true },

  // Bonami
  // { url: "https://www.bonami.cz/p/hneda-jidelni-zidle-addi-actona", category: "chairs", featured: true },

  // XXXLutz
  // { url: "https://www.xxxlutz.cz/p/some-product", category: "sofas" },
];

if (PRODUCTS.length === 0) {
  console.log(`
  📝 No products defined!

  Edit scripts/batch-add-products.mjs and fill in the PRODUCTS array.
  Each entry needs:
    { url: "https://...", category: "chairs|tables|sofas|beds", featured?: true }

  Then run: node scripts/batch-add-products.mjs
  `);
  process.exit(0);
}

console.log(`\n🏠 Batch processing ${PRODUCTS.length} products...\n`);

let success = 0;
let failed = 0;

for (let i = 0; i < PRODUCTS.length; i++) {
  const p = PRODUCTS[i];
  console.log(`\n${"─".repeat(55)}`);
  console.log(`  [${i + 1}/${PRODUCTS.length}] ${p.url}`);
  console.log(`${"─".repeat(55)}`);

  const args = [`"${p.url}"`, `--category ${p.category}`];
  if (p.featured) args.push("--featured");

  try {
    execSync(`node "${SCRIPT}" ${args.join(" ")}`, {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    success++;
  } catch (err) {
    console.error(`\n❌ Failed: ${p.url}`);
    failed++;
  }

  // Rate limit buffer between requests
  if (i < PRODUCTS.length - 1) {
    console.log("\n⏳ Waiting 5s before next product (rate limit)...");
    await new Promise((r) => setTimeout(r, 5000));
  }
}

console.log(`\n${"═".repeat(55)}`);
console.log(`  📊 Results: ${success} succeeded, ${failed} failed out of ${PRODUCTS.length}`);
console.log(`${"═".repeat(55)}\n`);
