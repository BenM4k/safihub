import { describe, expect, it } from "vitest";
import { normalizeStorageUrl } from "../storage-url";

describe("normalizeStorageUrl", () => {
  it("returns null for null, undefined, or empty values", () => {
    expect(normalizeStorageUrl(null)).toBeNull();
    expect(normalizeStorageUrl(undefined)).toBeNull();
    expect(normalizeStorageUrl("")).toBeNull();
    expect(normalizeStorageUrl("   ")).toBeNull();
  });

  it("preserves valid relative /api/storage URLs", () => {
    const url = "/api/storage/houses/h_1/cover_123.webp";
    expect(normalizeStorageUrl(url)).toBe(url);
  });

  it("preserves blob and data URLs", () => {
    expect(normalizeStorageUrl("blob:http://localhost:3000/123")).toBe("blob:http://localhost:3000/123");
    expect(normalizeStorageUrl("data:image/webp;base64,abc")).toBe("data:image/webp;base64,abc");
  });

  it("rewrites broken safihub.r2.dev URLs to /api/storage/houses/...", () => {
    const broken = "https://safihub.r2.dev/houses/afb3e600-33b2-4ab6-aea3-086856cbef10/cover_1793196304807_htv1pee.webp";
    expect(normalizeStorageUrl(broken)).toBe(
      "/api/storage/houses/afb3e600-33b2-4ab6-aea3-086856cbef10/cover_1793196304807_htv1pee.webp"
    );
  });

  it("rewrites broken storage.safihub.cd URLs to /api/storage/houses/...", () => {
    const broken = "https://storage.safihub.cd/safihub/houses/h_123/logo_456.webp";
    expect(normalizeStorageUrl(broken)).toBe("/api/storage/houses/h_123/logo_456.webp");
  });

  it("rewrites photos.safihub.cd URLs to /api/storage/houses/...", () => {
    const broken = "https://photos.safihub.cd/houses/h_789/cover.png";
    expect(normalizeStorageUrl(broken)).toBe("/api/storage/houses/h_789/cover.png");
  });

  it("preserves external third-party URLs like Unsplash", () => {
    const unsplash = "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format";
    expect(normalizeStorageUrl(unsplash)).toBe(unsplash);
  });
});
