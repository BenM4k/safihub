import * as React from "react";
import { cn } from "@/lib/utils";

type AnyProps = Record<string, unknown>;

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object" && "current" in ref) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

function mergeSlotProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...slotProps, ...childProps };

  for (const key of Object.keys(slotProps)) {
    const slotVal = slotProps[key];
    const childVal = childProps[key];

    if (key === "className") {
      merged[key] = cn(slotVal as string, childVal as string);
    } else if (key === "style") {
      merged[key] = {
        ...(slotVal as React.CSSProperties),
        ...(childVal as React.CSSProperties),
      };
    } else if (
      /^on[A-Z]/.test(key) &&
      typeof slotVal === "function" &&
      typeof childVal === "function"
    ) {
      merged[key] = (...args: unknown[]) => {
        (childVal as (...a: unknown[]) => unknown)(...args);
        (slotVal as (...a: unknown[]) => unknown)(...args);
      };
    }
  }

  return merged;
}

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
}

export function Slot({ children, ref, ...slotProps }: SlotProps) {
  if (!React.isValidElement<AnyProps>(children)) {
    return null;
  }

  const childRef = (children.props as { ref?: React.Ref<HTMLElement> }).ref;
  const mergedProps = mergeSlotProps(slotProps, children.props);

  if (ref || childRef) {
    mergedProps.ref = mergeRefs(ref, childRef);
  }

  return React.cloneElement(children, mergedProps);
}
