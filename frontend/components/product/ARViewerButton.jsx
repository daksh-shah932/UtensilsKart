"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Cuboid, Loader2 } from "lucide-react";
import { checkArSupport } from "@/lib/utils/webxrSupport";
import { ARFallbackComparison } from "./ARFallbackComparison";

const AR_ELIGIBLE_CATEGORIES = ["cookware", "storage"];

/**
 * AR Size & Scale Visualizer button.
 *
 * Only renders when BOTH are true:
 *   1. product.arModelUrl is present
 *   2. product.category is cookware or storage
 *
 * On click:
 *   - AR supported  → lazy-loads model-viewer and opens AR mode
 *   - AR not supported → shows ARFallbackComparison static size reference
 *
 * model-viewer bundle is loaded only when the button is clicked (not on PDP load).
 */
export function ARViewerButton({ product }) {
  const { arModelUrl, category, name } = product;

  const [arSupported, setArSupported] = useState(null); // null = checking
  const [isOpen, setIsOpen] = useState(false);
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);
  const [isLoadingBundle, setIsLoadingBundle] = useState(false);
  const modelViewerRef = useRef(null);

  // Feature-detect AR support on mount
  useEffect(() => {
    checkArSupport().then((supported) => setArSupported(supported));
  }, []);

  // Don't render if:
  // - No AR model URL
  // - Category not eligible
  // - Still checking (avoids dead-end button flash)
  if (!arModelUrl || !AR_ELIGIBLE_CATEGORIES.includes(category)) return null;
  if (arSupported === null) return null; // suppress until detection is complete

  const handleClick = async () => {
    if (!arSupported) {
      setIsOpen(true);
      return;
    }

    // Lazy-load @google/model-viewer bundle on first click
    if (!modelViewerLoaded) {
      setIsLoadingBundle(true);
      try {
        await import("@google/model-viewer");
        setModelViewerLoaded(true);
      } catch {
        // If model-viewer fails to load, fall back to static comparison
        setArSupported(false);
        setIsOpen(true);
        return;
      } finally {
        setIsLoadingBundle(false);
      }
    }

    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoadingBundle}
        className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold hover:bg-[var(--color-primary-light)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-[var(--transition-fast)]"
        aria-label="View product in your kitchen using AR"
      >
        {isLoadingBundle ? (
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        ) : (
          <Cuboid size={18} aria-hidden="true" />
        )}
        {isLoadingBundle ? "Loading AR…" : "View in your kitchen"}
      </button>

      {/* AR Viewer panel */}
      {isOpen && arSupported && modelViewerLoaded && (
        <div className="mt-6 rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
          <div className="relative" style={{ height: "400px" }}>
            {/* model-viewer is a custom element registered by the package */}
            {/* eslint-disable-next-line react/no-unknown-property */}
            <model-viewer
              ref={modelViewerRef}
              src={arModelUrl}
              alt={`3D model of ${name}`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: "100%", height: "100%" }}
              onArStatus={(e) => {
                if (e.detail.status === "failed") {
                  setArSupported(false);
                }
              }}
            >
              {/* Diameter/height reference overlay */}
              <div
                slot="poster"
                className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 text-white text-xs rounded-[var(--radius-md)]"
                aria-hidden="true"
              >
                {product.capacity ? `Capacity: ${product.capacity}` : "Tap to view in AR"}
              </div>
            </model-viewer>
          </div>

          <div className="px-4 py-3 flex items-center justify-between border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)]">
              Tap the AR icon inside the viewer to place on a real surface
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-[var(--color-primary)] hover:underline font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Fallback for non-AR browsers */}
      {isOpen && !arSupported && (
        <ARFallbackComparison product={product} />
      )}
    </>
  );
}
