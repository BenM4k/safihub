# File Storage & Photos Architecture Guide

This document describes SafiHub's private object storage architecture using Cloudflare R2, client-side image compression, presigned URL lifecycles, and photo verification rules.

---

## 1. Storage Architecture (Cloudflare R2)

SafiHub uses a private **Cloudflare R2** bucket for storing all order-related photographs (pickup condition evidence and delivery proof).

```text
Courier / Customer Mobile Device
  │
  ├─ 1. Compress photo on device (< 1280px, WebP < 300KB)
  ├─ 2. Request presigned upload URL from Server Action
  │      ▼
  │    Next.js Server (/api/storage or Server Action)
  │      └─ Validates mission/order authorization
  │      └─ Generates short-lived presigned PUT URL (expires in 5 mins)
  │      ▲
  ├─ 3. Upload binary blob DIRECTLY to Cloudflare R2 (PUT)
  │      ▼
  │    Cloudflare R2 Private Bucket
  │      ▲
  └─ 4. Confirm upload: writes metadata row to `order_photos`
```

### Critical Rules
- **Zero Server File Proxying:** Large photo binaries must **never** stream through Next.js API routes or Server Actions. This preserves serverless execution memory, avoids Vercel payload limits, and saves server compute.
- **Short-Lived Presigned URLs:** Files are stored in a private bucket. Uploads require signed PUT URLs; viewing requires signed GET URLs valid for 15 minutes.
- **Access Control:** The storage service only issues download URLs to:
  - The customer who placed the order
  - Staff of the laundry house assigned to the order
  - The courier assigned to the active mission
  - System administrators

---

## 2. Client-Side Image Compression

Because couriers and customers in Bukavu frequently operate over bandwidth-constrained 3G networks:

- **Browser Compression:** Before initiating any upload, the client image utility (`src/lib/image-compression.ts`) loads the photo into an offscreen HTML Canvas or `ImageBitmap`:
  - Resizes the longest dimension to a maximum of **1280 pixels**.
  - Re-encodes the image as **WebP** (fallback to JPEG if unsupported) at 0.75 quality.
  - Strips EXIF metadata.
- **Payload Reduction:** Shrinks raw smartphone photos (typically 4–8 MB) down to **under 300 KB** (a ~95% bandwidth saving).

---

## 3. Photo Types & Verification Rules

Every photo stored is tracked in `order_photos`:

```ts
export const orderPhotos = pgTable("order_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  itemId: uuid("item_id").references(() => orderItems.id), // Optional: links to specific garment
  missionId: uuid("mission_id").references(() => missions.id),
  type: varchar("type", { length: 30 }).notNull(), // 'pickup_condition' | 'delivery_proof'
  storageKey: text("storage_key").notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Operational Rules
1. **Mandatory Condition Photos:** If an item is flagged by the customer or courier as **valuable** (e.g. expensive wool suit, delicate dress) or **pre-damaged** (existing tears, heavy discoloration, missing buttons), the courier app **blocks completion of the pickup mission** until at least one photo is captured and attached to that item.
2. **Delivery Proof Photos:** Optional photo captured during delivery handover showing the packaged laundry bag at the customer's doorstep.
3. **Privacy Boundary:** Photos must depict **clothing and laundry items only**. The app displays an explicit reminder: *"Do not photograph faces, identity documents, or home interiors."*

---

## 4. Retention Policy (90 Days)

- Photographic records are stored for **90 days** post-delivery to support dispute resolution and quality auditing.
- An Inngest scheduled job runs weekly to delete R2 objects and prune `order_photos` records for orders completed more than 90 days ago that have no open disputes.

---

## 5. Offline Photo Queue for Couriers

When a courier operates in an area without network coverage:
1. The compressed image `Blob` is stored locally in device **IndexedDB** alongside the queued pickup action.
2. The UI renders an instant preview from an `IndexedDB` object URL.
3. Upon reconnection, the courier sync worker requests a presigned upload URL from the server, uploads the blob to R2, and links the resulting `storageKey`.
