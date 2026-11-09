"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const RequestItemDialog = dynamic(
  () => import("./request-item-dialog").then((m) => m.RequestItemDialog),
  { ssr: false }
);

export function RequestItemModal({ houseId }: { houseId?: string }) {
  const t = useTranslations("house.catalogue");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="h-10 sm:h-9 w-full sm:w-auto text-xs font-semibold rounded-lg border-primary/40 text-primary hover:bg-primary/10 hover:text-primary cursor-pointer"
      >
        <PlusCircle className="size-3.5 mr-1.5 text-primary" />
        <span>{t("requestItem")}</span>
      </Button>

      {isOpen && (
        <RequestItemDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          houseId={houseId}
        />
      )}
    </>
  );
}
