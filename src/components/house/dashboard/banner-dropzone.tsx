import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";

interface BannerDropzoneProps {
  onClick: () => void;
}

export function BannerDropzone({ onClick }: BannerDropzoneProps) {
  const t = useTranslations("house.bannerModal");

  return (
    <div
      onClick={onClick}
      className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-8 text-center space-y-3 cursor-pointer bg-surface hover:bg-primary-soft/30 transition group"
    >
      <div className="size-12 rounded-2xl bg-card shadow-xs border border-border flex items-center justify-center mx-auto text-muted-foreground group-hover:text-primary transition">
        <Upload className="size-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-heading">{t("clickToChoose")}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{t("fileFormats")}</p>
      </div>
    </div>
  );
}
