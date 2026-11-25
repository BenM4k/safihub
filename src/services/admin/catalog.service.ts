import "server-only";
import { err, ok, type Result } from "@/lib/result";
import { sanitizeServiceError } from "@/lib/service-errors";
import {
  approveItemRequestTransaction,
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
    return err(sanitizeServiceError(error, "Failed to load catalog data", "listAdminCatalog"));
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
    return err(sanitizeServiceError(error, "Failed to create master item", "addAdminMasterItem"));
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
    return err(sanitizeServiceError(error, "Failed to update item", "toggleAdminMasterItemActive"));
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
    return err(sanitizeServiceError(error, "Failed to create master fabric", "addAdminMasterFabric"));
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
    return err(sanitizeServiceError(error, "Failed to update fabric", "toggleAdminMasterFabricActive"));
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
    return err(sanitizeServiceError(error, "Failed to create master service", "addAdminMasterService"));
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

    const approved = await approveItemRequestTransaction({
      requestId: params.requestId,
      adminId: params.adminId,
      kind: params.kind,
      nameFr: params.nameFr,
      nameSw: params.nameSw,
      category: params.category,
      adminNote: params.adminNote,
    });

    if (!approved) {
      return err("Item request is not pending or does not exist");
    }

    if ("kindMismatch" in approved) {
      return err("Item request kind does not match the approval payload");
    }

    return ok({ createdId: approved.createdId });
  } catch (error) {
    return err(sanitizeServiceError(error, "Failed to approve item request", "approveAdminItemRequest"));
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

    const updated = await resolveItemRequest({
      requestId: params.requestId,
      status: "rejected",
      adminNote: params.adminNote.trim(),
      resolvedBy: params.adminId,
    });

    if (!updated) {
      return err("Item request is not pending or does not exist");
    }

    return ok(undefined);
  } catch (error) {
    return err(sanitizeServiceError(error, "Failed to reject item request", "rejectAdminItemRequest"));
  }
}
