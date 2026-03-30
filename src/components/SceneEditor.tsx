"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Product } from "@/types/product";

interface ItemState {
  id: string;
  name: string;
  modelSrc: string;
  /** X offset in meters */
  x: number;
  /** Z offset in meters */
  z: number;
  /** Rotation in degrees */
  rotation: number;
  /** Width in cm (from product dimensions) */
  width: number;
  /** Depth in cm (from product dimensions) */
  depth: number;
}

interface SceneEditorProps {
  products: Product[];
  onLayoutChange: (items: ItemState[]) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}

// Floor plan is 6m x 6m, rendered into a square viewport
const WORLD_SIZE = 6; // meters
const GRID_STEP = 0.5; // meters

function worldToScreen(
  wx: number,
  wz: number,
  viewSize: number
): [number, number] {
  const px = ((wx + WORLD_SIZE / 2) / WORLD_SIZE) * viewSize;
  const py = ((wz + WORLD_SIZE / 2) / WORLD_SIZE) * viewSize;
  return [px, py];
}

function screenToWorld(
  sx: number,
  sy: number,
  viewSize: number
): [number, number] {
  const wx = (sx / viewSize) * WORLD_SIZE - WORLD_SIZE / 2;
  const wz = (sy / viewSize) * WORLD_SIZE - WORLD_SIZE / 2;
  return [wx, wz];
}

