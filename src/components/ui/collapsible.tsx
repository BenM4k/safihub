"use client";

import * as React from "react";
import {
  Collapsible as UiCollapsible,
  CollapsiblePanel,
  CollapsibleTrigger as UiCollapsibleTrigger,
} from "@ui-sdk/react/collapsible";

function Collapsible(props: React.ComponentProps<typeof UiCollapsible>) {
  return <UiCollapsible {...props} />;
}

function CollapsibleTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof UiCollapsibleTrigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <UiCollapsibleTrigger render={children} {...props} />;
  }
  return <UiCollapsibleTrigger {...props}>{children}</UiCollapsibleTrigger>;
}

function CollapsibleContent(
  props: React.ComponentProps<typeof CollapsiblePanel>
) {
  return <CollapsiblePanel {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
