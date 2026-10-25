"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function EmptyCartView() {
  const t = useTranslations("checkout");
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100dvh-14rem)] py-12 px-4 text-center">
      <div className="p-8 sm:p-10 text-center bg-card rounded-3xl border border-border shadow-xs max-w-md w-full flex flex-col items-center">
        <div className="size-16 sm:size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-5 shadow-2xs">
          <ShoppingBag className="size-8 sm:size-10" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-heading tracking-tight mb-2">
          {t("emptyCartTitle")}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
          {t("emptyCartDesc")}
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/houses")}
          className="w-full sm:w-auto font-bold px-6 shadow-sm cursor-pointer"
        >
          {t("browseHouses")}
        </Button>
      </div>
    </div>
  );
}
