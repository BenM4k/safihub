export interface DeliveredOrderBreakdown {
  id: string;
  code: string;
  itemsTotal?: number;
  commissionAmount?: number;
  owedToHouse?: number;
  amount?: number;
  deliveredAt?: Date | string | null;
  createdAt?: Date | string;
}

export interface HouseSettlementRow {
  houseId: string;
  name: string;
  neighborhoodName: string | null;
  grossTotalCDF: number;
  commissionTotalCDF: number;
  totalOwedCDF: number;
  totalSettledCDF: number;
  balanceOwedCDF: number;
  lastSettlementAmount: number | null;
  lastSettlementAt: Date | string | null;
  deliveredOrdersCount: number;
  oldestUnpaidDate: Date | string | null;
  deliveredOrders: DeliveredOrderBreakdown[];
}

export interface CourierSettlementRow {
  courierId: string;
  name: string | null;
  phone: string | null;
  missionsCount: number;
  totalEarnedCDF: number;
  totalPaidCDF: number;
  balanceOwedCDF: number;
  lastPaymentAmount: number | null;
  lastPaymentAt: Date | string | null;
  cashDiscrepancyCDF: number;
  cashHeldCDF: number;
  oldestUnpaidDate: Date | string | null;
  deliveredOrders: DeliveredOrderBreakdown[];
}

export interface SettlementHistoryRow {
  id: string;
  entryType: "house_settlement_paid" | "courier_pay_paid";
  payeeType: "house" | "courier";
  payeeId: string;
  payeeName: string;
  payeePhone: string | null;
  payeeNeighborhood: string | null;
  amount: number;
  currency: "CDF" | "USD";
  method: "mobile_money" | "bank" | "cash";
  reference: string | null;
  period: string | null;
  note: string | null;
  operatorId: string | null;
  operatorName: string | null;
  createdAt: Date | string;
  isReversed: boolean;
  reversalReason: string | null;
  reversedAt: Date | string | null;
  reversedByName: string | null;
}

export interface PayeeSettlementTarget {
  id: string;
  type: "house" | "courier";
  name: string;
  subtitle: string;
  balanceOwedCDF: number;
  grossTotalCDF?: number;
  commissionTotalCDF?: number;
  cashDiscrepancyCDF?: number;
  deliveredOrders: DeliveredOrderBreakdown[];
}

export interface SettlementReceiptData {
  settlementId?: string;
  payeeName: string;
  payeeType: "house" | "courier";
  payeeSubtitle?: string;
  amount: number;
  currency: string;
  method: "mobile_money" | "bank" | "cash";
  reference?: string;
  period?: string;
  note?: string;
  createdAt: Date | string;
  newBalanceCDF: number;
}
