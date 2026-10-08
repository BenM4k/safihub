import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  createMasterFabric,
  createMasterItem,
  createMasterService,
  getItemRequests,
  getMasterFabrics,
  getMasterItems,
  getMasterServices,
  resolveItemRequest,
  updateMasterFabric,
  updateMasterItem,
  type ItemRequestRecord,
  type MasterFabricRecord,
  type MasterItemRecord,
  type MasterServiceRecord,
} from "@/dal";

export async function listAdminCatalog(): Promise<
  Result<{
    services: MasterServiceRecord[];
    items: MasterItemRecord[];
    fabrics: MasterFabricRecord[];
    requests: ItemRequestRecord[];
  }>
> {
  try {
    const [services, items, fabrics, requests] = await Promise.all([
      getMasterServices(),
      getMasterItems(),
      getMasterFabrics(),
      getItemRequests(),
    ]);

    return ok({ services, items, fabrics, requests });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load catalog data");
  }
}

export async function addAdminMasterItem(params: {
  nameFr: string;
  nameSw: string;
  category?: string | null;
  sortOrder?: number;
}): Promise<Result<MasterItemRecord>> {
  try {
    if (!params.nameFr?.trim() || !params.nameSw?.trim()) {
      return err("Both French and Swahili names are required");
    }
    const created = await createMasterItem(params);
    return ok(created);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to create master item");
  }
}

export async function toggleAdminMasterItemActive(
  itemId: string,
  isActive: boolean
): Promise<Result<void>> {
  try {
    await updateMasterItem(itemId, { isActive });
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update item");
  }
}

export async function addAdminMasterFabric(params: {
  nameFr: string;
  nameSw: string;
  sortOrder?: number;
}): Promise<Result<MasterFabricRecord>> {
  try {
    if (!params.nameFr?.trim() || !params.nameSw?.trim()) {
      return err("Both French and Swahili names are required");
    }
    const created = await createMasterFabric(params);
    return ok(created);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to create master fabric");
  }
}

export async function toggleAdminMasterFabricActive(
  fabricId: string,
  isActive: boolean
): Promise<Result<void>> {
  try {
    await updateMasterFabric(fabricId, { isActive });
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update fabric");
  }
}

export async function addAdminMasterService(params: {
  slug: string;
  nameFr: string;
  nameSw: string;
  sortOrder?: number;
}): Promise<Result<MasterServiceRecord>> {
  try {
    if (!params.slug?.trim() || !params.nameFr?.trim() || !params.nameSw?.trim()) {
      return err("Slug, French name, and Swahili name are all required");
    }
    const created = await createMasterService(params);
    return ok(created);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to create master service");
  }
}

export async function approveAdminItemRequest(params: {
  requestId: string;
  adminId: string;
  kind: "item" | "fabric";
  nameFr: string;
  nameSw: string;
  category?: string | null;
  adminNote?: string;
}): Promise<Result<{ createdId: string }>> {
  try {
    if (!params.nameFr?.trim() || !params.nameSw?.trim()) {
      return err("Both French and Swahili names are required for the new catalogue entry");
    }

    let createdItemId: string | null = null;
    let createdFabricId: string | null = null;

    if (params.kind === "item") {
      const createdItem = await createMasterItem({
        nameFr: params.nameFr,
        nameSw: params.nameSw,
        category: params.category,
      });
      createdItemId = createdItem.id;
    } else {
      const createdFabric = await createMasterFabric({
        nameFr: params.nameFr,
        nameSw: params.nameSw,
      });
      createdFabricId = createdFabric.id;
    }

    await resolveItemRequest({
      requestId: params.requestId,
      status: "approved",
      adminNote: params.adminNote,
      resolvedBy: params.adminId,
      createdItemId,
      createdFabricId,
    });

    return ok({ createdId: (createdItemId || createdFabricId)! });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to approve item request");
  }
}

export async function rejectAdminItemRequest(params: {
  requestId: string;
  adminId: string;
  adminNote: string;
}): Promise<Result<void>> {
  try {
    if (!params.adminNote?.trim()) {
      return err("A rejection note/reason is required");
    }

    await resolveItemRequest({
      requestId: params.requestId,
      status: "rejected",
      adminNote: params.adminNote.trim(),
      resolvedBy: params.adminId,
    });

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to reject item request");
  }
}
