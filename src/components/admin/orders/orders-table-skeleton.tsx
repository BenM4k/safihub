"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface OrdersTableSkeletonProps {
  showPaymentColumn?: boolean;
  rowsCount?: number;
}

export function OrdersTableSkeleton({
  showPaymentColumn = false,
  rowsCount = 6,
}: OrdersTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowsCount }).map((_, i) => (
        <tr key={`skel-${i}`} className="h-14 border-b border-border">
          <td className="px-3.5 py-3.5">
            <Skeleton className="size-4 rounded mx-auto" />
          </td>
          <td className="px-3.5 py-3.5">
            <Skeleton className="w-16 h-4 rounded" />
          </td>
          <td className="px-3.5 py-3.5">
            <div className="flex flex-col gap-1">
              <Skeleton className="w-28 h-4 rounded" />
              <Skeleton className="w-20 h-3 rounded" />
            </div>
          </td>
          <td className="px-3.5 py-3.5 hidden md:table-cell">
            <Skeleton className="w-24 h-4 rounded" />
          </td>
          <td className="px-3.5 py-3.5 hidden sm:table-cell">
            <Skeleton className="w-28 h-4 rounded" />
          </td>
          <td className="px-3.5 py-3.5 hidden lg:table-cell">
            <Skeleton className="w-14 h-4 rounded" />
          </td>
          {showPaymentColumn && (
            <td className="px-3.5 py-3.5 hidden xl:table-cell">
              <Skeleton className="w-12 h-4 rounded" />
            </td>
          )}
          <td className="px-3.5 py-3.5 text-right">
            <Skeleton className="w-16 h-4 rounded ml-auto" />
          </td>
          <td className="px-3.5 py-3.5">
            <Skeleton className="w-20 h-5 rounded-full" />
          </td>
          <td className="px-3.5 py-3.5 text-right">
            <Skeleton className="size-5 rounded ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

