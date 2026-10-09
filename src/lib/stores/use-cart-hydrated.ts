"use client";

import { useSyncExternalStore } from "react";
import { useCartStore } from "./cart-store";

const emptySubscribe = () => () => {};

export function useCartHydrated() {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const store = useCartStore();

  return {
    ...store,
    isHydrated,
  };
}
