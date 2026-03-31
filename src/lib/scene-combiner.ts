import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export interface SceneItem {
  id: string;
  name: string;
  modelSrc: string;
  /** X offset in meters */
  x: number;
  /** Z offset in meters */
  z: number;
  /** Rotation in degrees */
  rotation: number;
}

/**
 * Loads multiple GLB models, positions them according to the layout,
 * and exports one combined GLB blob URL for model-viewer / Quick Look.
 */
export async function combineModelsToGLB(items: SceneItem[]): Promise<string> {
  const loader = new GLTFLoader();
  const scene = new THREE.Scene();

  // Lighting
  const ambient = new THREE.AmbientLight(0xfff4e0, 0.7);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xffe8c0, 1.6);
  sunLight.position.set(-3, 5, 2);
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xd8eaff, 0.4);
  fillLight.position.set(4, 3, -1);
  scene.add(fillLight);

  // Load all models in parallel
  const loaded = await Promise.all(
    items.map(
      (item) =>
        new Promise<{ item: SceneItem; gltf: THREE.Group }>((resolve, reject) => {
          loader.load(
            item.modelSrc,
            (gltf) => resolve({ item, gltf: gltf.scene }),
            undefined,
            reject
          );
        })
    )
  );

  for (const { item, gltf } of loaded) {
    const wrapper = new THREE.Group();
    wrapper.add(gltf);

    // Apply rotation first
    gltf.rotation.y = (item.rotation * Math.PI) / 180;
    wrapper.updateMatrixWorld(true);

    // Compute bounding box after rotation
    const box = new THREE.Box3().setFromObject(wrapper);
    const center = box.getCenter(new THREE.Vector3());

    // Center horizontally, place bottom at y=0
    wrapper.position.x = -center.x + item.x;
    wrapper.position.z = -center.z + item.z;
    wrapper.position.y = -box.min.y;

    scene.add(wrapper);
  }

  // NO 3D floor — CSS handles the visual floor behind model-viewer's
  // transparent background. This avoids model-viewer auto-framing issues.

  // Export as GLB binary
  const exporter = new GLTFExporter();
  const glb = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => resolve(result as ArrayBuffer),
      reject,
      { binary: true }
    );
  });

  const blob = new Blob([glb], { type: "model/gltf-binary" });
  return URL.createObjectURL(blob);
}
