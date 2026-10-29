import "server-only";

import { err, ok, type Result } from "@/lib/result";
import {
  getPartnerOrdersRestricted,
  getPartnerOrderTabCountsRestricted,
  recordPartnerOrderHandover,
  reportPartnerOrderIssue,
  getHouseOrderDetailRestricted,
  getOrderItems,
  getHouseOrderEventsRestricted,
  transitionOrderStatusAtomic,
  type PartnerOrderListItemDTO,
  type PartnerOrderQueryFilters,
  type PartnerOrderTabCounts,
  type HouseOrderDetailRecord,
  type OrderItemRecord,
  type OrderEventRecord,
} from "@/dal";
import { transitionOrder } from "@/services/order/transitions";
import {
  acceptIncomingOrder,
  rejectIncomingOrder,
  markOrderReady,
} from "./house.service";

export async function listPartnerOrders(
  houseId: string,
  filters: PartnerOrderQueryFilters = {},
): Promise<Result<PartnerOrderListItemDTO[]>> {
  try {
    const orders = await getPartnerOrdersRestricted(houseId, filters);
    return ok(orders);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Erreur lors du chargement des commandes.",
    );
  }
}

export async function getPartnerOrderTabCounts(
  houseId: string,
): Promise<Result<PartnerOrderTabCounts>> {
  try {
    const counts = await getPartnerOrderTabCountsRestricted(houseId);
    return ok(counts);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Erreur lors du calcul des compteurs.",
    );
  }
}

export type PartnerOrderDetailDTO = Omit<
  HouseOrderDetailRecord,
  "trackingToken"
>;

export async function getPartnerOrderDetail(
  houseId: string,
  orderId: string,
): Promise<
  Result<{
    order: PartnerOrderDetailDTO;
    items: OrderItemRecord[];
    events: OrderEventRecord[];
  }>
> {
  try {
    const order = await getHouseOrderDetailRestricted(houseId, orderId);
    if (!order) {
      return err("Commande introuvable ou n'appartenant pas à cet atelier.");
    }

    const [items, events] = await Promise.all([
      getOrderItems(orderId),
      getHouseOrderEventsRestricted(orderId),
    ]);

    const { trackingToken: _, ...orderWithoutToken } = order;
    void _;
    const rawName = (order.customerFirstName ?? "").trim();
    const firstName = rawName.split(" ").filter(Boolean)[0] || "Client";

    const safeOrder: PartnerOrderDetailDTO = {
      ...orderWithoutToken,
      customerFirstName: firstName,
    };

    return ok({ order: safeOrder, items, events });
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Erreur lors du chargement du détail.",
    );
  }
}

export async function acceptPartnerOrder(params: {
  houseId: string;
  orderId: string;
  actorId: string;
  actorRole: "house" | "admin";
}): Promise<Result<void>> {
  const detail = await getHouseOrderDetailRestricted(
    params.houseId,
    params.orderId,
  );
  if (!detail) {
    return err("Commande introuvable ou déjà réassignée.");
  }

  if (detail.status !== "created") {
    return err(
      `Statut incompatible : la commande est '${detail.status}' et ne peut plus être acceptée.`,
    );
  }

  // Strict deadline lockout: if acceptance deadline elapsed, reject acceptance
  if (detail.acceptanceDeadlineAt) {
    const now = new Date();
    if (now.getTime() > new Date(detail.acceptanceDeadlineAt).getTime()) {
      return err(
        "Le délai d'acceptation de 45 minutes est dépassé. La commande ne peut plus être acceptée.",
      );
    }
  }

  return acceptIncomingOrder(params);
}

export async function rejectPartnerOrder(params: {
  houseId: string;
  orderId: string;
  actorId: string;
  actorRole: "house" | "admin";
  reason: string;
}): Promise<Result<void>> {
  return rejectIncomingOrder(params);
}

export async function markPartnerOrderReceived(params: {
  houseId: string;
  orderId: string;
  actorId: string;
  actorRole: "house" | "admin";
}): Promise<Result<void>> {
  try {
    const detail = await getHouseOrderDetailRestricted(
      params.houseId,
      params.orderId,
    );
    if (!detail) {
      return err("Commande introuvable ou n'appartenant pas à cet atelier.");
    }

    const transitionRes = transitionOrder(params.orderId, detail.status, {
      targetStatus: "received",
      actorId: params.actorId,
      actorRole: params.actorRole,
      note: "Linge réceptionné au pressing pour contrôle",
    });

    if (!transitionRes.ok) {
      return err(transitionRes.error);
    }

    const updated = await transitionOrderStatusAtomic({
      orderId: params.orderId,
      expectedStatus: detail.status,
      newStatus: "received",
      event: transitionRes.value.event,
    });

    if (!updated) {
      return err("Le statut de la commande a changé entre-temps.");
    }

    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Échec de la réception du linge.",
    );
  }
}

export async function startPartnerOrderWashing(params: {
  houseId: string;
  orderId: string;
  actorId: string;
  actorRole: "house" | "admin";
}): Promise<Result<void>> {
  try {
    const detail = await getHouseOrderDetailRestricted(
      params.houseId,
      params.orderId,
    );
    if (!detail) {
      return err("Commande introuvable ou n'appartenant pas à cet atelier.");
    }

    const transitionRes = transitionOrder(params.orderId, detail.status, {
      targetStatus: "washing",
      actorId: params.actorId,
      actorRole: params.actorRole,
      note: "Décompte conforme, démarrage du traitement en atelier",
    });

    if (!transitionRes.ok) {
      return err(transitionRes.error);
    }

    const updated = await transitionOrderStatusAtomic({
      orderId: params.orderId,
      expectedStatus: detail.status,
      newStatus: "washing",
      event: transitionRes.value.event,
    });

    if (!updated) {
      return err("Le statut de la commande a changé entre-temps.");
    }

    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Échec du démarrage du traitement.",
    );
  }
}

export async function markPartnerOrderReady(params: {
  houseId: string;
  orderId: string;
  actorId: string;
  actorRole: "house" | "admin";
}): Promise<Result<void>> {
  return markOrderReady(params);
}

export async function handoverPartnerOrderToCourier(params: {
  houseId: string;
  orderId: string;
  actorId: string;
  actorRole: "house" | "admin";
  note?: string;
}): Promise<Result<void>> {
  try {
    const success = await recordPartnerOrderHandover(params);
    if (!success) {
      return err("Commande introuvable ou non autorisée pour cet atelier.");
    }
    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Échec de l'enregistrement de la remise au coursier.",
    );
  }
}

export async function reportPartnerOrderIssueActionService(params: {
  houseId: string;
  orderId: string;
  actorId: string;
  actorRole: "house" | "admin";
  reason: string;
  note?: string;
}): Promise<Result<void>> {
  try {
    const success = await reportPartnerOrderIssue(params);
    if (!success) {
      return err("Commande introuvable ou non autorisée pour cet atelier.");
    }
    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Échec du signalement du problème.",
    );
  }
}

export const reportOrderIssueByPartner = reportPartnerOrderIssueActionService;