export default function SceneEditor({
  products,
  onLayoutChange,
  selectedItemId,
  onSelectItem,
}: SceneEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState(300);
  const [items, setItems] = useState<ItemState[]>(() => {
    // Initial circular layout
    const count = products.length;
    return products.map((p, i) => {
      let x = 0,
        z = 0;
      if (count === 1) {
        x = 0;
        z = 0;
      } else if (count === 2) {
        x = i === 0 ? -1.2 : 1.2;
        z = 0;
      } else if (count === 3) {
        const positions: [number, number][] = [
          [-1.4, 0.5],
          [1.4, 0.5],
          [0, -1.0],
        ];
        [x, z] = positions[i];
      } else {
        const radius = 1.0 + count * 0.25;
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
      }
      return {
        id: p.id,
        name: p.name,
        modelSrc: p.modelSrc,
        x,
        z,
        rotation: 0,
        width: p.dimensions.width,
        depth: p.dimensions.depth,
      };
    });
  });

  const draggingRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<[number, number]>([0, 0]);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      setViewSize(w);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Propagate changes
  useEffect(() => {
    onLayoutChange(items);
  }, [items, onLayoutChange]);

  const getPointerPos = useCallback(
    (e: React.PointerEvent): [number, number] => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return [0, 0];
      return [e.clientX - rect.left, e.clientY - rect.top];
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, itemId: string) => {
      e.preventDefault();
      e.stopPropagation();
      draggingRef.current = itemId;
      onSelectItem(itemId);

      const [sx, sy] = getPointerPos(e);
      const item = items.find((it) => it.id === itemId)!;
      const [ix, iy] = worldToScreen(item.x, item.z, viewSize);
      dragOffsetRef.current = [sx - ix, sy - iy];

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [items, viewSize, onSelectItem, getPointerPos]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      const [sx, sy] = getPointerPos(e);
      const [ox, oy] = dragOffsetRef.current;
      const [wx, wz] = screenToWorld(sx - ox, sy - oy, viewSize);

      // Clamp to bounds
      const cx = Math.max(-WORLD_SIZE / 2 + 0.1, Math.min(WORLD_SIZE / 2 - 0.1, wx));
      const cz = Math.max(-WORLD_SIZE / 2 + 0.1, Math.min(WORLD_SIZE / 2 - 0.1, wz));

      setItems((prev) =>
        prev.map((it) =>
          it.id === draggingRef.current ? { ...it, x: cx, z: cz } : it
        )
      );
    },
    [viewSize, getPointerPos]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const handleRotate = useCallback(
    (itemId: string, delta: number) => {
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? { ...it, rotation: (it.rotation + delta) % 360 }
            : it
        )
      );
    },
    []
  );

  const handleBackgroundClick = useCallback(() => {
    if (!draggingRef.current) {
      onSelectItem(null);
    }
  }, [onSelectItem]);

  // Scale: cm to screen px
  const cmToPx = viewSize / (WORLD_SIZE * 100);

  return (
    <div className="w-full" ref={containerRef}>
      <svg
        width={viewSize}
        height={viewSize}
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        className="rounded-2xl touch-none"
        style={{
          backgroundColor: "var(--t-bg)",
          border: "1px solid var(--t-border)",
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleBackgroundClick}
      >
        {/* Grid */}
        {Array.from(
          { length: Math.floor(WORLD_SIZE / GRID_STEP) + 1 },
          (_, i) => {
            const pos = (i * GRID_STEP * viewSize) / WORLD_SIZE;
            return (
              <g key={i}>
                <line
                  x1={pos}
                  y1={0}
                  x2={pos}
                  y2={viewSize}
                  stroke="var(--t-border)"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
                <line
                  x1={0}
                  y1={pos}
                  x2={viewSize}
                  y2={pos}
                  stroke="var(--t-border)"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              </g>
            );
          }
        )}

        {/* Center crosshair */}
        <circle
          cx={viewSize / 2}
          cy={viewSize / 2}
          r={3}
          fill="var(--t-border)"
          opacity={0.4}
        />

        {/* Scale indicator */}
        <text
          x={8}
          y={viewSize - 8}
          fontSize={10}
          fill="var(--t-text-dim)"
          opacity={0.5}
        >
          Grid: 50 cm
        </text>

        {/* Items */}
        {items.map((item) => {
          const [cx, cy] = worldToScreen(item.x, item.z, viewSize);
          const w = Math.max(item.width * cmToPx, 20);
          const d = Math.max(item.depth * cmToPx, 20);
          const isSelected = selectedItemId === item.id;

          return (
            <g
              key={item.id}
              transform={`translate(${cx}, ${cy}) rotate(${item.rotation})`}
              style={{ cursor: "grab" }}
              onPointerDown={(e) => handlePointerDown(e, item.id)}
            >
              {/* Selection ring */}
              {isSelected && (
                <rect
                  x={-w / 2 - 4}
                  y={-d / 2 - 4}
                  width={w + 8}
                  height={d + 8}
                  rx={6}
                  fill="none"
                  stroke="var(--t-accent)"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
              )}

              {/* Item rectangle */}
              <rect
                x={-w / 2}
                y={-d / 2}
                width={w}
                height={d}
                rx={4}
                fill={isSelected ? "var(--t-accent)" : "var(--t-surface)"}
                fillOpacity={isSelected ? 0.3 : 0.8}
                stroke={isSelected ? "var(--t-accent)" : "var(--t-border)"}
                strokeWidth={isSelected ? 2 : 1}
              />

              {/* Direction indicator (front face) */}
              <line
                x1={-w / 4}
                y1={-d / 2}
                x2={w / 4}
                y2={-d / 2}
                stroke="var(--t-accent)"
                strokeWidth={3}
                strokeLinecap="round"
              />

              {/* Label */}
              <text
                x={0}
                y={3}
                textAnchor="middle"
                fontSize={Math.min(10, w / 6)}
                fill="var(--t-text)"
                fontWeight={600}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {item.name.length > 12
                  ? item.name.slice(0, 10) + "…"
                  : item.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Rotation controls for selected item */}
      {selectedItemId && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={() => handleRotate(selectedItemId, -45)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "var(--t-surface)",
              border: "1px solid var(--t-border)",
              color: "var(--t-text-dim)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 2v6h6" />
              <path d="M2.66 15.57a10 10 0 10.57-8.38" />
            </svg>
          </button>
          <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "var(--t-bg)", color: "var(--t-text-dim)", border: "1px solid var(--t-border)" }}>
            {items.find((it) => it.id === selectedItemId)?.rotation ?? 0}°
          </span>
          <button
            onClick={() => handleRotate(selectedItemId, 45)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "var(--t-surface)",
              border: "1px solid var(--t-border)",
              color: "var(--t-text-dim)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6" />
              <path d="M21.34 15.57a10 10 0 11-.57-8.38" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export type { ItemState };
