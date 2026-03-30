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
  const ambient = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambient);

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

  const floorThickness = 0.02; // 2cm thick slab

  // Place furniture so bottom sits on top of floor (y = floorThickness)
  for (const { item, gltf } of loaded) {
    const box = new THREE.Box3().setFromObject(gltf);
    const center = box.getCenter(new THREE.Vector3());
    gltf.position.x -= center.x;
    gltf.position.z -= center.z;
    // Place bottom of model on top of floor surface
    gltf.position.y = floorThickness - box.min.y;

    const radians = (item.rotation * Math.PI) / 180;
    gltf.rotation.y = radians;

    gltf.position.x += item.x;
    gltf.position.z += item.z;

    scene.add(gltf);
  }

  // --- Wooden floor slab ---
  const furnitureBounds = new THREE.Box3();
  for (const child of scene.children) {
    if (child instanceof THREE.Light) continue;
    furnitureBounds.expandByObject(child);
  }
  const fSize = furnitureBounds.getSize(new THREE.Vector3());
  const fCenter = furnitureBounds.getCenter(new THREE.Vector3());

  const floorPad = 0.6;
  const floorW = fSize.x + floorPad * 2;
  const floorD = fSize.z + floorPad * 2;

  const floorGeo = new THREE.BoxGeometry(floorW, floorThickness, floorD);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x8B6040,
    roughness: 0.7,
    metalness: 0.02,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);

  // Floor bottom at y=0, top at y=floorThickness — furniture sits on top
  floor.position.set(fCenter.x, floorThickness / 2, fCenter.z);
  scene.add(floor);

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
