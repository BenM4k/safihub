"use client";

import { Button } from "@/components/ui/button";

interface PartnerBannerPhotoNudgeProps {
  onOpenUpload: () => void;
}

export function PartnerBannerPhotoNudge({ onOpenUpload }: PartnerBannerPhotoNudgeProps) {
  return (
    <div className="mt-4 p-3 rounded-2xl bg-warning-soft/70 border border-warning/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <p className="text-xs text-warning font-medium">
        💡 <strong>Conseil :</strong> Ajoutez une photo de votre établissement pour inspirer confiance et attirer plus de clients sur Bukavu.
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onOpenUpload}
        className="text-xs font-bold border-warning/40 text-warning hover:bg-warning-soft self-start sm:self-auto shrink-0"
      >
        Ajouter une photo
      </Button>
    </div>
  );
}
