import { Star } from "lucide-react";

interface Criterion {
  label: string;
  val: number;
  setVal: (val: number) => void;
}

interface PressingReviewCriteriaProps {
  title: string;
  criteria: Criterion[];
}

export function PressingReviewCriteria({
  title,
  criteria,
}: PressingReviewCriteriaProps) {
  return (
    <div className="pt-2 border-t border-border space-y-2.5">
      <span className="font-bold text-muted-foreground block text-xs">
        {title}
      </span>
      <div className="grid grid-cols-2 gap-2.5">
        {criteria.map((crit) => (
          <div key={crit.label} className="p-2.5 rounded-xl bg-muted/50 border border-border">
            <span className="text-[11px] font-semibold text-foreground block mb-1">
              {crit.label}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => crit.setVal(s)}
                  aria-label={`${crit.label}: ${s} / 5`}
                  aria-pressed={crit.val === s}
                  className="hover:scale-110 cursor-pointer"
                >
                  <Star
                    aria-hidden="true"
                    className={`size-3.5 ${
                      s <= crit.val ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
