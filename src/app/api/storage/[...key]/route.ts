import { getStorageObject } from "@/lib/storage/r2-client";

interface RouteParams {
  params: Promise<{
    key: string[];
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const resolvedParams = await params;
  const keySegments = resolvedParams.key;

  if (!keySegments || keySegments.length === 0) {
    return new Response("Storage key required", { status: 400 });
  }

  // Prevent path traversal
  for (const segment of keySegments) {
    if (segment === ".." || segment === "." || segment.includes("\\")) {
      return new Response("Invalid key segment", { status: 400 });
    }
  }

  const storageKey = keySegments.join("/");

  // Public assets (laundry house covers and logos)
  // Private order verification/delivery photos require authenticated session checks and are forbidden here
  const isPublicHouseAsset = storageKey.startsWith("houses/");

  if (!isPublicHouseAsset) {
    return new Response("Unauthorized asset path", { status: 403 });
  }

  const object = await getStorageObject(storageKey);
  if (!object) {
    return new Response("Asset not found", { status: 404 });
  }

  // Handle client-side caching with ETag (304 Not Modified)
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch && object.etag && ifNoneMatch === object.etag) {
    return new Response(null, { status: 304 });
  }

  return new Response(object.body as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": object.contentType || "image/webp",
      "Content-Length": object.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
      ...(object.etag ? { ETag: object.etag } : {}),
      "Access-Control-Allow-Origin": "*",
    },
  });
}
