import { ScorecardStatusBadge, type MetricStatus } from "./scorecard-status-badge";
import { ScorecardInfoTooltip } from "./scorecard-info-tooltip";
import { TableRow, TableCell } from "@/components/ui/table";

export interface ScorecardRowData {
  id: string;
  metric: string;
  formula: string;
  definitionAriaLabel: string;
  currentDisplay: string;
  targetDisplay: string;
  progressPercent: number | null;
  status: MetricStatus;
}

const BAR_TONE_CLASS: Record<MetricStatus, string> = {
  met: "bg-success",
  "at-risk": "bg-warning",
  failing: "bg-destructive",
  "no-data": "bg-muted-foreground/40",
};

export function ScorecardRow({
  data,
  labels,
}: {
  data: ScorecardRowData;
  labels: {
    met: string;
    atRisk: string;
    failing: string;
    noData: string;
  };
}) {
  const barTone = BAR_TONE_CLASS[data.status] ?? BAR_TONE_CLASS["no-data"];

  return (
    <TableRow className="row-interactive">
      {/* Metric Name + Formula Tooltip */}
      <TableCell className="py-3.5 px-5 sm:px-6">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">{data.metric}</span>
          <ScorecardInfoTooltip
            formula={data.formula}
            ariaLabel={data.definitionAriaLabel}
          />
        </div>
      </TableCell>

      {/* Current Value */}
      <TableCell className="py-3.5 px-4 font-semibold tabular-nums text-foreground">
        {data.currentDisplay}
      </TableCell>

      {/* Target Value */}
      <TableCell className="py-3.5 px-4 text-xs text-muted-foreground font-medium">
        {data.targetDisplay}
      </TableCell>

      {/* Progress Bar */}
      <TableCell className="py-3.5 px-4">
        {data.progressPercent !== null ? (
          <div className="w-32 flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted border border-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full animate-bar-fill ${barTone}`}
                style={{ width: `${Math.min(data.progressPercent, 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono tabular-nums text-muted-foreground w-8">
              {Math.round(data.progressPercent)}%
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/60">—</span>
        )}
      </TableCell>

      {/* Status Badge */}
      <TableCell className="py-3.5 px-5 sm:px-6 text-right">
        <ScorecardStatusBadge status={data.status} labels={labels} />
      </TableCell>
    </TableRow>
  );
}
