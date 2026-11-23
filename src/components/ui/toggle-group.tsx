"use client";

import * as React from "react";
import {
  Toggle as UiToggle,
  ToggleGroup as UiToggleGroup,
} from "@ui-sdk/react/toggle";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
});

type ToggleGroupBaseProps = Omit<
  React.ComponentProps<typeof UiToggleGroup>,
  "multiple" | "value" | "defaultValue" | "onValueChange" | "children"
> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    children?: React.ReactNode;
  };

type ToggleGroupSingleProps = ToggleGroupBaseProps & {
  type?: "single";
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type ToggleGroupMultipleProps = ToggleGroupBaseProps &
  (
    | {
        type: "multiple";
        multiple?: true;
      }
    | {
        type?: never;
        multiple: true;
      }
  ) & {
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
  };

type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

function ToggleGroup(props: ToggleGroupProps) {
  const { className, variant, size, spacing = 0, children } = props;

  if (props.type === "multiple" || props.multiple === true) {
    const {
      type: _type,
      multiple: _multiple,
      className: _className,
      variant: _variant,
      size: _size,
      spacing: _spacing,
      children: _children,
      value,
      defaultValue,
      onValueChange,
      ...rest
    } = props;
    void _type;
    void _multiple;
    void _className;
    void _variant;
    void _size;
    void _spacing;
    void _children;

    return (
      <UiToggleGroup
        multiple
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
        data-variant={variant}
        data-size={size}
        data-spacing={spacing}
        style={{ "--gap": spacing } as React.CSSProperties}
        className={cn(
          "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
          className
        )}
        {...rest}
      >
        <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
          {children}
        </ToggleGroupContext.Provider>
      </UiToggleGroup>
    );
  }

  const {
    type: _type,
    multiple: _multiple,
    className: _className,
    variant: _variant,
    size: _size,
    spacing: _spacing,
    children: _children,
    value,
    defaultValue,
    onValueChange,
    ...rest
  } = props;
  void _type;
  void _multiple;
  void _className;
  void _variant;
  void _size;
  void _spacing;
  void _children;

  return (
    <UiToggleGroup
      multiple={false}
      value={value !== undefined ? (value ? [value] : []) : undefined}
      defaultValue={
        defaultValue !== undefined
          ? defaultValue
            ? [defaultValue]
            : []
          : undefined
      }
      onValueChange={
        onValueChange ? (next) => onValueChange(next[0] ?? "") : undefined
      }
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className
      )}
      {...rest}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </UiToggleGroup>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof UiToggle> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <UiToggle
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    >
      {children}
    </UiToggle>
  );
}

export { ToggleGroup, ToggleGroupItem };
