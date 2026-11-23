"use client";

import * as React from "react";
import {
  AlertDialog as UiAlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent as UiAlertDialogContent,
  AlertDialogDescription as UiAlertDialogDescription,
  AlertDialogTitle as UiAlertDialogTitle,
  AlertDialogTrigger as UiAlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonProps } from "@/components/ui/button";

function AlertDialog(props: React.ComponentProps<typeof UiAlertDialog>) {
  return <UiAlertDialog {...props} />;
}

function AlertDialogTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof UiAlertDialogTrigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <UiAlertDialogTrigger render={children} {...props} />;
  }
  return <UiAlertDialogTrigger {...props}>{children}</UiAlertDialogTrigger>;
}

function AlertDialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogBackdrop>) {
  return (
    <AlertDialogBackdrop
      className={cn(
        "fixed inset-0 z-50 m-0 h-dvh w-screen max-h-none max-w-none border-0 p-0 bg-black/50 transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof UiAlertDialogContent> & {
  size?: "default" | "sm";
}) {
  return (
    <>
      <AlertDialogOverlay />
      <UiAlertDialogContent
        data-size={size}
        className={cn(
          "group/alert-dialog-content fixed top-[50%] left-[50%] z-50 m-0 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border bg-card p-6 shadow-lg duration-200 transition-[opacity,scale] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-lg",
          className
        )}
        {...props}
      />
    </>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof UiAlertDialogTitle>) {
  return (
    <UiAlertDialogTitle
      className={cn("text-lg font-semibold text-heading", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  asChild,
  children,
  ...props
}: Omit<React.ComponentProps<typeof UiAlertDialogDescription>, "children"> & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  if (asChild && React.isValidElement(children)) {
    return (
      <UiAlertDialogDescription
        className={cn(
          "text-sm text-muted-foreground leading-relaxed",
          className
        )}
        render={children}
        {...props}
      />
    );
  }

  return (
    <UiAlertDialogDescription
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    >
      {children}
    </UiAlertDialogDescription>
  );
}

function AlertDialogAction({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogClose> &
  Pick<ButtonProps, "variant" | "size">) {
  return (
    <AlertDialogClose
      value="confirm"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogClose> &
  Pick<ButtonProps, "variant" | "size">) {
  return (
    <AlertDialogClose
      value="cancel"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
