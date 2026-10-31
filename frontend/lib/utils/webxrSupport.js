/**
 * Detects whether the current browser/device supports WebXR AR.
 * Uses model-viewer's own capability check where possible.
 * Returns a promise that resolves to a boolean.
 */
export async function checkArSupport() {
  if (typeof window === "undefined") return false;

  // model-viewer exposes isARAvailable after it loads
  // We rely on the navigator.xr API as a reliable pre-check
  try {
    if (!("xr" in navigator)) return false;
    const supported = await navigator.xr.isSessionSupported("immersive-ar");
    return !!supported;
  } catch {
    return false;
  }
}
