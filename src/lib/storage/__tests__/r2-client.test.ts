import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getWorkerR2Binding,
  getSignedUploadUrl,
  getSignedDownloadUrl,
} from "../r2-client";

describe("Cloudflare R2 Storage Client (vinext & Workers native bindings)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("safely handles getWorkerR2Binding returning null outside workerd", async () => {
    const binding = await getWorkerR2Binding();
    expect(binding).toBeNull();
  });

  it("generates deterministic mock URLs when credentials are not configured", async () => {
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;

    const uploadUrl = await getSignedUploadUrl("test/image.webp", "image/webp", 300);
    expect(uploadUrl).toContain("https://storage.safihub.cd/safihub/test/image.webp");
    expect(uploadUrl).toContain("mock_upload_sig");

    const downloadUrl = await getSignedDownloadUrl("test/image.webp", 900);
    expect(downloadUrl).toContain("https://storage.safihub.cd/safihub/test/image.webp");
    expect(downloadUrl).toContain("mock_download_sig");
  });

  it("generates Cloudflare R2 presigned URLs when R2 credentials are configured", async () => {
    process.env.R2_ACCOUNT_ID = "82208d8e184619f1940ea0ab4b6de537";
    process.env.R2_ACCESS_KEY_ID = "dummy_r2_access_key_id_value";
    process.env.R2_SECRET_ACCESS_KEY = "dummy_r2_secret_access_key_value_1234567890";
    process.env.R2_BUCKET_NAME = "safihub";
    process.env.R2_ENDPOINT = "https://82208d8e184619f1940ea0ab4b6de537.r2.cloudflarestorage.com";

    // Dynamic import to pick up fresh env
    const r2Mod = await import("../r2-client");
    const uploadUrl = await r2Mod.getSignedUploadUrl("orders/ord_1/pickup/photo.webp", "image/webp", 300);

    expect(uploadUrl).toContain("82208d8e184619f1940ea0ab4b6de537.r2.cloudflarestorage.com");
    expect(uploadUrl).toContain("orders/ord_1/pickup/photo.webp");
    expect(uploadUrl).toContain("X-Amz-Signature");

    const downloadUrl = await r2Mod.getSignedDownloadUrl("orders/ord_1/pickup/photo.webp", 900);
    expect(downloadUrl).toContain("82208d8e184619f1940ea0ab4b6de537.r2.cloudflarestorage.com");
    expect(downloadUrl).toContain("X-Amz-Signature");
  });

  it("deletes objects and returns boolean status", async () => {
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;

    const r2Mod = await import("../r2-client");
    const result = await r2Mod.deleteStorageObject("test/delete.webp");
    expect(result).toBe(true);
  });

  it("returns null metadata when object does not exist or unconfigured", async () => {
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;

    const r2Mod = await import("../r2-client");
    const meta = await r2Mod.headStorageObject("test/missing.webp");
    expect(meta).toBeNull();
  });
});
