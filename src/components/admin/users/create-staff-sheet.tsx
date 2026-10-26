"use client";

import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CreateStaffForm } from "./create/create-staff-form";

interface CreateStaffSheetProps {
  isOpen: boolean;
  houses: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateStaffSheet({
  isOpen,
  houses,
  onClose,
  onSuccess,
}: CreateStaffSheetProps) {
  const t = useTranslations("admin.users");

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl h-full p-0 flex flex-col border-l border-border bg-background"
      >
        <SheetHeader className="flex flex-row items-center gap-3 px-6 py-4 border-b border-border bg-muted/20 shrink-0 space-y-0 text-left">
          <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <UserPlus className="size-5" />
          </div>
          <div>
            <SheetTitle className="text-sm font-bold text-foreground">
              {t("createStaffTitle")}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {t("createStaffDesc")}
            </SheetDescription>
          </div>
        </SheetHeader>

        {isOpen && (
          <CreateStaffForm
            houses={houses}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
