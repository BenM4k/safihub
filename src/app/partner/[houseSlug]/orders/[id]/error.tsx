"use client";

import { useParams } from "next/navigation";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerOrderDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PartnerOrderDetailError({
  error,
  reset,
}: PartnerOrderDetailErrorProps) {
  const params = useParams<{ houseSlug?: string }>();
  const houseSlug = params?.houseSlug;

  return (
    <PartnerErrorView
      error={error}
      reset={reset}
      houseSlug={houseSlug}
    />
  );
}
