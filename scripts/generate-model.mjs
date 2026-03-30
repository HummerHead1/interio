#!/usr/bin/env node
/**
 * Automated Image → 3D model pipeline using Meshy AI API.
 *
 * Usage:
 *   node scripts/generate-model.mjs <product-id> <image-url> <height-cm>
 *
 * Example:
 *   node scripts/generate-model.mjs chair-addi-bonami https://i.imgur.com/xyz.jpg 76
 *
 * Requires MESHY_API_KEY environment variable.
 * Set it in .env.local or export it:
 *   export MESHY_API_KEY=your_key_here
 *
 * What it does:
 *   1. Submits image to Meshy AI Image-to-3D API
 *   2. Polls until model is ready (shows progress)
 *   3. Downloads the .glb file to public/models/<product-id>.glb
 *   4. Rescales GLB to match real-world dimensions
 *   5. Reports final dimensions
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.join(__dirname, "..", "public", "models");

// ── Config ──────────────────────────────────────────────
const API_BASE = "https://api.meshy.ai/openapi/v1";
const POLL_INTERVAL_MS = 10_000; // 10 seconds
const MAX_POLLS = 120; // 20 minutes max

// ── Args ────────────────────────────────────────────────
const [, , productId, imageUrl, heightCm] = process.argv;

if (!productId || !imageUrl || !heightCm) {
  console.error(`
  Usage: node scripts/generate-model.mjs <product-id> <image-url> <height-cm>

  Arguments:
    product-id   The product ID (e.g. "chair-addi-bonami")
    image-url    Public URL of the product image
    height-cm    Real-world height of the largest dimension in cm

  Environment:
    MESHY_API_KEY  Your Meshy AI API key (required)
  `);
  process.exit(1);
}

// Try loading from .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const API_KEY = process.env.MESHY_API_KEY;
if (!API_KEY) {
  console.error("❌ MESHY_API_KEY not set. Add it to .env.local or export it.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

const targetHeight = parseFloat(heightCm) / 100; // meters
const outputPath = path.join(MODELS_DIR, `${productId}.glb`);

// ── Helpers ─────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function progressBar(pct) {
  const filled = Math.round(pct / 2.5);
  const empty = 40 - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${pct}%`;
}

// ── Step 1: Create task ─────────────────────────────────
async function createTask() {
  console.log(`\n🎨 Submitting image to Meshy AI...`);
  console.log(`   Image: ${imageUrl}`);
  console.log(`   Model: meshy-6 | triangle | 30k polys\n`);

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
    throw new Error(`Failed to create task (${res.status}): ${err}`);
  }

  const data = await res.json();
  console.log(`✅ Task created: ${data.result}`);
  return data.result; // task ID
}

// ── Step 2: Poll for completion ─────────────────────────
async function pollTask(taskId) {
  console.log(`\n⏳ Waiting for model generation...\n`);

  for (let i = 0; i < MAX_POLLS; i++) {
    const res = await fetch(`${API_BASE}/image-to-3d/${taskId}`, { headers });
    if (!res.ok) throw new Error(`Poll failed (${res.status})`);

    const task = await res.json();
    const { status, progress } = task;

    process.stdout.write(`\r   ${progressBar(progress || 0)}  Status: ${status}   `);

    if (status === "SUCCEEDED") {
      console.log("\n\n✅ Model generated successfully!");
      return task;
    }

    if (status === "FAILED") {
      throw new Error(`Task failed: ${task.task_error?.message || "unknown error"}`);
    }

    if (status === "CANCELED") {
      throw new Error("Task was canceled");
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("Timed out waiting for model generation");
}

// ── Step 3: Download GLB ────────────────────────────────
async function downloadGLB(glbUrl) {
  console.log(`\n📥 Downloading GLB...`);

  const res = await fetch(glbUrl);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);

  const buffer = Buffer.from(await res.arrayBuffer());

  // Ensure models directory exists
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
  console.log(`   Saved: ${outputPath} (${sizeMB} MB)`);
  return buffer;
}

// ── Step 4: Rescale GLB ─────────────────────────────────
function rescaleGLB() {
  console.log(`\n📐 Rescaling to ${heightCm} cm...`);

  const buf = fs.readFileSync(outputPath);

  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546c67) throw new Error("Not a valid GLB file");

  const version = buf.readUInt32LE(4);
  const jsonChunkLen = buf.readUInt32LE(12);
  const jsonStr = buf.slice(20, 20 + jsonChunkLen).toString("utf8");
  const gltf = JSON.parse(jsonStr);

  // Find bounding box
  let globalMin = [Infinity, Infinity, Infinity];
  let globalMax = [-Infinity, -Infinity, -Infinity];

  for (const mesh of gltf.meshes || []) {
    for (const prim of mesh.primitives || []) {
      const posIdx = prim.attributes?.POSITION;
      if (posIdx == null) continue;
      const acc = gltf.accessors[posIdx];
      if (!acc.min || !acc.max) continue;
      for (let i = 0; i < 3; i++) {
        globalMin[i] = Math.min(globalMin[i], acc.min[i]);
        globalMax[i] = Math.max(globalMax[i], acc.max[i]);
      }
    }
  }

  const sizes = globalMax.map((v, i) => v - globalMin[i]);
  const currentMax = Math.max(...sizes);
  const scaleFactor = targetHeight / currentMax;

  console.log(`   Raw size: ${sizes.map((v) => (v * 100).toFixed(1)).join(" × ")} cm`);
  console.log(`   Scale factor: ${scaleFactor.toFixed(4)}`);

  // Apply scale to root nodes
  const scene = gltf.scenes[gltf.scene || 0];
  for (const nodeIdx of scene.nodes) {
    const node = gltf.nodes[nodeIdx];
    if (node.scale) {
      node.scale = node.scale.map((s) => s * scaleFactor);
    } else if (node.matrix) {
      for (const r of [0, 1, 2]) {
        node.matrix[r * 4 + 0] *= scaleFactor;
        node.matrix[r * 4 + 1] *= scaleFactor;
        node.matrix[r * 4 + 2] *= scaleFactor;
      }
    } else {
      node.scale = [scaleFactor, scaleFactor, scaleFactor];
    }
  }

  // Update accessor bounds
  for (const mesh of gltf.meshes || []) {
    for (const prim of mesh.primitives || []) {
      const posIdx = prim.attributes?.POSITION;
      if (posIdx == null) continue;
      const acc = gltf.accessors[posIdx];
      if (acc.min) acc.min = acc.min.map((v) => v * scaleFactor);
      if (acc.max) acc.max = acc.max.map((v) => v * scaleFactor);
    }
  }

  // Rebuild GLB
  const newJsonStr = JSON.stringify(gltf);
  const paddedLen = Math.ceil(newJsonStr.length / 4) * 4;
  const newJsonBuf = Buffer.alloc(paddedLen, 0x20);
  Buffer.from(newJsonStr, "utf8").copy(newJsonBuf);

  const binChunkOffset = 20 + jsonChunkLen;
  const binChunk = buf.slice(binChunkOffset);

  const newTotal = 12 + 8 + paddedLen + binChunk.length;
  const out = Buffer.alloc(newTotal);

  out.writeUInt32LE(0x46546c67, 0);
  out.writeUInt32LE(version, 4);
  out.writeUInt32LE(newTotal, 8);
  out.writeUInt32LE(paddedLen, 12);
  out.writeUInt32LE(0x4e4f534a, 16);
  newJsonBuf.copy(out, 20);
  binChunk.copy(out, 20 + paddedLen);

  fs.writeFileSync(outputPath, out);

  const newSizes = sizes.map((v) => (v * scaleFactor * 100).toFixed(1));
  console.log(`   ✅ Final size: ${newSizes.join(" × ")} cm`);
}

// ── Main ────────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log(`  Meshy AI → GLB Pipeline`);
  console.log(`  Product: ${productId}`);
  console.log(`  Target:  ${heightCm} cm (largest dimension)`);
  console.log("═══════════════════════════════════════════════");

  try {
    const taskId = await createTask();
    const task = await pollTask(taskId);

    const glbUrl = task.model_urls?.glb;
    if (!glbUrl) throw new Error("No GLB URL in task result");

    await downloadGLB(glbUrl);
    rescaleGLB();

    console.log(`\n${"═".repeat(47)}`);
    console.log(`  ✅ Done! Model saved to:`);
    console.log(`  ${outputPath}`);
    console.log(`${"═".repeat(47)}\n`);

    // Also download thumbnail if available
    if (task.thumbnail_url) {
      console.log(`  📸 Thumbnail: ${task.thumbnail_url}`);
    }
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
