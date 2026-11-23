"use client";

import * as React from "react";
import {
  Carousel as UiCarousel,
  CarouselContent as UiCarouselContent,
  CarouselItem as UiCarouselItem,
  CarouselNext as UiCarouselNext,
  CarouselPrevious as UiCarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonProps } from "@/components/ui/button";

function Carousel({
  orientation = "horizontal",
  className,
  ...props
}: React.ComponentProps<typeof UiCarousel>) {
  return (
    <UiCarousel
      orientation={orientation}
      className={cn("relative", className)}
      {...props}
    />
  );
}

function CarouselContent({
  className,
  ...props
}: React.ComponentProps<typeof UiCarouselContent>) {
  return (
    <CarouselViewport className="overflow-hidden">
      <UiCarouselContent
        className={cn("flex gap-4 data-[orientation=vertical]:flex-col", className)}
        {...props}
      />
    </CarouselViewport>
  );
}

function CarouselItem({
  className,
  ...props
}: React.ComponentProps<typeof UiCarouselItem>) {
  return (
    <UiCarouselItem
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof UiCarouselPrevious> &
  Pick<ButtonProps, "variant" | "size">) {
  return (
    <UiCarouselPrevious
      aria-label="Previous slide"
      className={cn(
        buttonVariants({ variant, size }),
        "absolute top-1/2 -left-12 size-11 -translate-y-1/2 rounded-full",
        className
      )}
      {...props}
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      <span className="sr-only">Previous slide</span>
    </UiCarouselPrevious>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof UiCarouselNext> &
  Pick<ButtonProps, "variant" | "size">) {
  return (
    <UiCarouselNext
      aria-label="Next slide"
      className={cn(
        buttonVariants({ variant, size }),
        "absolute top-1/2 -right-12 size-11 -translate-y-1/2 rounded-full",
        className
      )}
      {...props}
    >
      <ArrowRight className="size-4" aria-hidden="true" />
      <span className="sr-only">Next slide</span>
    </UiCarouselNext>
  );
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
