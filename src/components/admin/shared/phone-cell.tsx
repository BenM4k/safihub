import { formatPhone } from "@/lib/order-formatters";
import { Phone } from "lucide-react";

interface PhoneCellProps {
  phone: string | null | undefined;
  showIcon?: boolean;
  tapToCall?: boolean;
  className?: string;
}

export function PhoneCell({
  phone,
  showIcon = false,
  tapToCall = true,
  className = "",
}: PhoneCellProps) {
  const formatted = formatPhone(phone);

  if (formatted === "—" || !phone) {
    return <span className="text-muted-foreground">—</span>;
  }

  const rawTelDigits = phone.replace(/[^\d+]/g, "");

  if (tapToCall) {
    return (
      <a
        href={`tel:${rawTelDigits}`}
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1.5 text-xs text-ink-700 hover:text-primary hover:underline transition-colors font-medium ${className}`}
        title={`Appeler le ${formatted}`}
        aria-label={`Appeler le ${formatted}`}
      >
        {showIcon && <Phone className="size-3 text-ink-500 shrink-0" aria-hidden="true" />}
        <span>{formatted}</span>
      </a>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium ${className}`}
    >
      {showIcon && <Phone className="size-3 text-ink-500 shrink-0" aria-hidden="true" />}
      <span>{formatted}</span>
    </span>
  );
}
