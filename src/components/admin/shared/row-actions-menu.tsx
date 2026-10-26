"use client";

import { type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RowActionItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  title?: string;
  badge?: ReactNode;
}

interface RowActionsMenuProps {
  ariaLabel: string;
  items?: RowActionItem[];
  children?: ReactNode;
  align?: "end" | "start" | "center";
  className?: string;
}

export function RowActionsMenu({
  ariaLabel,
  items,
  children,
  align = "end",
  className,
}: RowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={ariaLabel}
          className={cn(
            "size-8 rounded-lg border-2 border-border-strong bg-card hover:bg-surface text-ink-600 hover:text-heading flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs",
            className
          )}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-56 rounded-xl bg-card border-2 border-border-strong shadow-lg py-1.5"
      >
        {items
          ? items.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={item.onClick}
                disabled={item.disabled}
                variant={item.destructive ? "destructive" : "default"}
                title={item.title}
                className={cn(
                  "px-3.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2.5",
                  item.destructive && "text-destructive focus:text-destructive"
                )}
              >
                {item.icon && (
                  <span className="shrink-0 size-3.5 flex items-center justify-center">
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
                {item.badge && <span className="ml-auto">{item.badge}</span>}
              </DropdownMenuItem>
            ))
          : children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { DropdownMenuItem, DropdownMenuSeparator };
