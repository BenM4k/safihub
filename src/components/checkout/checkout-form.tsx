"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { CheckoutPickupDetails } from "./checkout-pickup-details";
import { PriceChangeModal } from "./price-change-modal";
import { CheckoutSummary } from "./checkout-summary";
import { CheckoutHeader } from "./checkout-header";
import { EmptyCartView } from "./empty-cart-view";
import { usePickupSlots } from "./use-pickup-slots";
import { useCheckoutEstimate } from "./use-checkout-estimate";
import { useCheckoutSubmit } from "./use-checkout-submit";
import { useCartHydrated } from "@/lib/stores/use-cart-hydrated";
import type { CustomerAddressRecord, NeighborhoodRecord } from "@/dal";
import type { TimeSlot } from "@/services/availability";

interface CheckoutFormProps {
  user?: {
    id: string;
    name: string;
    email: string;
    contactPhone?: string | null;
  } | null;
  savedAddresses: CustomerAddressRecord[];
  neighborhoods: NeighborhoodRecord[];
}

export function CheckoutForm({
  user,
  savedAddresses,
  neighborhoods,
}: CheckoutFormProps) {
  const cart = useCartHydrated();

  // Mint idempotency key once per checkout view (AC 3)
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.find((a) => a.isDefault)?.id || null
  );
  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  const [neighborhoodId, setNeighborhoodId] = useState<string>(
    defaultAddr?.neighborhoodId || cart.customerNeighborhoodId || ""
  );
  const [landmark, setLandmark] = useState<string>(defaultAddr?.landmark || "");
  const [phone, setPhone] = useState<string>(
    defaultAddr?.phone || user?.contactPhone || ""
  );
  const [customerName, setCustomerName] = useState<string>(user?.name || "");

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [priceChangeDetails, setPriceChangeDetails] = useState<Record<string, unknown> | null>(null);

  // Server-side pickup slots (AC 1, AC 20)
  const {
    slots: serverSlots,
    nextProposedSlot,
    setNextProposedSlot,
    isLoading: isSlotsLoading,
  } = usePickupSlots(cart.houseId, neighborhoodId);

  // Cart totals and delivery fee estimate
  const { subtotalCdf, deliveryFeeCdf, totalDue } = useCheckoutEstimate({
    isHydrated: cart.isHydrated,
    houseId: cart.houseId,
    items: cart.items,
    neighborhoodId,
  });

  const { isSubmitting, serverError, setServerError, submitOrder } =
    useCheckoutSubmit({
      idempotencyKey,
      cart,
      neighborhoodId,
      landmark,
      phone,
      customerName,
      selectedSlot,
      user,
      setNextProposedSlot,
      setPriceChangeDetails,
    });

  const handleSelectSavedAddress = (addr: CustomerAddressRecord) => {
    setSelectedAddressId(addr.id);
    setNeighborhoodId(addr.neighborhoodId);
    setLandmark(addr.landmark);
    setPhone(addr.phone);
  };

  const handleAcceptPriceChange = () => {
    if (priceChangeDetails && typeof priceChangeDetails.newPrice === "number") {
      const sId = priceChangeDetails.serviceId as string;
      const itId = priceChangeDetails.itemId as string;
      const fId = priceChangeDetails.fabricId as string;
      cart.updateExpectedUnitPrice(sId, itId, fId, priceChangeDetails.newPrice);
    }
    setPriceChangeDetails(null);
    setServerError(null);
  };

  if (!cart.isHydrated) return null;
  if (cart.items.length === 0) return <EmptyCartView />;

  const totalItemsCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <form onSubmit={submitOrder} className="max-w-6xl mx-auto w-full space-y-6 flex-1 flex flex-col">
      <PriceChangeModal
        isOpen={Boolean(priceChangeDetails)}
        details={priceChangeDetails || undefined}
        onConfirm={handleAcceptPriceChange}
        onCancel={() => setPriceChangeDetails(null)}
      />

      <CheckoutHeader houseName={cart.houseName || ""} />

      {serverError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in-50"
        >
          <AlertCircle className="size-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <CheckoutPickupDetails
          serverSlots={serverSlots}
          isSlotsLoading={isSlotsLoading}
          neighborhoodId={neighborhoodId}
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => {
            setSelectedSlot(slot);
            setNextProposedSlot(null);
          }}
          nextProposedSlot={nextProposedSlot}
          onAcceptProposedSlot={(slot) => {
            setSelectedSlot(slot);
            setNextProposedSlot(null);
          }}
          savedAddresses={savedAddresses}
          neighborhoods={neighborhoods}
          selectedAddressId={selectedAddressId}
          onSelectSavedAddress={handleSelectSavedAddress}
          onChangeNeighborhood={(id) => {
            setNeighborhoodId(id);
            setSelectedAddressId(null);
            setSelectedSlot(null);
          }}
          landmark={landmark}
          onChangeLandmark={(val) => {
            setLandmark(val);
            setSelectedAddressId(null);
          }}
          phone={phone}
          onChangePhone={(val) => {
            setPhone(val);
            setSelectedAddressId(null);
          }}
          customerName={customerName}
          onChangeCustomerName={setCustomerName}
          isGuest={!user}
        />

        <CheckoutSummary
          totalItemsCount={totalItemsCount}
          subtotalCdf={subtotalCdf}
          deliveryFeeCdf={deliveryFeeCdf}
          totalDue={totalDue}
          isSubmitting={isSubmitting}
        />
      </div>
    </form>
  );
}
