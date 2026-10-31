"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Camera, Loader2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { imageSearch } from "@/lib/api/searchApi";
import { ProductGrid } from "@/components/product/ProductGrid";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Modal for image-based product search.
 * Accepts upload or camera capture, sends to /api/search/image,
 * renders results in the shared ProductGrid component.
 */
export function ImageSearchModal({ isOpen, onClose, onAddToCart }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null); // null = not yet searched

  const resetState = useCallback(() => {
    setPreview(null);
    setResults(null);
    setIsSearching(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  // Client-side resize before upload to control payload size
  const resizeImage = useCallback((file) => {
    return new Promise((resolve) => {
      const MAX_DIM = 1024;
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
          "image/jpeg",
          0.85
        );
      };
      img.src = url;
    });
  }, []);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Unsupported format. Use JPEG, PNG, or WEBP.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast.error("Image too large. Maximum size is 8MB.");
        return;
      }

      // Show preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setResults(null);

      setIsSearching(true);
      try {
        const resized = await resizeImage(file);
        const data = await imageSearch(resized);
        setResults(data.products ?? []);
      } catch {
        toast.error("Image search failed. Please try again.");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [resizeImage]
  );

  const handleInputChange = (e) => {
    handleFile(e.target.files?.[0]);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: "var(--z-modal)" }}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search by image"
            className="fixed inset-x-4 top-[5%] bottom-[5%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl bg-[var(--color-surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] flex flex-col overflow-hidden"
            style={{ zIndex: "var(--z-modal)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Search by Image
              </h2>
              <button
                onClick={handleClose}
                aria-label="Close image search"
                className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] transition-colors duration-[var(--transition-fast)]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Upload zone */}
              <div
                className="relative border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 flex flex-col items-center gap-3 text-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors duration-[var(--transition-base)]"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload an image to search"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Search preview"
                    className="max-h-48 rounded-[var(--radius-md)] object-contain"
                  />
                ) : (
                  <>
                    <Upload size={32} className="text-[var(--color-text-muted)]" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">
                        Upload a photo
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        JPEG, PNG, or WEBP · max 8MB
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Camera + file buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute("capture", "environment");
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors duration-[var(--transition-fast)]"
                >
                  <Camera size={16} aria-hidden="true" />
                  Use camera
                </button>
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.removeAttribute("capture");
                    fileInputRef.current?.click();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors duration-[var(--transition-fast)]"
                >
                  <Upload size={16} aria-hidden="true" />
                  From gallery
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
                onChange={handleInputChange}
              />

              {/* Results */}
              {isSearching && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" aria-hidden="true" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Searching the catalog…
                  </p>
                </div>
              )}

              {!isSearching && results !== null && results.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <ImageOff size={32} className="text-[var(--color-text-muted)]" aria-hidden="true" />
                  <p className="font-medium text-[var(--color-text-secondary)]">
                    No close matches found
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Try a clearer photo or use the text search bar
                  </p>
                </div>
              )}

              {!isSearching && results !== null && results.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                    {results.length} similar product{results.length !== 1 ? "s" : ""} found
                  </p>
                  <ProductGrid
                    products={results}
                    isLoading={false}
                    onAddToCart={(p) => {
                      onAddToCart?.(p);
                      handleClose();
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
