import "server-only";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { sanitizeServiceError } from "@/lib/service-errors";
import { clearSessionMemoryCache } from "@/services/auth/guards";
import { err, ok, type Result } from "@/lib/result";
import {
  blockUserAndRevokeSessions,
  getAdminCustomers,
  getCustomerAddresses,
  getCustomerOrders,
  getMergedGuestAccounts,
  getUserById,
  getUserConsents,
  mergeGuestUser,
  updateUserRoleAndStatus,
  type AdminCustomerRecord,
  type CustomerAddressRecord,
  type GetAdminCustomersParams,
  type GuestMergeResult,
  type OrderListItemRecord,
  type UserRecord,
} from "@/dal";
import { validateMergeCandidates } from "@/lib/customer-formatters";

function safeRevalidateAuthTags(userId: string): void {
  try {
    revalidateTag(CACHE_TAGS.userSession(userId), { expire: 0 });
    revalidateTag(CACHE_TAGS.authSessions, { expire: 0 });
  } catch {
    // Non-blocking outside Next.js request context
  }
}

function formatBukavuAuditTimestamp(date: Date = new Date()): string {
  return date.toLocaleDateString("fr-FR", {
    timeZone: "Africa/Lubumbashi",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface CustomerDetailedProfile {
  customer: AdminCustomerRecord;
  orders: OrderListItemRecord[];
  addresses: CustomerAddressRecord[];
  mergedGuestAccounts: UserRecord[];
  consents: Array<{ document: string; version: string; acceptedAt: Date }>;
}

export interface CustomerMergePreview {
  guest: {
    id: string;
    name: string;
    email: string;
    contactPhone: string | null;
    ordersCount: number;
    totalSpentCDF: number;
    addressesCount: number;
    lastOrderAt: Date | null;
  };
  target: {
    id: string;
    name: string;
    email: string;
    contactPhone: string | null;
    ordersCount: number;
    totalSpentCDF: number;
    addressesCount: number;
    lastOrderAt: Date | null;
  };
  ordersToMoveCount: number;
  addressesToMoveCount: number;
}

/**
 * Lists registered and guest end-customers (role: 'customer') with order and spend statistics.
 * Excludes operational staff (courier, house, admin).
 */
export async function listAdminCustomers(
  params?: GetAdminCustomersParams
): Promise<Result<{ customers: AdminCustomerRecord[]; totalCount: number }>> {
  try {
    const data = await getAdminCustomers(params);
    return ok(data);
  } catch (error) {
    return err(sanitizeServiceError(error, "Erreur chargement clients", "listAdminCustomers"));
  }
}

export async function getCustomerDetailedProfile(
  userId: string
): Promise<Result<CustomerDetailedProfile>> {
  try {
    const [rawUser, orders, addresses, mergedGuestAccounts, consents] = await Promise.all([
      getUserById(userId),
      getCustomerOrders(userId),
      getCustomerAddresses(userId),
      getMergedGuestAccounts(userId),
      getUserConsents(userId),
    ]);

    if (!rawUser) {
      return err("Client introuvable.");
    }

    const totalSpentCDF = orders.reduce((sum, o) => sum + (o.totalDue || 0), 0);
    const lastOrderAt = orders[0]?.createdAt ?? null;
    const activeStatuses = [
      "created",
      "accepted",
      "pickup_assigned",
      "pickup_in_progress",
      "picked_up",
      "received",
      "price_adjusted",
      "washing",
      "ready",
      "delivery_slot_confirmed",
      "delivery_assigned",
      "delivery_in_progress",
    ];
    const hasActiveOrders = orders.some((o) => activeStatuses.includes(o.status));

    const customer: AdminCustomerRecord = {
      ...rawUser,
      ordersCount: orders.length,
      totalSpentCDF,
      lastOrderAt,
      hasActiveOrders,
      firstOrderSource: orders[orders.length - 1]?.source ?? null,
    };

    return ok({
      customer,
      orders,
      addresses,
      mergedGuestAccounts,
      consents: consents.map((c) => ({
        document: c.document,
        version: c.version,
        acceptedAt: c.acceptedAt,
      })),
    });
  } catch (error) {
    return err(sanitizeServiceError(error, "Erreur profil client", "getCustomerDetailedProfile"));
  }
}

export async function blockAdminCustomer(params: {
  customerId: string;
  reason: string;
  operatorName?: string;
}): Promise<Result<void>> {
  try {
    if (!params.reason?.trim()) {
      return err("Un motif de blocage est obligatoire.");
    }

    const user = await getUserById(params.customerId);
    if (!user) {
      return err("Client introuvable.");
    }

    if (user.role !== "customer") {
      return err("Cette action est réservée aux comptes clients.");
    }

    const orders = await getCustomerOrders(params.customerId);
    const activeOrders = orders.filter((o) =>
      [
        "created",
        "accepted",
        "pickup_assigned",
        "pickup_in_progress",
        "picked_up",
        "received",
        "price_adjusted",
        "washing",
        "ready",
        "delivery_slot_confirmed",
        "delivery_assigned",
        "delivery_in_progress",
      ].includes(o.status)
    );

    const activeWarning =
      activeOrders.length > 0
        ? ` [Attention: ${activeOrders.length} commande(s) en cours au moment du blocage]`
        : "";

    const timestamp = formatBukavuAuditTimestamp();

    const operatorPart = params.operatorName ? ` par ${params.operatorName}` : "";
    const auditReason = `${params.reason.trim()}${activeWarning} (Enregistré le ${timestamp}${operatorPart})`;

    const blockRes = await blockUserAndRevokeSessions(
      params.customerId,
      auditReason,
      { requireRole: "customer" }
    );
    if (!blockRes.ok) {
      return err(blockRes.error);
    }

    clearSessionMemoryCache();
    safeRevalidateAuthTags(params.customerId);

    return ok(undefined);
  } catch (error) {
    return err(sanitizeServiceError(error, "Erreur lors du blocage du client", "blockAdminCustomer"));
  }
}

export async function unblockAdminCustomer(customerId: string): Promise<Result<void>> {
  try {
    const user = await getUserById(customerId);
    if (!user) {
      return err("Client introuvable.");
    }
    if (user.role !== "customer") {
      return err("Cette action est réservée aux comptes clients.");
    }

    await updateUserRoleAndStatus(customerId, {
      banned: false,
      status: "active",
      banReason: null,
    });
    clearSessionMemoryCache();
    safeRevalidateAuthTags(customerId);
    return ok(undefined);
  } catch (error) {
    return err(sanitizeServiceError(error, "Erreur lors du déblocage", "unblockAdminCustomer"));
  }
}

export async function previewCustomerMerge(params: {
  guestUserId: string;
  targetUserId: string;
}): Promise<Result<CustomerMergePreview>> {
  try {
    const [guest, target] = await Promise.all([
      getUserById(params.guestUserId),
      getUserById(params.targetUserId),
    ]);

    const validation = validateMergeCandidates({
      source: guest,
      target,
    });

    if (!validation.valid) {
      return err(validation.error || "Candidats de fusion invalides.");
    }

    const [guestOrders, targetOrders, guestAddresses, targetAddresses] = await Promise.all([
      getCustomerOrders(params.guestUserId),
      getCustomerOrders(params.targetUserId),
      getCustomerAddresses(params.guestUserId),
      getCustomerAddresses(params.targetUserId),
    ]);

    const guestSpent = guestOrders.reduce((sum, o) => sum + (o.totalDue || 0), 0);
    const targetSpent = targetOrders.reduce((sum, o) => sum + (o.totalDue || 0), 0);

    return ok({
      guest: {
        id: guest!.id,
        name: guest!.name,
        email: guest!.email,
        contactPhone: guest!.contactPhone,
        ordersCount: guestOrders.length,
        totalSpentCDF: guestSpent,
        addressesCount: guestAddresses.length,
        lastOrderAt: guestOrders[0]?.createdAt ?? null,
      },
      target: {
        id: target!.id,
        name: target!.name,
        email: target!.email,
        contactPhone: target!.contactPhone,
        ordersCount: targetOrders.length,
        totalSpentCDF: targetSpent,
        addressesCount: targetAddresses.length,
        lastOrderAt: targetOrders[0]?.createdAt ?? null,
      },
      ordersToMoveCount: guestOrders.length,
      addressesToMoveCount: guestAddresses.length,
    });
  } catch (error) {
    return err(sanitizeServiceError(error, "Erreur prévisualisation fusion", "previewCustomerMerge"));
  }
}

export async function executeCustomerMerge(params: {
  guestUserId: string;
  targetUserId: string;
  operatorName?: string;
  operatorId?: string;
}): Promise<Result<GuestMergeResult>> {
  try {
    const [guest, target] = await Promise.all([
      getUserById(params.guestUserId),
      getUserById(params.targetUserId),
    ]);

    const validation = validateMergeCandidates({
      source: guest,
      target,
    });

    if (!validation.valid) {
      return err(validation.error || "Fusion refusée.");
    }

    // Construct audit metadata for banReason
    const timestamp = formatBukavuAuditTimestamp();
    const operator = params.operatorName || params.operatorId || "Opérateur Admin";
    const auditReason = `Fusionné vers le compte client ${params.targetUserId} (${target!.name}) par ${operator} le ${timestamp}.`;

    const res = await mergeGuestUser({
      guestUserId: params.guestUserId,
      targetUserId: params.targetUserId,
      auditReason,
    });
    if (res.ok) {
      clearSessionMemoryCache();
      safeRevalidateAuthTags(params.guestUserId);
    }
    return res;
  } catch (error) {
    return err(sanitizeServiceError(error, "Erreur lors de la fusion des comptes", "executeCustomerMerge"));
  }
}
