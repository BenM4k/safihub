"use client";

import { OrdersManagementClient } from "./orders-management-client";
import type { OrderListItemRecord } from "@/dal";

interface OrdersTableProps {
  initialOrders: OrderListItemRecord[];
  houses?: Array<{ id: string; name: string }>;
}

export function OrdersTable({ initialOrders, houses = [] }: OrdersTableProps) {
  return <OrdersManagementClient initialOrders={initialOrders} houses={houses} />;
}
