export type PeriodType = "week" | "month" | "last30" | "custom";

export interface PartnerSettlementHeroData {
  balanceOwedCDF: number;
  totalAllTimeNetCDF: number;
  totalAllTimeSettledCDF: number;
  nextPayoutDate: string;
  payoutCycle: string;
  payoutMethodName: string;
  maskedAccount: string | null;
  isPayoutMethodConfigured: boolean;
  minPayoutThresholdCDF: number | null;
}

export interface PartnerSettlementAlertsData {
  missingPayoutMethod: boolean;
  failedPayoutCount: number;
  failedPayoutNote: string | null;
  overdueOrdersCount: number;
  oldestUnsettledDays: number | null;
}

export interface PartnerSettlementKpiData {
  grossRevenueCDF: number;
  commissionCDF: number;
  commissionRatePercent: number;
  netReceivableCDF: number;
  totalSettledCDF: number;
  adjustmentsCDF: number;
  grossTrendPercent: number | null;
  grossTrendDiffCDF: number | null;
  netTrendPercent: number | null;
  netTrendDiffCDF: number | null;
  settledTrendDiffCDF: number | null;
}

export interface PartnerDeliveredOrderDTO {
  id: string;
  code: string;
  shortReference: string;
  customerDisplayName: string;
  deliveredAt: string | null;
  itemsTotal: number;
  commissionAmount: number;
  commissionBps: number;
  netReceivable: number;
  settlementStatus: "pending" | "settled" | "disputed";
  settlementId: string | null;
  settlementReference: string | null;
}

export interface PartnerPayoutIncludedOrder {
  id: string;
  code: string;
  shortReference: string;
  customerDisplayName: string;
  netAmount: number;
  deliveredAt: string | null;
}

export interface PartnerPayoutDTO {
  id: string;
  date: string;
  periodCovered: string | null;
  method: "mobile_money" | "bank" | "cash";
  amount: number;
  currency: string;
  status: "paid" | "processing" | "failed" | "cancelled";
  reference: string | null;
  note: string | null;
  ordersCount: number;
  includedOrders: PartnerPayoutIncludedOrder[];
}

export interface PartnerSettlementsPageData {
  houseId: string;
  houseName: string;
  houseSlug: string;
  selectedPeriod: PeriodType;
  periodStartDate: string;
  periodEndDate: string;
  hero: PartnerSettlementHeroData;
  alerts: PartnerSettlementAlertsData;
  kpis: PartnerSettlementKpiData;
  orders: PartnerDeliveredOrderDTO[];
  payouts: PartnerPayoutDTO[];
  allOrders: PartnerDeliveredOrderDTO[];
  allPayouts: PartnerPayoutDTO[];
  config: {
    commissionRatePercent: number;
    settlementDelayNotice: string;
    overdueThresholdDays: number;
  };
}
