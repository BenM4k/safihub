import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

interface DeliveryCodeBadgeProps {
  code: string | null;
}

export function DeliveryCodeBadge({ code }: DeliveryCodeBadgeProps) {
  const t = useTranslations("track");

  if (!code) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
            {t("codeLabel")}
          </span>
        </div>

        <div className="text-4xl sm:text-5xl font-black tracking-widest text-white py-1">
          {code}
        </div>

        <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-lg">
          {t("codeExplanation")}
        </p>
      </div>

      <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-10 pointer-events-none">
        <ShieldCheck className="size-48" />
      </div>
    </div>
  );
}
