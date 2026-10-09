/**
 * Client-Side Image Compression & Direct Upload Utility
 *
 * Implements mobile-first client optimization for 3G networks in Bukavu:
 * 1. Resizes longest dimension to <= 1280px.
 * 2. Re-encodes as WebP (or JPEG fallback) under ~300 KB.
 * 3. Strips EXIF metadata.
 * 4. Direct upload with retry and exponential backoff.
 */

export interface CompressionOptions {
  maxDimension?: number;
  maxSizeBytes?: number;
  initialQuality?: number;
}

export type SupportedPhotoContentType = "image/webp" | "image/jpeg";

export interface CompressionResult {
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: SupportedPhotoContentType;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxDimension: 1280,
  maxSizeBytes: 300 * 1024, // 300 KB
  initialQuality: 0.75,
};

/**
 * Loads an image file or blob into an HTMLImageElement safely.
 */
function loadImageElement(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image for compression: ${err}`));
    };

    img.src = url;
  });
}

/**
 * Compresses an image on the client device.
 * Target: <= 1280px dimension and <= 300 KB size.
 */
export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const img = await loadImageElement(file);

  let { width, height } = img;

  // Scale down if either dimension exceeds maxDimension (1280px)
  if (width > opts.maxDimension || height > opts.maxDimension) {
    if (width > height) {
      height = Math.round((height * opts.maxDimension) / width);
      width = opts.maxDimension;
    } else {
      width = Math.round((width * opts.maxDimension) / height);
      height = opts.maxDimension;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create canvas 2D rendering context");
  }

  // Draw image to strip EXIF and apply resized dimensions
  ctx.drawImage(img, 0, 0, width, height);

  // Iteratively reduce quality until under maxSizeBytes (300 KB)
  let quality = opts.initialQuality;
  let bestBlob: Blob | null = null;
  const mimeType = "image/webp";

  while (quality >= 0.3) {
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, mimeType, quality)
    );

    if (blob) {
      bestBlob = blob;
      if (blob.size <= opts.maxSizeBytes) {
        break;
      }
    }

    quality -= 0.15;
  }

  // Fallback if WebP failed or wasn't generated
  if (!bestBlob) {
    bestBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas conversion to JPEG failed"))),
        "image/jpeg",
        0.7
      );
    });
  }

  return {
    blob: bestBlob,
    width,
    height,
    sizeBytes: bestBlob.size,
    mimeType: (bestBlob.type === "image/jpeg" ? "image/jpeg" : "image/webp") as SupportedPhotoContentType,
  };
}

/**
 * Uploads a binary blob directly to a presigned PUT URL with retry and exponential backoff.
 * Designed to survive flaky 3G mobile connections in Bukavu without server streaming.
 */
export async function uploadBlobWithRetry(
  uploadUrl: string,
  blob: Blob,
  options: {
    maxRetries?: number;
    timeoutMs?: number;
    onProgress?: (percent: number) => void;
  } = {}
): Promise<boolean> {
  const maxRetries = options.maxRetries ?? 3;
  const timeoutMs = options.timeoutMs ?? 30000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": blob.type || "image/webp",
        },
        body: blob,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        options.onProgress?.(100);
        return true;
      }

      console.warn(
        `Upload attempt ${attempt}/${maxRetries} failed with status: ${response.status}`
      );
    } catch (err) {
      console.warn(`Upload attempt ${attempt}/${maxRetries} error:`, err);
    }

    if (attempt < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s...
      const delayMs = Math.pow(2, attempt - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return false;
}
