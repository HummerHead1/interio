/**
 * Rescale a GLB model so its largest dimension matches the real-world size.
 *
 * Usage:
 *   node scripts/rescale-glb.mjs <input.glb> <realHeight_cm> [output.glb]
 *
 * Example:
 *   node scripts/rescale-glb.mjs public/models/chair-addi-bonami.glb 76
 *   → overwrites the file so the model is exactly 76 cm tall
 */

import fs from "fs";
import path from "path";

const [,, inputPath, realHeightCm, outputPath] = process.argv;

if (!inputPath || !realHeightCm) {
  console.error("Usage: node rescale-glb.mjs <input.glb> <realHeight_cm> [output.glb]");
  process.exit(1);
}

const targetHeight = parseFloat(realHeightCm) / 100; // convert cm → meters
const buf = fs.readFileSync(inputPath);

// Parse GLB structure
const magic = buf.readUInt32LE(0);
if (magic !== 0x46546C67) { console.error("Not a valid GLB file"); process.exit(1); }

const version = buf.readUInt32LE(4);
const totalLen = buf.readUInt32LE(8);

// Chunk 0: JSON
const jsonChunkLen = buf.readUInt32LE(12);
const jsonChunkType = buf.readUInt32LE(16);
const jsonStr = buf.slice(20, 20 + jsonChunkLen).toString("utf8");
const gltf = JSON.parse(jsonStr);

// Find bounding box from position accessors
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
const currentHeight = Math.max(...sizes); // largest axis = height
const scaleFactor = targetHeight / currentHeight;

console.log(`Current bounding box: ${sizes.map(v => (v * 100).toFixed(1)).join(" × ")} cm`);
console.log(`Largest axis: ${(currentHeight * 100).toFixed(1)} cm`);
console.log(`Target height: ${(targetHeight * 100).toFixed(1)} cm`);
console.log(`Scale factor: ${scaleFactor.toFixed(6)}`);

// Apply scale to root scene nodes
const scene = gltf.scenes[gltf.scene || 0];
for (const nodeIdx of scene.nodes) {
  const node = gltf.nodes[nodeIdx];
  if (node.scale) {
    node.scale = node.scale.map(s => s * scaleFactor);
  } else if (node.matrix) {
    // Scale the matrix
    node.matrix[0] *= scaleFactor;
    node.matrix[1] *= scaleFactor;
    node.matrix[2] *= scaleFactor;
    node.matrix[4] *= scaleFactor;
    node.matrix[5] *= scaleFactor;
    node.matrix[6] *= scaleFactor;
    node.matrix[8] *= scaleFactor;
    node.matrix[9] *= scaleFactor;
    node.matrix[10] *= scaleFactor;
  } else {
    node.scale = [scaleFactor, scaleFactor, scaleFactor];
  }
}

// Also update accessor min/max so viewers know the correct bounds
for (const mesh of gltf.meshes || []) {
  for (const prim of mesh.primitives || []) {
    const posIdx = prim.attributes?.POSITION;
    if (posIdx == null) continue;
    const acc = gltf.accessors[posIdx];
    if (acc.min) acc.min = acc.min.map(v => v * scaleFactor);
    if (acc.max) acc.max = acc.max.map(v => v * scaleFactor);
  }
}

// Re-serialize JSON chunk
const newJsonStr = JSON.stringify(gltf);
// Pad to 4-byte boundary with spaces
const paddedLen = Math.ceil((newJsonStr.length) / 4) * 4;
const newJsonBuf = Buffer.alloc(paddedLen, 0x20); // pad with spaces
Buffer.from(newJsonStr, "utf8").copy(newJsonBuf);

// Rebuild GLB
const binChunkOffset = 20 + jsonChunkLen;
const binChunk = buf.slice(binChunkOffset); // includes chunk header + data

const newTotal = 12 + 8 + paddedLen + binChunk.length;
const out = Buffer.alloc(newTotal);

// Header
out.writeUInt32LE(0x46546C67, 0); // magic
out.writeUInt32LE(version, 4);
out.writeUInt32LE(newTotal, 8);

// JSON chunk
out.writeUInt32LE(paddedLen, 12);
out.writeUInt32LE(0x4E4F534A, 16); // "JSON"
newJsonBuf.copy(out, 20);

// Binary chunk (copy as-is)
binChunk.copy(out, 20 + paddedLen);

const dest = outputPath || inputPath;
fs.writeFileSync(dest, out);

const newSizes = sizes.map(v => (v * scaleFactor * 100).toFixed(1));
console.log(`\n✅ Saved: ${dest}`);
console.log(`New dimensions: ${newSizes.join(" × ")} cm`);
