import { getTranslations } from "next-intl/server";
import type { ExchangeRateRecord } from "@/dal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExchangeRatesHistoryProps {
  rates: ExchangeRateRecord[];
}

export async function ExchangeRatesHistory({ rates }: ExchangeRatesHistoryProps) {
  const t = await getTranslations("admin.settings");

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground">
          {t("rateHistoryTitle")} ({rates.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="h-9 py-2 px-4 uppercase font-semibold text-foreground">{t("effectiveDateCol")}</TableHead>
              <TableHead className="h-9 py-2 px-4 uppercase font-semibold text-foreground">{t("pairCol")}</TableHead>
              <TableHead className="h-9 py-2 px-4 text-right uppercase font-semibold text-foreground">{t("rateAppliedCol")}</TableHead>
              <TableHead className="h-9 py-2 px-4 text-right uppercase font-semibold text-foreground">{t("recordedAtCol")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {t("noRatesHistory")}
                </TableCell>
              </TableRow>
            ) : (
              rates.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="py-3 px-4 font-mono font-medium text-foreground">
                    {r.effectiveDate}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-muted-foreground">
                    <span className="font-semibold text-foreground">{r.baseCurrency}</span> → {r.quoteCurrency}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right font-mono font-bold text-foreground">
                    1 {r.baseCurrency} = {Number(r.rate).toLocaleString(undefined, { maximumFractionDigits: 6 })} {r.quoteCurrency}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right text-[11px] text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

