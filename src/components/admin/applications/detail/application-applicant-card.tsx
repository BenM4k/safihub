import { getTranslations } from "next-intl/server";
import { User } from "lucide-react";

interface ApplicationApplicantCardProps {
  contactName: string;
  phone: string;
  email: string;
}

export async function ApplicationApplicantCard({
  contactName,
  phone,
  email,
}: ApplicationApplicantCardProps) {
  const t = await getTranslations("admin.applications");

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-xs stack gap-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <User className="size-4 text-primary" />
        <span>{t("applicant")}</span>
      </div>
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-muted-foreground block">{t("name")} :</span>
          <span className="font-semibold text-heading text-sm">{contactName}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">{t("phone")} :</span>
          <span className="font-mono font-medium text-heading">{phone}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">{t("email")} :</span>
          <span className="text-heading font-mono select-all">{email}</span>
        </div>
      </div>
    </div>
  );
}
