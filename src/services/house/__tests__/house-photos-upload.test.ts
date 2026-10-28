import { describe, expect, it } from "vitest";
import {
  db,
  schema,
  getHouseById,
  getHouseBySlug,
  updateHouseImages,
  getHouseChecklistDerivation,
} from "@/dal";
import {
  generateHouseAssetUploadUrlService,
  updateHouseImagesService,
} from "@/services/house";

describe("House Photos & Asset Upload Pipeline", () => {
  const uniqueId = () => Math.random().toString(36).substring(2, 9);

  async function createTestHouse() {
    const [n] = await db
      .select({ id: schema.neighborhoods.id })
      .from(schema.neighborhoods)
      .limit(1);

    const slug = `pressing-photo-${uniqueId()}`;
    const [house] = await db
      .insert(schema.houses)
      .values({
        name: "Pressing Photo Test",
        slug,
        neighborhoodId: n.id,
        addressNote: "Av. Mobutu, Bukavu",
        contactPhone: "+243990001122",
        reviewStatus: "draft",
      })
      .returning();
    return house;
  }

  it("generates presigned upload URLs with correct storageKey and publicUrl", async () => {
    const house = await createTestHouse();

    const coverRes = await generateHouseAssetUploadUrlService({
      houseId: house.id,
      assetType: "cover",
      contentType: "image/webp",
    });

    expect(coverRes.ok).toBe(true);
    if (!coverRes.ok) return;

    expect(coverRes.value.uploadUrl).toBeDefined();
    expect(coverRes.value.storageKey).toMatch(new RegExp(`^houses/${house.id}/cover_`));
    expect(coverRes.value.storageKey.endsWith(".webp")).toBe(true);
    expect(coverRes.value.publicUrl).toContain(coverRes.value.storageKey);
    expect(coverRes.value.expiresInSeconds).toBe(300);

    const logoRes = await generateHouseAssetUploadUrlService({
      houseId: house.id,
      assetType: "logo",
      contentType: "image/png",
    });

    expect(logoRes.ok).toBe(true);
    if (!logoRes.ok) return;

    expect(logoRes.value.storageKey).toMatch(new RegExp(`^houses/${house.id}/logo_`));
    expect(logoRes.value.storageKey.endsWith(".png")).toBe(true);
  });

  it("fails to generate upload URL for non-existent house", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await generateHouseAssetUploadUrlService({
      houseId: fakeId,
      assetType: "cover",
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("Pressing introuvable");
    }
  });

  it("updates and removes cover and logo images, reflected in DAL and checklist", async () => {
    const house = await createTestHouse();

    // 1. Initial state: no photos
    const initialChecklist = await getHouseChecklistDerivation(house.id);
    expect(initialChecklist?.items.photos.done).toBe(false);
    expect(initialChecklist?.items.photos.coverImageUrl).toBeNull();
    expect(initialChecklist?.items.photos.logoUrl).toBeNull();

    // 2. Set cover image via service
    const testCoverUrl = "/api/storage/houses/test-cover.webp";
    const setCoverRes = await updateHouseImagesService({
      houseId: house.id,
      coverImageUrl: testCoverUrl,
    });
    expect(setCoverRes.ok).toBe(true);

    // Verify in DAL queries
    const fetchedById = await getHouseById(house.id);
    expect(fetchedById?.coverImageUrl).toBe(testCoverUrl);
    expect(fetchedById?.logoUrl).toBeNull();

    const fetchedBySlug = await getHouseBySlug(house.slug);
    expect(fetchedBySlug?.coverImageUrl).toBe(testCoverUrl);

    // Verify in Checklist: step 1 photos now completed!
    const checklistAfterCover = await getHouseChecklistDerivation(house.id);
    expect(checklistAfterCover?.items.photos.done).toBe(true);
    expect(checklistAfterCover?.items.photos.coverImageUrl).toBe(testCoverUrl);

    // 3. Set logo image via service
    const testLogoUrl = "/api/storage/houses/test-logo.webp";
    const setLogoRes = await updateHouseImagesService({
      houseId: house.id,
      logoUrl: testLogoUrl,
    });
    expect(setLogoRes.ok).toBe(true);

    const fetchedWithBoth = await getHouseById(house.id);
    expect(fetchedWithBoth?.coverImageUrl).toBe(testCoverUrl);
    expect(fetchedWithBoth?.logoUrl).toBe(testLogoUrl);

    // 4. Remove cover image (set to null)
    const removeCoverRes = await updateHouseImagesService({
      houseId: house.id,
      coverImageUrl: null,
    });
    expect(removeCoverRes.ok).toBe(true);

    const fetchedAfterRemoveCover = await getHouseById(house.id);
    expect(fetchedAfterRemoveCover?.coverImageUrl).toBeNull();
    expect(fetchedAfterRemoveCover?.logoUrl).toBe(testLogoUrl);

    // Photos still done because logoUrl is set
    const checklistWithLogoOnly = await getHouseChecklistDerivation(house.id);
    expect(checklistWithLogoOnly?.items.photos.done).toBe(true);

    // 5. Remove logo as well
    await updateHouseImages(house.id, { logoUrl: null });
    const checklistEmpty = await getHouseChecklistDerivation(house.id);
    expect(checklistEmpty?.items.photos.done).toBe(false);
  });
});
