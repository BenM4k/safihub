import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => {
  const map = new Map<string, string>();
  const mockStorage: Storage = {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: mockStorage,
    configurable: true,
  });
  return map;
});

import { useCartStore } from "../cart-store";

describe("useCartStore.transferCartToHouse", () => {
  beforeEach(() => {
    storage.clear();
    useCartStore.getState().clearCart();
  });

  it("returns transferred=false with counts and preserves cart when no items match", () => {
    useCartStore.getState().addItem("house-a", "Pressing A", {
      houseItemId: "hi-a-1",
      serviceId: "svc-wash",
      itemId: "item-shirt",
      fabricId: "fab-cotton",
      quantity: 2,
      expectedUnitPrice: 2000,
    });

    const result = useCartStore.getState().transferCartToHouse("house-b", "Pressing B", [
      {
        houseItemId: "hi-b-1",
        serviceId: "svc-dry",
        itemId: "item-suit",
        fabricId: "fab-wool",
        priceCdf: 8000,
      },
    ]);

    expect(result).toEqual({
      transferred: false,
      matchedCount: 0,
      unmatchedCount: 1,
      totalCount: 1,
    });
    expect(useCartStore.getState().houseId).toBe("house-a");
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("transfers only matching items and reports partial match counts", () => {
    useCartStore.getState().addItem("house-a", "Pressing A", {
      houseItemId: "hi-a-1",
      serviceId: "svc-wash",
      itemId: "item-shirt",
      fabricId: "fab-cotton",
      quantity: 2,
      expectedUnitPrice: 2000,
    });
    useCartStore.getState().addItem("house-a", "Pressing A", {
      houseItemId: "hi-a-2",
      serviceId: "svc-dry",
      itemId: "item-suit",
      fabricId: "fab-wool",
      quantity: 1,
      expectedUnitPrice: 9000,
    });

    const result = useCartStore.getState().transferCartToHouse("house-b", "Pressing B", [
      {
        houseItemId: "hi-b-1",
        serviceId: "svc-wash",
        itemId: "item-shirt",
        fabricId: "fab-cotton",
        priceCdf: 2500,
      },
    ]);

    expect(result).toEqual({
      transferred: true,
      matchedCount: 1,
      unmatchedCount: 1,
      totalCount: 2,
    });
    expect(useCartStore.getState().houseId).toBe("house-b");
    expect(useCartStore.getState().houseName).toBe("Pressing B");
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]).toMatchObject({
      houseItemId: "hi-b-1",
      expectedUnitPrice: 2500,
      quantity: 2,
    });
  });

  it("transfers all items when everything matches", () => {
    useCartStore.getState().addItem("house-a", "Pressing A", {
      houseItemId: "hi-a-1",
      serviceId: "svc-wash",
      itemId: "item-shirt",
      fabricId: "fab-cotton",
      quantity: 1,
      expectedUnitPrice: 2000,
    });

    const result = useCartStore.getState().transferCartToHouse("house-b", "Pressing B", [
      {
        houseItemId: "hi-b-1",
        serviceId: "svc-wash",
        itemId: "item-shirt",
        fabricId: "fab-cotton",
        priceCdf: 2200,
      },
    ]);

    expect(result).toEqual({
      transferred: true,
      matchedCount: 1,
      unmatchedCount: 0,
      totalCount: 1,
    });
    expect(useCartStore.getState().houseId).toBe("house-b");
  });

  it("returns zeroed result when cart is empty", () => {
    const result = useCartStore.getState().transferCartToHouse("house-b", "Pressing B", []);

    expect(result).toEqual({
      transferred: false,
      matchedCount: 0,
      unmatchedCount: 0,
      totalCount: 0,
    });
  });
});
