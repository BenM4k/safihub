/**
 * Lightweight inline SVG data URLs for Next.js `<Image placeholder="blur" />`
 * on low-bandwidth 3G connections in Bukavu.
 */

const shimmerSvg = `
<svg width="400" height="250" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop stop-color="#e2e8f0" offset="0%" />
      <stop stop-color="#cbd5e1" offset="50%" />
      <stop stop-color="#e2e8f0" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="url(#g)" />
</svg>`;

const avatarSvg = `
<svg width="64" height="64" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="32" fill="#e2e8f0" />
</svg>`;

function toBase64(str: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(str).toString("base64");
  }
  return window.btoa(str);
}

export const DEFAULT_IMAGE_BLUR_DATA_URL = `data:image/svg+xml;base64,${toBase64(
  shimmerSvg.trim()
)}`;

export const AVATAR_BLUR_DATA_URL = `data:image/svg+xml;base64,${toBase64(
  avatarSvg.trim()
)}`;

