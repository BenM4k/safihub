import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <section className="min-h-[calc(100dvh-4.5rem)] flex items-center pt-38 pb-12 sm:pt-32 sm:pb-16 md:py-16 bg-background overflow-hidden">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: skeleton placeholders */}
          <div className="lg:col-span-6 stack gap-5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-10 sm:h-12 w-3/4 rounded-lg" />
              <Skeleton className="h-10 sm:h-12 w-2/3 rounded-lg" />
              <Skeleton className="h-10 sm:h-12 w-1/2 rounded-lg" />
            </div>

            <Skeleton className="h-12 w-full max-w-sm rounded-lg" />

            <div className="pt-1">
              <Skeleton className="h-12 w-44 rounded-xl" />
            </div>
          </div>

          {/* Right Column: Card skeleton */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <Skeleton className="w-full max-w-md h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

