import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-150 select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover",
        primary:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover",
        secondary:
          "bg-primary-soft text-primary hover:bg-[#E0E3FE]",
        contrast:
          "bg-heading text-white hover:bg-primary",
        outline:
          "border border-border-strong bg-white text-ink-700 hover:bg-muted hover:border-heading",
        ghost:
          "text-heading hover:bg-muted",
        destructive:
          "bg-destructive text-white hover:bg-[#B42318]",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto font-medium",
        social:
          "border border-slate-200 bg-white text-ink-700 font-medium hover:bg-slate-50/80 shadow-none justify-center",
      },
      size: {
        default: "min-h-[2.75rem] px-5 py-2.5 rounded-[var(--radius)]",
        sm: "min-h-[2.25rem] px-3.5 py-1.5 text-xs rounded-md",
        lg: "min-h-[3.125rem] px-6 py-3 text-base rounded-xl",
        icon: "size-10 rounded-lg p-0",
        pill: "min-h-[3rem] px-6 py-3 text-base rounded-full font-semibold",
        "pill-sm": "min-h-[2.5rem] px-4 py-2 text-sm rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Standard shadcn Button component with SafiHub design tokens and React 19 ref support.
 */
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
}

export { buttonVariants };
