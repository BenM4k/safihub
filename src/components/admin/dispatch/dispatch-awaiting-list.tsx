"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { OrderListItemRecord } from "@/dal";
import { enrichOrders, type EnrichedDispatchOrder } from "@/lib/dispatch-grouping";
import { DispatchAwaitingContainer } from "./dispatch-awaiting-container";

interface DispatchAwaitingListProps {
  orders: (OrderListItemRecord | EnrichedDispatchOrder)[];
}

export function DispatchAwaitingList({ orders }: DispatchAwaitingListProps) {
  const router = useRouter();

  const enrichedOrders = useMemo(() => {
    if (orders.length > 0 && "urgency" in orders[0]) {
      return orders as EnrichedDispatchOrder[];
    }
    return enrichOrders(orders as OrderListItemRecord[]);
  }, [orders]);

  return (
    <DispatchAwaitingContainer
      orders={enrichedOrders}
      availablePressings={[]}
      onRefresh={() => router.refresh()}
    />
  );
}
