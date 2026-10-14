"use client";

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
        <tr key={`skel-${i}`} className="h-14 animate-pulse border-b border-border-strong/50">
          <td className="px-3.5 py-3.5">
            <div className="w-4 h-4 bg-muted rounded mx-auto" />
          </td>
          <td className="px-3.5 py-3.5">
            <div className="w-16 h-4 bg-muted rounded" />
          </td>
          <td className="px-3.5 py-3.5">
            <div className="w-28 h-4 bg-muted rounded mb-1" />
            <div className="w-20 h-3 bg-muted rounded" />
          </td>
          <td className="px-3.5 py-3.5 hidden md:table-cell">
            <div className="w-24 h-4 bg-muted rounded" />
          </td>
          <td className="px-3.5 py-3.5 hidden sm:table-cell">
            <div className="w-28 h-4 bg-muted rounded" />
          </td>
          <td className="px-3.5 py-3.5 hidden lg:table-cell">
            <div className="w-14 h-4 bg-muted rounded" />
          </td>
          {showPaymentColumn && (
            <td className="px-3.5 py-3.5 hidden xl:table-cell">
              <div className="w-12 h-4 bg-muted rounded" />
            </td>
          )}
          <td className="px-3.5 py-3.5 text-right">
            <div className="w-16 h-4 bg-muted rounded ml-auto" />
          </td>
          <td className="px-3.5 py-3.5">
            <div className="w-20 h-5 bg-muted rounded-full" />
          </td>
          <td className="px-3.5 py-3.5 text-right">
            <div className="w-5 h-5 bg-muted rounded ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}
