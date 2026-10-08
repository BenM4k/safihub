import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  createExchangeRate,
  getAdminDashboardMetrics,
  getExchangeRates,
  getSettings,
  updateSettings,
  type AdminDashboardMetrics,
  type ExchangeRateRecord,
  type SettingsRecord,
} from "@/dal";

export async function getAdminSettingsData(): Promise<
  Result<{
    settings: SettingsRecord;
    rates: ExchangeRateRecord[];
  }>
> {
  try {
    const [settings, rates] = await Promise.all([
      getSettings(),
      getExchangeRates(),
    ]);

    return ok({ settings, rates });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load platform settings");
  }
}

export async function updateAdminPlatformSettings(
  params: Partial<Omit<SettingsRecord, "id" | "updatedAt">>
): Promise<Result<SettingsRecord>> {
  try {
    if (params.defaultCommissionBps !== undefined && (params.defaultCommissionBps < 0 || params.defaultCommissionBps > 10000)) {
      return err("Commission rate must be between 0 and 10000 bps");
    }
    if (params.acceptanceDelayMinutes !== undefined && params.acceptanceDelayMinutes < 15) {
      return err("Acceptance delay must be at least 15 minutes");
    }
    if (params.receptionWindowMinutes !== undefined && params.receptionWindowMinutes < 15) {
      return err("Reception window must be at least 15 minutes");
    }

    const updated = await updateSettings(params);
    return ok(updated);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update platform settings");
  }
}

export async function recordAdminDailyExchangeRate(params: {
  baseCurrency?: "CDF" | "USD";
  quoteCurrency?: "CDF" | "USD";
  rate: string;
  effectiveDate: string;
  adminId: string;
}): Promise<Result<ExchangeRateRecord>> {
  try {
    const numRate = parseFloat(params.rate);
    if (isNaN(numRate) || numRate <= 0) {
      return err("Exchange rate must be a positive number");
    }
    if (!params.effectiveDate) {
      return err("Effective date is required (YYYY-MM-DD)");
    }

    const created = await createExchangeRate({
      baseCurrency: params.baseCurrency ?? "USD",
      quoteCurrency: params.quoteCurrency ?? "CDF",
      rate: params.rate,
      effectiveDate: params.effectiveDate,
      setBy: params.adminId,
    });

    return ok(created);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to record exchange rate");
  }
}

export async function getAdminMetricsSummary(): Promise<Result<AdminDashboardMetrics>> {
  try {
    const metrics = await getAdminDashboardMetrics();
    return ok(metrics);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load dashboard metrics");
  }
}
