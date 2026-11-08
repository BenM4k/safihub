import { Skeleton } from "@/components/ui/skeleton";

export default function VerifyEmailLoading() {
  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto p-6 space-y-4">
      <Skeleton className="h-8 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

