import "server-only";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface R2ObjectMetadata {
  key: string;
  size: number;
  etag: string;
  httpMetadata?: Record<string, string>;
  customMetadata?: Record<string, string>;
}

export interface R2BucketBinding {
  get(key: string): Promise<unknown | null>;
  head(key: string): Promise<R2ObjectMetadata | null>;
  put(key: string, value: unknown, options?: unknown): Promise<R2ObjectMetadata>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: unknown): Promise<unknown>;
}

/**
 * Accesses native Cloudflare Worker R2 bucket binding ('BUCKET') via
 * `import { env } from "cloudflare:workers"` when running inside workerd / vinext.
 * Returns null when running in Node.js / dev environments.
 */
export async function getWorkerR2Binding(): Promise<R2BucketBinding | null> {
  try {
    const cf = await import("cloudflare:workers");
    const envObj = cf.env as { BUCKET?: R2BucketBinding; R2?: R2BucketBinding } | undefined;
    return envObj?.BUCKET ?? envObj?.R2 ?? null;
  } catch {
    return null;
  }
}

let cachedS3Client: { client: S3Client | null; bucket: string; isConfigured: boolean } | null = null;

function getR2S3Client(): { client: S3Client | null; bucket: string; isConfigured: boolean } {
  if (cachedS3Client) {
    return cachedS3Client;
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || process.env.S3_BUCKET || "safihub";
  const endpoint =
    process.env.R2_ENDPOINT ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : process.env.AWS_ENDPOINT_URL_S3);

  if (!accessKeyId || !secretAccessKey) {
    cachedS3Client = { client: null, bucket, isConfigured: false };
    return cachedS3Client;
  }

  const client = new S3Client({
    region: "auto",
    endpoint: endpoint || undefined,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });

  cachedS3Client = { client, bucket, isConfigured: true };
  return cachedS3Client;
}

/**
 * Generates a short-lived presigned upload (PUT) URL for Cloudflare R2.
 * Valid for 5 minutes (300 seconds) by default.
 * Mobile clients compress locally and PUT directly to R2 (zero server proxying).
 */
export async function getSignedUploadUrl(
  storageKey: string,
  contentType: string = "image/webp",
  expiresInSeconds: number = 300
): Promise<string> {
  const { client, bucket, isConfigured } = getR2S3Client();

  if (!isConfigured || !client) {
    // In local dev/test environments without credentials, generate a deterministic mock URL
    return `https://storage.safihub.cd/${bucket}/${storageKey}?mock_upload_sig=${Date.now()}&expires=${expiresInSeconds}`;
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: storageKey,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generates a short-lived presigned download (GET) URL for Cloudflare R2.
 * Valid for 15 minutes (900 seconds) by default.
 * Enforces the private bucket boundary (only authorized actors get a download URL).
 */
export async function getSignedDownloadUrl(
  storageKey: string,
  expiresInSeconds: number = 900
): Promise<string> {
  const { client, bucket, isConfigured } = getR2S3Client();

  if (!isConfigured || !client) {
    return `https://storage.safihub.cd/${bucket}/${storageKey}?mock_download_sig=valid&expires=${expiresInSeconds}`;
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: storageKey,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Deletes an object from Cloudflare R2.
 * Checks for native Cloudflare Worker binding first (vinext native execution),
 * then falls back to the S3-compatible R2 client.
 */
export async function deleteStorageObject(storageKey: string): Promise<boolean> {
  // 1. Native Cloudflare Workers binding (when running in workerd / vinext)
  const workerBinding = await getWorkerR2Binding();
  if (workerBinding) {
    try {
      await workerBinding.delete(storageKey);
      return true;
    } catch (error) {
      console.error(`[Cloudflare R2] Native binding failed to delete: ${storageKey}`, error);
      return false;
    }
  }

  // 2. S3-compatible R2 Client fallback
  const { client, bucket, isConfigured } = getR2S3Client();
  if (!isConfigured || !client) {
    return true; // Mock deletion succeeds in test/dev
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: storageKey,
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error(`[Cloudflare R2] S3 API failed to delete: ${storageKey}`, error);
    return false;
  }
}

/**
 * Retrieves metadata for a storage object to verify existence and size.
 */
export async function headStorageObject(storageKey: string): Promise<R2ObjectMetadata | null> {
  const workerBinding = await getWorkerR2Binding();
  if (workerBinding) {
    try {
      return await workerBinding.head(storageKey);
    } catch {
      return null;
    }
  }

  const { client, bucket, isConfigured } = getR2S3Client();
  if (!isConfigured || !client) {
    return null;
  }

  try {
    const res = await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: storageKey,
      })
    );
    return {
      key: storageKey,
      size: res.ContentLength ?? 0,
      etag: res.ETag ?? "",
    };
  } catch {
    return null;
  }
}
