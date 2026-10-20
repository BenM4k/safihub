"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShoppingBag, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { SlotPicker } from "./slot-picker";
import { AddressPicker } from "./address-picker";
import { PriceChangeModal } from "./price-change-modal";
import { Button } from "@/components/ui/button";
import { useCartHydrated } from "@/lib/stores/use-cart-hydrated";
import {
  checkoutOrderAction,
  getCartEstimateAction,
} from "@/actions/customer-order.actions";
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
  const t = useTranslations("checkout");
  const router = useRouter();
  const cart = useCartHydrated();

  // Mint idempotency key once per checkout view (AC 3)
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [nextProposedSlot, setNextProposedSlot] = useState<TimeSlot | null>(null);

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

  const [serverError, setServerError] = useState<string | null>(null);
  const [priceChangeDetails, setPriceChangeDetails] = useState<Record<string, unknown> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtotalCdf, setSubtotalCdf] = useState(0);
  const [deliveryFeeCdf, setDeliveryFeeCdf] = useState(0);

  // Recalculate estimate whenever cart items or neighborhood change
  useEffect(() => {
    if (!cart.isHydrated || !cart.houseId || cart.items.length === 0) return;

    let isMounted = true;
    getCartEstimateAction(
      cart.houseId,
      cart.items.map((i) => ({
        houseItemId: i.houseItemId,
        serviceId: i.serviceId,
        itemId: i.itemId,
        fabricId: i.fabricId,
        quantity: i.quantity,
        expectedUnitPrice: i.expectedUnitPrice,
      })),
      neighborhoodId || undefined
    ).then((res) => {
      if (isMounted && res.success && res.data) {
        setSubtotalCdf(res.data.itemsTotal);
        setDeliveryFeeCdf(res.data.deliveryFee);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [cart.isHydrated, cart.houseId, cart.items, neighborhoodId]);

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

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double-tap on UI (AC 3)

    if (!selectedSlot) {
      setServerError("Veuillez sélectionner un créneau de collecte.");
      return;
    }
    if (!neighborhoodId) {
      setServerError("Veuillez sélectionner votre quartier.");
      return;
    }
    if (!landmark.trim()) {
      setServerError("Veuillez indiquer un point de repère précis.");
      return;
    }
    if (!phone.trim()) {
      setServerError("Veuillez indiquer un numéro de téléphone de contact.");
      return;
    }

    setServerError(null);
    setIsSubmitting(true);

    const res = await checkoutOrderAction({
      idempotencyKey,
      houseId: cart.houseId!,
      customerNeighborhoodId: neighborhoodId,
      landmark: landmark.trim(),
      contactPhone: phone.trim(),
      customerName: customerName.trim(),
      pickupSlot: selectedSlot,
      items: cart.items.map((i) => ({
        houseItemId: i.houseItemId,
        serviceId: i.serviceId,
        itemId: i.itemId,
        fabricId: i.fabricId,
        quantity: i.quantity,
        expectedUnitPrice: i.expectedUnitPrice,
      })),
      source: "app",
      paymentCurrency: "CDF",
    });

    setIsSubmitting(false);

    if (!res.success) {
      setServerError(res.error || "Une erreur est survenue lors de la commande.");

      // AC 1: slot refused -> propose next slot
      if (res.nextAvailableSlot) {
        setNextProposedSlot(res.nextAvailableSlot);
      }

      // AC 2: price changed -> open confirmation modal
      if (res.failureCode === "PRICE_CHANGED" && res.details) {
        setPriceChangeDetails(res.details);
      }
      return;
    }

    // Success: clear cart and navigate
    cart.clearCart();
    if (user) {
      router.push(`/orders/${res.orderId}`);
    } else {
      router.push(`/track/${res.trackingToken}`);
    }
  };

  if (!cart.isHydrated) return null;

  if (cart.items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100dvh-14rem)] py-12 px-4 text-center">
        <div className="p-8 sm:p-10 text-center bg-card rounded-3xl border border-border shadow-xs max-w-md w-full flex flex-col items-center">
          <div className="size-16 sm:size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-5 shadow-2xs">
            <ShoppingBag className="size-8 sm:size-10" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-heading tracking-tight mb-2">
            {t("emptyCartTitle")}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
            {t("emptyCartDesc")}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/houses")}
            className="w-full sm:w-auto font-bold px-6 shadow-sm cursor-pointer"
          >
            {t("browseHouses")}
          </Button>
        </div>
      </div>
    );
  }

  const totalDue = subtotalCdf + deliveryFeeCdf;

  return (
    <form onSubmit={handleSubmitOrder} className="max-w-6xl mx-auto w-full space-y-6 flex-1 flex flex-col">
      <PriceChangeModal
        isOpen={Boolean(priceChangeDetails)}
        details={priceChangeDetails || undefined}
        onConfirm={handleAcceptPriceChange}
        onCancel={() => setPriceChangeDetails(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-heading tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pressing sélectionné : <span className="font-bold text-heading">{cart.houseName}</span>
          </p>
        </div>
      </div>

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
        {/* Left Column: Form steps */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* 1. Slot Picker (AC 1) */}
          <SlotPicker
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
          />

          {/* 2. Address Picker */}
          <AddressPicker
            savedAddresses={savedAddresses}
            neighborhoods={neighborhoods}
            selectedAddressId={selectedAddressId}
            onSelectSavedAddress={handleSelectSavedAddress}
            neighborhoodId={neighborhoodId}
            onChangeNeighborhood={(id) => {
              setNeighborhoodId(id);
              setSelectedAddressId(null);
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
        </div>

        {/* Right Column: Sticky Summary & Confirmation */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="p-5 sm:p-6 bg-card rounded-2xl border border-border shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-heading border-b border-border pb-3">
              {t("stepReview")}
            </h3>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t("subtotalWithCount", { count: cart.items.reduce((a, b) => a + b.quantity, 0) })}</span>
                <span className="font-semibold text-heading">{subtotalCdf.toLocaleString("fr-FR")} CDF</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t("deliveryFeeLabel")}</span>
                <span className="font-semibold text-heading">{deliveryFeeCdf.toLocaleString("fr-FR")} CDF</span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between text-sm sm:text-base font-black text-heading">
                <span>{t("amountDueOnDelivery")}</span>
                <span className="text-primary text-base sm:text-lg">{totalDue.toLocaleString("fr-FR")} CDF</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 border border-border flex items-center gap-2.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t("cashOnDelivery")}</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full font-bold py-4 text-base rounded-2xl shadow-sm gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? t("submitting") : t("submitOrder")}</span>
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
