import { CheckCircle2 } from "lucide-react";

interface PasswordCriteriaProps {
  checks: {
    hasLower: boolean;
    hasUpper: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    hasLength: boolean;
  };
}

const CRITERIA = [
  { key: "hasLower", label: "One lowercase character" },
  { key: "hasUpper", label: "One uppercase character" },
  { key: "hasNumber", label: "One number" },
  { key: "hasSpecial", label: "One special character" },
  { key: "hasLength", label: "8 character minimum" },
] as const;

export function PasswordCriteria({ checks }: PasswordCriteriaProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-1 pb-1">
      {CRITERIA.map((criterion) => {
        const isMet = checks[criterion.key];
        return (
          <div
            key={criterion.key}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              isMet ? "text-emerald-600 font-medium" : "text-muted-foreground"
            }`}
          >
            <CheckCircle2
              className={`size-3.5 shrink-0 transition-colors ${
                isMet
                  ? "text-emerald-500 fill-emerald-100"
                  : "text-slate-300"
              }`}
            />
            <span>{criterion.label}</span>
          </div>
        );
      })}
    </div>
  );
}
