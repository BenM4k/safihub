"use client";

import dynamic from "next/dynamic";
import { MapSkeleton } from "./map-skeleton";
import { useDeferUntilVisible } from "./use-defer-until-visible";
import type { BaseMapProps } from "./base-map";

const DynamicBaseMap = dynamic(
  () => import("./base-map").then((mod) => mod.BaseMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

export interface LazyMapProps extends BaseMapProps {
  /** When false, holds off downloading/mounting MapLibre (e.g. mobile list view before user taps "Show map"). */
  enabled?: boolean;
  loadingLabel?: string;
}

export function LazyMap({
  enabled = true,
  loadingLabel,
  className = "",
  ...mapProps
}: LazyMapProps) {
  const { containerRef, isReady } = useDeferUntilVisible<HTMLDivElement>(enabled);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {enabled && isReady ? (
        <DynamicBaseMap {...mapProps} />
      ) : (
        <MapSkeleton label={loadingLabel} />
      )}
    </div>
  );
}

