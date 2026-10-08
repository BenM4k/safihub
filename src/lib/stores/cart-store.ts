"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  houseItemId: string;
  serviceId: string;
  itemId: string;
  fabricId: string;
  itemName?: string;
  fabricName?: string;
  serviceName?: string;
  quantity: number;
  expectedUnitPrice?: number;
}

export interface PendingSwitchPayload {
  houseId: string;
  houseName: string;
  item: Omit<CartItem, "quantity"> & { quantity?: number };
}

export interface CartStoreState {
  houseId: string | null;
  houseName: string | null;
  customerNeighborhoodId: string | null;
  items: CartItem[];
  pendingSwitch: PendingSwitchPayload | null;
  showSwitchModal: boolean;

  setCustomerNeighborhoodId: (id: string | null) => void;
  addItem: (
    houseId: string,
    houseName: string,
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => boolean;
  confirmSwitchHouse: () => void;
  cancelSwitchHouse: () => void;
  updateQuantity: (houseItemId: string, delta: number) => void;
  removeItem: (houseItemId: string) => void;
  clearCart: () => void;
  restoreCartFromOrder: (
    houseId: string,
    houseName: string,
    items: CartItem[]
  ) => void;
  transferCartToHouse: (
    newHouseId: string,
    newHouseName: string,
    availableItems: Array<{
      houseItemId: string;
      serviceId: string;
      itemId: string;
      fabricId: string;
      priceCdf: number;
    }>
  ) => boolean;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      houseId: null,
      houseName: null,
      customerNeighborhoodId: null,
      items: [],
      pendingSwitch: null,
      showSwitchModal: false,

      setCustomerNeighborhoodId: (id) => set({ customerNeighborhoodId: id }),

      addItem: (houseId, houseName, newItem) => {
        const state = get();
        const qtyToAdd = newItem.quantity ?? 1;

        // If cart has items for another house, trigger switch confirmation
        if (state.houseId && state.houseId !== houseId && state.items.length > 0) {
          set({
            pendingSwitch: { houseId, houseName, item: newItem },
            showSwitchModal: true,
          });
          return false;
        }

        const existingIndex = state.items.findIndex(
          (it) => it.houseItemId === newItem.houseItemId
        );

        let nextItems: CartItem[];
        if (existingIndex >= 0) {
          nextItems = state.items.map((it, idx) =>
            idx === existingIndex
              ? { ...it, quantity: it.quantity + qtyToAdd }
              : it
          );
        } else {
          nextItems = [
            ...state.items,
            {
              ...newItem,
              quantity: qtyToAdd,
            },
          ];
        }

        set({
          houseId,
          houseName,
          items: nextItems,
        });
        return true;
      },

      confirmSwitchHouse: () => {
        const { pendingSwitch } = get();
        if (!pendingSwitch) return;

        set({
          houseId: pendingSwitch.houseId,
          houseName: pendingSwitch.houseName,
          items: [
            {
              ...pendingSwitch.item,
              quantity: pendingSwitch.item.quantity ?? 1,
            },
          ],
          pendingSwitch: null,
          showSwitchModal: false,
        });
      },

      cancelSwitchHouse: () => {
        set({
          pendingSwitch: null,
          showSwitchModal: false,
        });
      },

      updateQuantity: (houseItemId, delta) => {
        const state = get();
        const nextItems = state.items
          .map((it) => {
            if (it.houseItemId === houseItemId) {
              const newQty = it.quantity + delta;
              return newQty > 0 ? { ...it, quantity: newQty } : null;
            }
            return it;
          })
          .filter((it): it is CartItem => it !== null);

        set({
          items: nextItems,
          houseId: nextItems.length === 0 ? null : state.houseId,
          houseName: nextItems.length === 0 ? null : state.houseName,
        });
      },

      removeItem: (houseItemId) => {
        const state = get();
        const nextItems = state.items.filter((it) => it.houseItemId !== houseItemId);
        set({
          items: nextItems,
          houseId: nextItems.length === 0 ? null : state.houseId,
          houseName: nextItems.length === 0 ? null : state.houseName,
        });
      },

      clearCart: () => {
        set({
          houseId: null,
          houseName: null,
          items: [],
          pendingSwitch: null,
          showSwitchModal: false,
        });
      },

      restoreCartFromOrder: (houseId, houseName, items) => {
        set({
          houseId,
          houseName,
          items,
          pendingSwitch: null,
          showSwitchModal: false,
        });
      },

      transferCartToHouse: (newHouseId, newHouseName, availableItems) => {
        const { items } = get();
        if (items.length === 0) return false;

        const migratedItems: CartItem[] = [];
        for (const it of items) {
          const match = availableItems.find(
            (ai) =>
              ai.serviceId === it.serviceId &&
              ai.itemId === it.itemId &&
              ai.fabricId === it.fabricId
          );
          if (match) {
            migratedItems.push({
              ...it,
              houseItemId: match.houseItemId,
              expectedUnitPrice: match.priceCdf,
            });
          }
        }

        if (migratedItems.length === 0) return false;

        set({
          houseId: newHouseId,
          houseName: newHouseName,
          items: migratedItems,
          pendingSwitch: null,
          showSwitchModal: false,
        });
        return true;
      },
    }),
    {
      name: "safihub_cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
