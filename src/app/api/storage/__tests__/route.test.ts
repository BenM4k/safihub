import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "../[...key]/route";

vi.mock("@/lib/storage/r2-client", () => ({
  getStorageObject: vi.fn(async (key: string) => {
    if (key === "houses/h_1/cover.webp") {
      return {
        body: new Uint8Array([1, 2, 3, 4]),
        contentType: "image/webp",
        etag: '"etag123"',
        size: 4,
      };
    }
    return null;
  }),
}));

describe("/api/storage/[...key] route handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if key is empty", async () => {
    const res = await GET(new Request("http://localhost:3000/api/storage"), {
      params: Promise.resolve({ key: [] }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 on path traversal attempts", async () => {
    const res = await GET(new Request("http://localhost:3000/api/storage"), {
      params: Promise.resolve({ key: ["houses", "..", "secret"] }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 403 on disallowed root directories", async () => {
    const res = await GET(new Request("http://localhost:3000/api/storage"), {
      params: Promise.resolve({ key: ["private-stuff", "doc.pdf"] }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 403 on orders/ keys until authenticated session checks are implemented", async () => {
    const res = await GET(new Request("http://localhost:3000/api/storage"), {
      params: Promise.resolve({ key: ["orders", "ord_123", "pickup.webp"] }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 if object does not exist in R2", async () => {
    const res = await GET(new Request("http://localhost:3000/api/storage"), {
      params: Promise.resolve({ key: ["houses", "missing.webp"] }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 200 with proper headers for existing public house asset", async () => {
    const res = await GET(new Request("http://localhost:3000/api/storage"), {
      params: Promise.resolve({ key: ["houses", "h_1", "cover.webp"] }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/webp");
    expect(res.headers.get("Content-Length")).toBe("4");
    expect(res.headers.get("Cache-Control")).toContain("public");
    expect(res.headers.get("ETag")).toBe('"etag123"');
  });

  it("returns 304 Not Modified when client provides matching ETag", async () => {
    const req = new Request("http://localhost:3000/api/storage", {
      headers: { "if-none-match": '"etag123"' },
    });
    const res = await GET(req, {
      params: Promise.resolve({ key: ["houses", "h_1", "cover.webp"] }),
    });

    expect(res.status).toBe(304);
  });
});
