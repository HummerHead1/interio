"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface PlacedItem {
  id: string;
  name: string;
  model: THREE.Group;
}

interface ARMultiViewerProps {
  /** Currently queued model URL to place next */
  currentModelSrc: string | null;
  /** Fires after user taps to place the current model */
  onItemPlaced: () => void;
  /** List of already-placed items (for UI reference) */
  placedItems: PlacedItem[];
  onPlacedItemsChange: (items: PlacedItem[]) => void;
  /** Current product name (for label) */
  currentName: string;
  currentId: string;
}

export default function ARMultiViewer({
  currentModelSrc,
  onItemPlaced,
  placedItems,
  onPlacedItemsChange,
  currentName,
  currentId,
}: ARMultiViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sessionRef = useRef<XRSession | null>(null);
  const hitTestSourceRef = useRef<XRHitTestSource | null>(null);
  const reticleRef = useRef<THREE.Mesh | null>(null);
  const pendingModelRef = useRef<THREE.Group | null>(null);
  const placedItemsRef = useRef<PlacedItem[]>(placedItems);
  const loaderRef = useRef<GLTFLoader>(new GLTFLoader());
  const rafRef = useRef<number>(0);

  const [arSupported, setArSupported] = useState<boolean | null>(null);
  const [arActive, setArActive] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [reticleVisible, setReticleVisible] = useState(false);

  // Keep ref in sync
  placedItemsRef.current = placedItems;

  // Check AR support
  useEffect(() => {
    if (typeof navigator !== "undefined" && "xr" in navigator) {
      (navigator as Navigator & { xr: XRSystem }).xr
        ?.isSessionSupported("immersive-ar")
        .then((supported) => setArSupported(supported))
        .catch(() => setArSupported(false));
    } else {
      setArSupported(false);
    }
  }, []);

  // Load pending model when currentModelSrc changes
  useEffect(() => {
    if (!currentModelSrc) {
      pendingModelRef.current = null;
      return;
    }
    setLoadingModel(true);
    loaderRef.current.load(
      currentModelSrc,
      (gltf) => {
        const model = gltf.scene;
        // Normalize scale — fit into ~0.5m bounding box for preview
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const scale = 0.5 / maxDim;
          model.scale.setScalar(scale);
        }
        model.visible = false; // Hidden until placed
        pendingModelRef.current = model;
        setLoadingModel(false);
      },
      undefined,
      () => {
        setLoadingModel(false);
        pendingModelRef.current = null;
      }
    );
  }, [currentModelSrc]);

  const startAR = useCallback(async () => {
    if (!containerRef.current) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );
    cameraRef.current = camera;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(1, 2, 1);
    scene.add(directional);

    // Reticle (placement indicator ring)
    const reticleGeom = new THREE.RingGeometry(0.06, 0.08, 32).rotateX(
      -Math.PI / 2
    );
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xd4a574,
      side: THREE.DoubleSide,
    });
    const reticle = new THREE.Mesh(reticleGeom, reticleMat);
    reticle.visible = false;
    reticle.matrixAutoUpdate = false;
    scene.add(reticle);
    reticleRef.current = reticle;

    // Re-add any previously placed models
    for (const item of placedItemsRef.current) {
      scene.add(item.model);
    }

    // Start XR session
    try {
      const xrSession = await (
        navigator as Navigator & { xr: XRSystem }
      ).xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay"],
        domOverlay: containerRef.current
          ? { root: containerRef.current }
          : undefined,
      });

      sessionRef.current = xrSession;
      renderer.xr.setReferenceSpaceType("local");
      await renderer.xr.setSession(xrSession);
      setArActive(true);

      // Hit test source
      const refSpace = await xrSession.requestReferenceSpace("viewer");
      const hitTestSource = await xrSession.requestHitTestSource!({
        space: refSpace,
      });
      hitTestSourceRef.current = hitTestSource ?? null;

      xrSession.addEventListener("end", () => {
        setArActive(false);
        hitTestSourceRef.current = null;
        sessionRef.current = null;
        if (rendererRef.current && containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
          rendererRef.current.dispose();
          rendererRef.current = null;
        }
      });

      // Select event = tap to place
      xrSession.addEventListener("select", () => {
        const reticle = reticleRef.current;
        const pending = pendingModelRef.current;
        if (!reticle || !reticle.visible || !pending || !sceneRef.current)
          return;

        // Clone and place model at reticle position
        const placed = pending.clone();
        placed.visible = true;
        placed.position.setFromMatrixPosition(reticle.matrix);
        // Match reticle rotation
        const quat = new THREE.Quaternion();
        reticle.matrix.decompose(new THREE.Vector3(), quat, new THREE.Vector3());
        placed.quaternion.copy(quat);

        sceneRef.current.add(placed);

        const newItem: PlacedItem = {
          id: currentId,
          name: currentName,
          model: placed,
        };
        const updated = [...placedItemsRef.current, newItem];
        onPlacedItemsChange(updated);
        onItemPlaced();
      });

      // Render loop
      renderer.setAnimationLoop((_, frame) => {
        if (!frame) return;
        const refSpace = renderer.xr.getReferenceSpace();
        if (!refSpace || !hitTestSourceRef.current) return;

        const hitResults = frame.getHitTestResults(hitTestSourceRef.current);
        if (hitResults.length > 0) {
          const hit = hitResults[0];
          const pose = hit.getPose(refSpace);
          if (pose && reticleRef.current) {
            reticleRef.current.visible = true;
            reticleRef.current.matrix.fromArray(pose.transform.matrix);
            setReticleVisible(true);
          }
        } else if (reticleRef.current) {
          reticleRef.current.visible = false;
          setReticleVisible(false);
        }

        renderer.render(scene, camera);
      });
    } catch (err) {
      console.error("Failed to start AR session:", err);
      setArActive(false);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    }
  }, [currentId, currentName, onItemPlaced, onPlacedItemsChange]);

  const endAR = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.end();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.end().catch(() => {});
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Pre-AR state: instructions */}
      {!arActive && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center px-6">
            {arSupported === false && (
              <>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    backgroundColor: "var(--t-surface)",
                    border: "1px solid var(--t-border)",
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    style={{ color: "var(--t-text-dim)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: "var(--t-text)" }}
                >
                  AR not supported on this device
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--t-text-dim)" }}
                >
                  Multi-object AR requires an ARCore-enabled Android device
                  with Chrome, or an iOS device with Safari.
                </p>
              </>
            )}

            {arSupported === true && (
              <>
                <button
                  onClick={startAR}
                  disabled={loadingModel}
                  className="font-semibold px-8 py-3.5 rounded-full transition-all disabled:opacity-50 text-base"
                  style={{
                    backgroundColor: "var(--t-accent)",
                    color: "var(--t-bg)",
                  }}
                >
                  {loadingModel ? "Loading model..." : "Start AR Session"}
                </button>
                <p
                  className="text-xs mt-4 max-w-xs mx-auto"
                  style={{ color: "var(--t-text-dim)" }}
                >
                  Point your camera at the floor. Tap to place each item.
                  All items stay in the scene together.
                </p>
              </>
            )}

            {arSupported === null && (
              <div
                className="w-8 h-8 rounded-full animate-spin mx-auto"
                style={{
                  border: "2px solid var(--t-spinner-track)",
                  borderTopColor: "var(--t-accent)",
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* AR overlay UI */}
      {arActive && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {/* Crosshair / placement hint */}
          {!reticleVisible && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <p
                className="text-sm font-medium px-4 py-2 rounded-full"
                style={{
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "#fff",
                }}
              >
                Point at a flat surface...
              </p>
            </div>
          )}

          {reticleVisible && currentModelSrc && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8">
              <p
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "#fff",
                }}
              >
                Tap to place {currentName}
              </p>
            </div>
          )}

          {/* Current item info + exit button */}
          <div className="pointer-events-auto px-4 pb-4">
            <div
              className="rounded-2xl p-4 backdrop-blur-xl"
              style={{
                backgroundColor: "rgba(0,0,0,0.7)",
              }}
            >
              {currentModelSrc ? (
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white text-sm font-semibold">
                      Placing: {currentName}
                    </p>
                    <p className="text-white/60 text-xs">
                      {placedItems.length} item
                      {placedItems.length !== 1 ? "s" : ""} in scene
                    </p>
                  </div>
                  {loadingModel && (
                    <div
                      className="w-6 h-6 rounded-full animate-spin"
                      style={{
                        border: "2px solid rgba(255,255,255,0.2)",
                        borderTopColor: "#D4A574",
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="mb-3">
                  <p className="text-white text-sm font-semibold">
                    All items placed!
                  </p>
                  <p className="text-white/60 text-xs">
                    {placedItems.length} item
                    {placedItems.length !== 1 ? "s" : ""} in your room
                  </p>
                </div>
              )}

              {/* Placed items pills */}
              {placedItems.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {placedItems.map((item, i) => (
                    <span
                      key={`${item.id}-${i}`}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: "rgba(212, 165, 116, 0.25)",
                        color: "#D4A574",
                      }}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={endAR}
                className="w-full py-2.5 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Exit AR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
