import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from "lucide-react";
import { StatusBadge, type StatusBadgeTone } from "@/components/admin/shared/status-badge";

export type MetricStatus = "met" | "at-risk" | "failing" | "no-data";

interface ScorecardStatusBadgeProps {
  status: MetricStatus;
  labels: {
    met: string;
    atRisk: string;
    failing: string;
    noData: string;
  };
}

const METRIC_META: Record<
  MetricStatus,
  {
    tone: StatusBadgeTone;
    icon: typeof CheckCircle2;
    labelKey: keyof ScorecardStatusBadgeProps["labels"];
  }
> = {
  met: { tone: "success", icon: CheckCircle2, labelKey: "met" },
  "at-risk": { tone: "warning", icon: AlertTriangle, labelKey: "atRisk" },
  failing: { tone: "destructive", icon: XCircle, labelKey: "failing" },
  "no-data": { tone: "secondary", icon: MinusCircle, labelKey: "noData" },
};

export function ScorecardStatusBadge({ status, labels }: ScorecardStatusBadgeProps) {
  const cfg = METRIC_META[status] ?? METRIC_META["no-data"];
  const Icon = cfg.icon;

  return (
    <StatusBadge
      tone={cfg.tone}
      icon={<Icon className="size-3.5" aria-hidden="true" />}
    >
      {labels[cfg.labelKey]}
    </StatusBadge>
  );
}
