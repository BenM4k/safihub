import { describe, expect, it, vi } from "vitest";
import { uploadPickupConditionPhoto } from "../pickup-photo";
import { enqueueOfflinePhoto } from "@/lib/offline/offline-photo-store";

vi.mock("@/lib/image-compression", () => ({
  compressImage: vi.fn(async () => ({
    blob: new Blob(["img"], { type: "image/webp" }),
    mimeType: "image/webp",
    sizeBytes: 3,
  })),
  uploadBlobWithRetry: vi.fn(async () => true),
}));

vi.mock("@/actions/storage.actions", () => ({
  getPhotoUploadUrlAction: vi.fn(),
  recordPhotoUploadAction: vi.fn(),
}));

vi.mock("@/lib/offline/offline-photo-store", () => ({
  enqueueOfflinePhoto: vi.fn(async () => undefined),
}));

describe("uploadPickupConditionPhoto", () => {
  it("enqueues offline photos with the full UUID from crypto.randomUUID()", async () => {
    const mockUuid = "123e4567-e89b-42d3-a456-426614174000";
    const randomUuidSpy = vi
      .spyOn(crypto, "randomUUID")
      .mockReturnValue(mockUuid);

    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    const res = await uploadPickupConditionPhoto({
      orderId: "order-1",
      orderItemId: "item-1",
      missionId: "mission-1",
      file,
      isOnline: false,
    });

    expect(res.ok).toBe(true);
    expect(enqueueOfflinePhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(
          new RegExp(`^offline_photo_\\d+_${mockUuid}$`)
        ),
        orderId: "order-1",
        orderItemId: "item-1",
        missionId: "mission-1",
        type: "pickup_condition",
      })
    );

    randomUuidSpy.mockRestore();
  });
});
