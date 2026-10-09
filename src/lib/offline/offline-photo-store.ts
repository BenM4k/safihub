"use client";

import {
  getPhotoUploadUrlAction,
  recordPhotoUploadAction,
} from "@/actions/storage.actions";
import { uploadBlobWithRetry } from "@/lib/image-compression";

export interface QueuedOfflinePhoto {
  id: string;
  orderId: string;
  orderItemId?: string | null;
  missionId?: string | null;
  type: "pickup_condition" | "delivery_proof";
  blob: Blob;
  sizeBytes: number;
  timestamp: number;
}

const DB_NAME = "safihub_offline_photos";
const STORE_NAME = "pending_photos";
const DB_VERSION = 1;

function openPhotoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Enqueues a captured photo blob in IndexedDB while offline.
 */
export async function enqueueOfflinePhoto(
  photo: QueuedOfflinePhoto
): Promise<void> {
  try {
    const db = await openPhotoDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(photo);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to save offline photo to IndexedDB:", err);
  }
}

/**
 * Retrieves all pending offline photos from IndexedDB.
 */
export async function getPendingOfflinePhotos(): Promise<QueuedOfflinePhoto[]> {
  try {
    const db = await openPhotoDb();
    return await new Promise<QueuedOfflinePhoto[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as QueuedOfflinePhoto[]);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to retrieve pending offline photos:", err);
    return [];
  }
}

/**
 * Removes an uploaded photo from the offline queue.
 */
export async function removeOfflinePhoto(id: string): Promise<void> {
  try {
    const db = await openPhotoDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to remove offline photo from IndexedDB:", err);
  }
}

/**
 * Synchronizes all pending offline photos once network connection returns.
 * 1. Requests presigned upload URL from server
 * 2. Directly uploads blob to Cloudflare R2
 * 3. Records photo metadata in order_photos
 * 4. Clears successfully uploaded item from offline store
 */
export async function syncOfflinePhotos(): Promise<{
  uploadedCount: number;
  failedCount: number;
}> {
  const pending = await getPendingOfflinePhotos();
  if (pending.length === 0) {
    return { uploadedCount: 0, failedCount: 0 };
  }

  let uploadedCount = 0;
  let failedCount = 0;

  for (const item of pending) {
    try {
      // 1. Get presigned upload URL
      const urlRes = await getPhotoUploadUrlAction({
        orderId: item.orderId,
        orderItemId: item.orderItemId,
        type: item.type,
        contentType: item.blob.type || "image/webp",
      });

      if (!urlRes.ok) {
        failedCount++;
        continue;
      }

      // 2. Direct upload to R2
      const uploadOk = await uploadBlobWithRetry(
        urlRes.value.uploadUrl,
        item.blob,
        { maxRetries: 3 }
      );

      if (!uploadOk) {
        failedCount++;
        continue;
      }

      // 3. Confirm in DB
      const recordRes = await recordPhotoUploadAction({
        orderId: item.orderId,
        orderItemId: item.orderItemId,
        missionId: item.missionId,
        type: item.type,
        storageKey: urlRes.value.storageKey,
        sizeBytes: item.sizeBytes,
      });

      if (recordRes.ok) {
        await removeOfflinePhoto(item.id);
        uploadedCount++;
      } else {
        failedCount++;
      }
    } catch (err) {
      console.warn(`Failed to sync offline photo ${item.id}:`, err);
      failedCount++;
    }
  }

  return { uploadedCount, failedCount };
}
