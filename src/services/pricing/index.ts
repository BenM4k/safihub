export interface CartItemPriceInput {
  unitPrice: number; // in CDF (integer)
  quantity: number;
}

export interface ZonePairFee {
  customerZoneId: string;
  houseZoneId: string;
  deliveryFee: number; // in CDF (integer)
  distanceLevel: number;
  currency?: "CDF" | "USD";
}

export interface UsdConversionOptions {
  rateIsCdfPerUsd?: boolean; // true: e.g. 2800 CDF = 1 USD; false: e.g. 0.000357 USD = 1 CDF
}

export interface UsdConversionResult {
  amountCents: number; // integer USD cents
  formatted: string;
}

export interface UnitEconomicsInput {
  itemsTotal: number;
  deliveryFee: number;
  commissionAmount: number;
  courierPayTotal: number;
  variableCosts?: number;
}

export interface UnitEconomicsResult {
  grossMargin: number;
  breakEvenDeliveryFee: number;
  housePayout: number;
  platformNet: number;
}

/**
 * Calculates the line total for a single item in integer CDF.
 */
export function calculateLineItemTotal(unitPrice: number, quantity: number): number {
  if (unitPrice < 0 || quantity < 0) {
    throw new Error("Unit price and quantity must be non-negative integers");
  }
  return Math.round(unitPrice * quantity);
}

/**
 * Calculates the grand items total across all cart lines in integer CDF.
 */
export function calculateItemsTotal(items: CartItemPriceInput[]): number {
  return items.reduce((sum, item) => sum + calculateLineItemTotal(item.unitPrice, item.quantity), 0);
}

/**
 * Retrieves the delivery fee for a customer-house zone pair from the zone fees matrix.
 * Returns null if no fee is defined for the pair (indicating no coverage).
 */
export function lookupDeliveryFee(
  customerZoneId: string,
  houseZoneId: string,
  zoneFees: ZonePairFee[]
): number | null {
  const match = zoneFees.find(
    (zf) => zf.customerZoneId === customerZoneId && zf.houseZoneId === houseZoneId
  );
  return match ? match.deliveryFee : null;
}

/**
 * Computes the platform commission in integer CDF from the items total and basis points (bps).
 * e.g. 2000 bps = 20%. Owner's own house can be 0 bps.
 */
export function calculateCommission(itemsTotal: number, commissionBps: number): number {
  if (itemsTotal < 0 || commissionBps < 0 || commissionBps > 10000) {
    throw new Error("Invalid items total or commission bps (must be 0-10000)");
  }
  return Math.round((itemsTotal * commissionBps) / 10000);
}

/**
 * Calculates the total due by the customer in integer CDF (itemsTotal + deliveryFee).
 */
export function calculateTotalDue(itemsTotal: number, deliveryFee: number): number {
  if (itemsTotal < 0 || deliveryFee < 0) {
    throw new Error("Items total and delivery fee must be non-negative integers");
  }
  return itemsTotal + deliveryFee;
}

/**
 * Computes unit economics and break-even delivery fee.
 * Break-even fee = Math.max(0, courierPay - commissionAmount).
 */
export function calculateUnitEconomics(input: UnitEconomicsInput): UnitEconomicsResult {
  const { itemsTotal, deliveryFee, commissionAmount, courierPayTotal, variableCosts = 0 } = input;
  const breakEvenDeliveryFee = Math.max(0, courierPayTotal - commissionAmount);
  const grossMargin = commissionAmount + deliveryFee - courierPayTotal - variableCosts;
  const housePayout = itemsTotal - commissionAmount;
  const platformNet = commissionAmount + deliveryFee - courierPayTotal;

  return {
    grossMargin,
    breakEvenDeliveryFee,
    housePayout,
    platformNet,
  };
}

/**
 * Rounds an amount in CDF to the nearest practical circulating banknote unit (e.g. 50 or 100 CDF).
 */
export function roundToCurrencyUnit(amount: number, unit = 50): number {
  if (unit <= 0) return Math.round(amount);
  return Math.round(amount / unit) * unit;
}

/**
 * Converts CDF to USD using the frozen exchange rate, returning integer cents.
 */
export function convertCdfToUsd(
  amountCdf: number,
  exchangeRate: number,
  options: UsdConversionOptions = { rateIsCdfPerUsd: true }
): UsdConversionResult {
  if (
    !Number.isFinite(amountCdf) ||
    !Number.isFinite(exchangeRate) ||
    amountCdf < 0 ||
    exchangeRate <= 0
  ) {
    throw new Error("Amount must be non-negative and exchange rate must be positive");
  }

  const cents = options.rateIsCdfPerUsd
    ? Math.round((amountCdf / exchangeRate) * 100)
    : Math.round(amountCdf * exchangeRate * 100);

  const dollars = (cents / 100).toFixed(2);
  return {
    amountCents: cents,
    formatted: `$${dollars}`,
  };
}
