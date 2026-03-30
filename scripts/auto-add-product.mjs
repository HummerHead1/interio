#!/usr/bin/env node
/**
 * 🚀 Fully automated product pipeline:
 *    Product URL → Scrape details → Meshy AI 3D → Rescale GLB → Add to products.ts
 *
 * Usage:
 *   node scripts/auto-add-product.mjs <product-url> [--category chairs|tables|sofas|beds] [--featured]
 *
 * Examples:
 *   node scripts/auto-add-product.mjs "https://www.bonami.cz/p/hneda-jidelni-zidle-addi-actona" --category chairs
 *   node scripts/auto-add-product.mjs "https://www.alza.cz/alzaergo-chair-abyss-2-cerna-d9785217.htm" --category chairs --featured
 *
 * Requires:
 *   MESHY_API_KEY in .env.local
 *
 * What it does:
 *   1. Scrapes product page for: name, price, image URL, dimensions, description, variants
 *   2. Sends product image to Meshy AI Image-to-3D API
 *   3. Polls until 3D model generation completes
 *   4. Downloads .glb to public/models/
 *   5. Rescales GLB to match real-world dimensions
 *   6. Appends product entry to src/data/products.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MODELS_DIR = path.join(ROOT, "public", "models");
const PRODUCTS_FILE = path.join(ROOT, "src", "data", "products.ts");

// ── Load env ────────────────────────────────────────────
const envPath = path.join(ROOT, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const API_KEY = process.env.MESHY_API_KEY;
const API_BASE = "https://api.meshy.ai/openapi/v1";
const POLL_INTERVAL = 10_000;
const MAX_POLLS = 120;

// ── Parse args ──────────────────────────────────────────
const args = process.argv.slice(2);
const productUrl = args.find((a) => a.startsWith("http"));
const category = args.includes("--category")
  ? args[args.indexOf("--category") + 1]
  : null;
const isFeatured = args.includes("--featured");

if (!productUrl) {
  console.error("Usage: node scripts/auto-add-product.mjs <product-url> [--category chairs|tables|sofas|beds] [--featured]");
  process.exit(1);
}
if (!API_KEY) {
  console.error("❌ MESHY_API_KEY not set in .env.local");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// ── Helpers ─────────────────────────────────────────────
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[čč]/g, "c").replace(/[řř]/g, "r").replace(/[šš]/g, "s")
    .replace(/[žž]/g, "z").replace(/[ěě]/g, "e").replace(/[ýý]/g, "y")
    .replace(/[áá]/g, "a").replace(/[íí]/g, "i").replace(/[úůú]/g, "u")
    .replace(/[óó]/g, "o").replace(/[ňň]/g, "n").replace(/[ťť]/g, "t")
    .replace(/[ďď]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function detectStore(url) {
  if (url.includes("bonami.cz")) return "Bonami";
  if (url.includes("alza.cz")) return "Alza";
  if (url.includes("xxxlutz.cz")) return "XXXLutz";
  return "Unknown";
}

function detectCategory(name, urlPath) {
  const text = (name + " " + urlPath).toLowerCase();
  if (/zidle|chair|kreslo|stolicka/.test(text)) return "chairs";
  if (/postel|bed|luzko/.test(text)) return "beds";
  if (/pohovka|sofa|sedacka|gauč/.test(text)) return "sofas";
  if (/stul|stolek|table|desk/.test(text)) return "tables";
  return "chairs"; // fallback
}

function progressBar(pct) {
  const filled = Math.round(pct / 2.5);
  return `[${"█".repeat(filled)}${"░".repeat(40 - filled)}] ${pct}%`;
}

// ── Step 1: Scrape product page ─────────────────────────
async function scrapeProduct(url) {
  console.log("\n📋 Scraping product page...");
  console.log(`   URL: ${url}\n`);

  const store = detectStore(url);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.8",
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch page (${res.status})`);
  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  let name = "";
  let price = 0;
  let imageUrl = "";
  let description = "";
  let dimensions = { width: 0, depth: 0, height: 0 };
  let variants = [];

  if (store === "Bonami") {
    // Product name
    name = doc.querySelector("h1")?.textContent?.trim() || "";

    // Price — look for structured data or price element
    const priceEl = doc.querySelector('[data-testid="product-price"], .price, [class*="price"]');
    const priceText = priceEl?.textContent || "";
    const priceMatch = priceText.replace(/\s/g, "").match(/(\d[\d\s]*)/);
    if (priceMatch) price = parseInt(priceMatch[1].replace(/\s/g, ""), 10);

    // Try JSON-LD structured data
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent);
        const product = data["@type"] === "Product" ? data : data["@graph"]?.find((g) => g["@type"] === "Product");
        if (product) {
          if (!name && product.name) name = product.name;
          if (!price && product.offers?.price) price = Math.round(parseFloat(product.offers.price));
          if (product.image) {
            const img = Array.isArray(product.image) ? product.image[0] : product.image;
            imageUrl = typeof img === "string" ? img : img?.url || "";
          }
          if (product.description) description = product.description.slice(0, 200);
        }
      } catch {}
    }

    // Image fallback — og:image or first large product image
    if (!imageUrl) {
      imageUrl = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
    }
    if (!imageUrl) {
      const imgs = doc.querySelectorAll("img[src]");
      for (const img of imgs) {
        const src = img.getAttribute("src") || "";
        if (src.includes("product") || src.includes("cdn") || (src.includes("bonami") && !src.includes("logo"))) {
          imageUrl = src.startsWith("//") ? "https:" + src : src;
          break;
        }
      }
    }

    // Dimensions from text
    const bodyText = doc.body?.textContent || "";
    const dimPatterns = [
      /(\d+)\s*[×x]\s*(\d+)\s*[×x]\s*(\d+)\s*cm/i,
      /šířka[:\s]*(\d+)\s*cm.*hloubka[:\s]*(\d+)\s*cm.*výška[:\s]*(\d+)\s*cm/is,
      /(\d+)\s*cm\s*[×x]\s*(\d+)\s*cm/i,
    ];
    for (const pat of dimPatterns) {
      const m = bodyText.match(pat);
      if (m) {
        const nums = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3] || "75")].sort((a, b) => b - a);
        dimensions = { width: nums[0], depth: nums[1], height: nums[2] };
        break;
      }
    }

  } else if (store === "Alza") {
    name = doc.querySelector("h1")?.textContent?.trim() || "";
    const priceEl = doc.querySelector('[class*="price-box__price"]');
    if (priceEl) {
      const pm = priceEl.textContent.replace(/\s/g, "").match(/(\d+)/);
      if (pm) price = parseInt(pm[1], 10);
    }
    imageUrl = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";

    // JSON-LD
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent);
        if (data["@type"] === "Product" || data.offers) {
          if (!name && data.name) name = data.name;
          if (!price && data.offers?.price) price = Math.round(parseFloat(data.offers.price));
          if (!imageUrl && data.image) imageUrl = Array.isArray(data.image) ? data.image[0] : data.image;
        }
      } catch {}
    }

  } else if (store === "XXXLutz") {
    name = doc.querySelector("h1")?.textContent?.trim() || "";
    imageUrl = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";

    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent);
        if (data["@type"] === "Product") {
          if (!name) name = data.name;
          if (data.offers?.price) price = Math.round(parseFloat(data.offers.price));
          if (data.image) imageUrl = Array.isArray(data.image) ? data.image[0] : data.image;
        }
      } catch {}
    }
  }

  // Clean up name
  name = name.replace(/\s+/g, " ").trim();
  // Shorten to reasonable length
  if (name.length > 60) {
    name = name.split(",")[0].split(" - ")[0].trim();
  }

  const detectedCat = category || detectCategory(name, url);
  const id = `${detectedCat.slice(0, -1)}-${slugify(name.split(" ").slice(0, 3).join(" "))}-${store.toLowerCase()}`;

  const result = {
    id,
    name,
    category: detectedCat,
    price,
    store,
    imageUrl,
    description: description || `${name} from ${store}.`,
    dimensions,
    variants: [{ name: "Default", color: "#808080" }],
    url: productUrl,
    featured: isFeatured,
  };

  console.log("   ✅ Scraped product data:");
  console.log(`      Name: ${result.name}`);
  console.log(`      Price: ${result.price} Kč`);
  console.log(`      Category: ${result.category}`);
  console.log(`      Dimensions: ${result.dimensions.width}×${result.dimensions.depth}×${result.dimensions.height} cm`);
  console.log(`      Image: ${result.imageUrl ? "✓ Found" : "✗ Not found"}`);
  console.log(`      ID: ${result.id}`);

  if (!result.imageUrl) {
    throw new Error("Could not find product image. Please provide image URL manually.");
  }

  return result;
}

// ── Step 2: Send to Meshy AI ────────────────────────────
async function createMeshyTask(imageUrl) {
  console.log("\n🎨 Submitting to Meshy AI...");

  const res = await fetch(`${API_BASE}/image-to-3d`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      image_url: imageUrl,
      ai_model: "meshy-6",
      topology: "triangle",
      target_polycount: 30000,
      should_texture: true,
      enable_pbr: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meshy API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const taskId = data.result;
  console.log(`   ✅ Task created: ${taskId}`);
  return taskId;
}

// ── Step 3: Poll for completion ─────────────────────────
async function pollMeshyTask(taskId) {
  console.log("\n⏳ Generating 3D model (this takes 2-5 minutes)...\n");

  for (let i = 0; i < MAX_POLLS; i++) {
    const res = await fetch(`${API_BASE}/image-to-3d/${taskId}`, { headers });
    if (!res.ok) throw new Error(`Poll failed (${res.status})`);

    const task = await res.json();
    process.stdout.write(`\r   ${progressBar(task.progress || 0)}  ${task.status}   `);

    if (task.status === "SUCCEEDED") {
      console.log("\n\n   ✅ 3D model generated!");
      return task;
    }
    if (task.status === "FAILED") {
      throw new Error(`Generation failed: ${task.task_error?.message || "unknown"}`);
    }
    if (task.status === "CANCELED") throw new Error("Task canceled");

    await sleep(POLL_INTERVAL);
  }
  throw new Error("Timed out");
}

// ── Step 4: Download GLB ────────────────────────────────
async function downloadGLB(glbUrl, outputPath) {
  console.log("\n📥 Downloading GLB...");

  const res = await fetch(glbUrl);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);

  const buffer = Buffer.from(await res.arrayBuffer());
  if (!fs.existsSync(MODELS_DIR)) fs.mkdirSync(MODELS_DIR, { recursive: true });
  fs.writeFileSync(outputPath, buffer);

  console.log(`   Saved: ${path.relative(ROOT, outputPath)} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);
}

// ── Step 5: Rescale GLB ─────────────────────────────────
function rescaleGLB(filePath, targetCm) {
  console.log(`\n📐 Rescaling to ${targetCm} cm...`);

  const buf = fs.readFileSync(filePath);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error("Invalid GLB");

  const version = buf.readUInt32LE(4);
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.slice(20, 20 + jsonLen).toString());

  let gMin = [Infinity, Infinity, Infinity];
  let gMax = [-Infinity, -Infinity, -Infinity];

  for (const mesh of gltf.meshes || []) {
    for (const prim of mesh.primitives || []) {
      const idx = prim.attributes?.POSITION;
      if (idx == null) continue;
      const acc = gltf.accessors[idx];
      if (!acc.min) continue;
      for (let i = 0; i < 3; i++) {
        gMin[i] = Math.min(gMin[i], acc.min[i]);
        gMax[i] = Math.max(gMax[i], acc.max[i]);
      }
    }
  }

  const sizes = gMax.map((v, i) => v - gMin[i]);
  const largest = Math.max(...sizes);
  const scale = (targetCm / 100) / largest;

  console.log(`   Raw: ${sizes.map((v) => (v * 100).toFixed(1)).join(" × ")} cm`);

  // Scale root nodes
  const scene = gltf.scenes[gltf.scene || 0];
  for (const ni of scene.nodes) {
    const node = gltf.nodes[ni];
    if (node.scale) node.scale = node.scale.map((s) => s * scale);
    else if (node.matrix) {
      for (const r of [0, 1, 2]) {
        node.matrix[r * 4] *= scale;
        node.matrix[r * 4 + 1] *= scale;
        node.matrix[r * 4 + 2] *= scale;
      }
    } else node.scale = [scale, scale, scale];
  }

  // Update bounds
  for (const mesh of gltf.meshes || []) {
    for (const prim of mesh.primitives || []) {
      const idx = prim.attributes?.POSITION;
      if (idx == null) continue;
      const acc = gltf.accessors[idx];
      if (acc.min) acc.min = acc.min.map((v) => v * scale);
      if (acc.max) acc.max = acc.max.map((v) => v * scale);
    }
  }

  // Rebuild
  const json = JSON.stringify(gltf);
  const padLen = Math.ceil(json.length / 4) * 4;
  const jsonBuf = Buffer.alloc(padLen, 0x20);
  Buffer.from(json).copy(jsonBuf);
  const binChunk = buf.slice(20 + jsonLen);
  const total = 12 + 8 + padLen + binChunk.length;
  const out = Buffer.alloc(total);
  out.writeUInt32LE(0x46546c67, 0);
  out.writeUInt32LE(version, 4);
  out.writeUInt32LE(total, 8);
  out.writeUInt32LE(padLen, 12);
  out.writeUInt32LE(0x4e4f534a, 16);
  jsonBuf.copy(out, 20);
  binChunk.copy(out, 20 + padLen);
  fs.writeFileSync(filePath, out);

  const final = sizes.map((v) => (v * scale * 100).toFixed(1));
  console.log(`   ✅ Final: ${final.join(" × ")} cm`);

  return final.map(Number);
}

// ── Step 6: Add to products.ts ──────────────────────────
function addToProductsFile(product, glbFilename) {
  console.log("\n📝 Adding to products.ts...");

  const content = fs.readFileSync(PRODUCTS_FILE, "utf8");

  // Find the closing of the products array
  const insertPos = content.lastIndexOf("];");
  if (insertPos === -1) throw new Error("Could not find products array end");

  const variantsStr = product.variants
    .map((v) => `      { name: "${v.name}", color: "${v.color}" }`)
    .join(",\n");

  const entry = `
  // ${product.store} – ${product.category.charAt(0).toUpperCase() + product.category.slice(1)} (auto-generated)
  {
    id: "${product.id}",
    name: "${product.name.replace(/"/g, '\\"')}",
    category: "${product.category}",
    price: ${product.price},
    currency: "CZK",
    dimensions: { width: ${product.dimensions.width}, depth: ${product.dimensions.depth}, height: ${product.dimensions.height} },
    description:
      "${product.description.replace(/"/g, '\\"').slice(0, 200)}",
    modelSrc: "/models/${glbFilename}",
    thumbnail: "",
    buyUrl: "${product.url}",
    store: "${product.store}",
    variants: [
${variantsStr},
    ],
    featured: ${product.featured},
  },`;

  const newContent = content.slice(0, insertPos) + entry + "\n" + content.slice(insertPos);
  fs.writeFileSync(PRODUCTS_FILE, newContent);

  console.log(`   ✅ Product "${product.name}" added to products.ts`);
}

// ── Main ────────────────────────────────────────────────
async function main() {
  console.log("\n" + "═".repeat(55));
  console.log("  🏠 Interio AR — Automated Product Pipeline");
  console.log("═".repeat(55));

  try {
    // 1. Scrape
    const product = await scrapeProduct(productUrl);

    // 2. Send to Meshy
    const taskId = await createMeshyTask(product.imageUrl);

    // 3. Wait for 3D model
    const task = await pollMeshyTask(taskId);
    const glbUrl = task.model_urls?.glb;
    if (!glbUrl) throw new Error("No GLB URL in result");

    // 4. Download
    const glbFilename = `${product.id}.glb`;
    const glbPath = path.join(MODELS_DIR, glbFilename);
    await downloadGLB(glbUrl, glbPath);

    // 5. Rescale — use largest known dimension
    const dims = product.dimensions;
    const largestDim = Math.max(dims.width, dims.depth, dims.height);
    if (largestDim > 0) {
      rescaleGLB(glbPath, largestDim);
    } else {
      console.log("\n⚠️  No dimensions found — skipping rescale. Run manually:");
      console.log(`   node scripts/rescale-glb.mjs ${path.relative(ROOT, glbPath)} <height_cm>`);
    }

    // 6. Add to products.ts
    addToProductsFile(product, glbFilename);

    console.log("\n" + "═".repeat(55));
    console.log("  ✅ DONE! Product fully added to Interio AR");
    console.log(`  📦 Model: public/models/${glbFilename}`);
    console.log(`  📋 ID: ${product.id}`);
    console.log("═".repeat(55) + "\n");

  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
