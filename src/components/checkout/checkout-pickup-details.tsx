"use client";

import { SlotPicker } from "./slot-picker";
import { AddressPicker } from "./address-picker";
import type { TimeSlot } from "@/services/availability";
import type { CustomerAddressRecord, NeighborhoodRecord } from "@/dal";

interface CheckoutPickupDetailsProps {
  serverSlots: TimeSlot[];
  isSlotsLoading: boolean;
  neighborhoodId: string | null;
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  nextProposedSlot: TimeSlot | null;
  onAcceptProposedSlot: (slot: TimeSlot) => void;
  savedAddresses: CustomerAddressRecord[];
  neighborhoods: NeighborhoodRecord[];
  selectedAddressId: string | null;
  onSelectSavedAddress: (addr: CustomerAddressRecord) => void;
  onChangeNeighborhood: (id: string) => void;
  landmark: string;
  onChangeLandmark: (val: string) => void;
  phone: string;
  onChangePhone: (val: string) => void;
  customerName: string;
  onChangeCustomerName: (val: string) => void;
  isGuest: boolean;
}

export function CheckoutPickupDetails({
  serverSlots,
  isSlotsLoading,
  neighborhoodId,
  selectedSlot,
  onSelectSlot,
  nextProposedSlot,
  onAcceptProposedSlot,
  savedAddresses,
  neighborhoods,
  selectedAddressId,
  onSelectSavedAddress,
  onChangeNeighborhood,
  landmark,
  onChangeLandmark,
  phone,
  onChangePhone,
  customerName,
  onChangeCustomerName,
  isGuest,
}: CheckoutPickupDetailsProps) {
  return (
    <div className="lg:col-span-7 xl:col-span-8 space-y-6">
      <SlotPicker
        slots={serverSlots}
        isLoading={isSlotsLoading}
        neighborhoodSelected={Boolean(neighborhoodId)}
        selectedSlot={selectedSlot}
        onSelectSlot={onSelectSlot}
        nextProposedSlot={nextProposedSlot}
        onAcceptProposedSlot={onAcceptProposedSlot}
      />

      <AddressPicker
        savedAddresses={savedAddresses}
        neighborhoods={neighborhoods}
        selectedAddressId={selectedAddressId}
        onSelectSavedAddress={onSelectSavedAddress}
        neighborhoodId={neighborhoodId ?? ""}
        onChangeNeighborhood={onChangeNeighborhood}
        landmark={landmark}
        onChangeLandmark={onChangeLandmark}
        phone={phone}
        onChangePhone={onChangePhone}
        customerName={customerName}
        onChangeCustomerName={onChangeCustomerName}
        isGuest={isGuest}
      />
    </div>
  );
}
