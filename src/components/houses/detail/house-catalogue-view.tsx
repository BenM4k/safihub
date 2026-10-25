"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SwitchHouseDialog } from "@/components/cart/switch-house-dialog";
import { useCartHydrated } from "@/lib/stores/use-cart-hydrated";
import { PressingBanner } from "./pressing-banner";
import { PressingIdentityHeader } from "./pressing-identity-header";
import { PressingGallery } from "./pressing-gallery";
import { PressingCategoryNav } from "./pressing-category-nav";
import { PressingArticleCard } from "./pressing-article-card";
import { PressingDecisionCard } from "./pressing-decision-card";
import { PressingDeliverySelector } from "./pressing-delivery-selector";
import { PressingPracticalInfo } from "./pressing-practical-info";
import { PressingReviewsSection } from "./pressing-reviews-section";
import { PressingMobileCartBar } from "./pressing-mobile-cart-bar";
import { PressingCartTransferBanner } from "./pressing-cart-transfer-banner";
import { HouseExclusionsBanner } from "./house-exclusions-banner";
import { usePressingArticles } from "./use-pressing-articles";
import { usePressingCartSubtotal } from "./use-pressing-cart-subtotal";
import { useHouseCatalogue } from "./use-house-catalogue";
import type { CustomerHouseDetailData } from "@/dal";
import type { HouseReviewItem, HouseReviewStatsData } from "@/dal/review.dal";

interface HouseCatalogueViewProps {
  data: CustomerHouseDetailData;
  initialReviews: HouseReviewItem[];
  stats: HouseReviewStatsData;
  eligibleOrders: Array<{ id: string; createdAt: Date }>;
  neighborhoods: Array<{ id: string; name: string; zoneId: string }>;
  zoneFees: Record<string, number>;
  usdExchangeRate?: number | null;
  isAuthenticated: boolean;
}

export function HouseCatalogueView({
  data,
  initialReviews,
  stats,
  eligibleOrders,
  neighborhoods,
  zoneFees,
  usdExchangeRate,
  isAuthenticated,
}: HouseCatalogueViewProps) {
  const router = useRouter();
  const cart = useCartHydrated();
  const t = useTranslations("customerHouses");

  const { activeSubtotal, totalItemsCount, getQuantityInCart } =
    usePressingCartSubtotal(data.house.id, cart);

  const {
    activeCategory,
    setActiveCategory,
    activeServiceSlug,
    setActiveServiceSlug,
    activeFabricId,
    setActiveFabricId,
    searchQuery,
    setSearchQuery,
    categoriesWithCounts,
    uniqueFabrics,
    filteredArticles,
  } = usePressingArticles(data.items);

  const { neighborhoodOptions, selectedNeighborhood, handleUpdateQuantity } =
    useHouseCatalogue(data.house.id, data.house.name, neighborhoods, zoneFees, cart);

  const isHouseAvailable = !data.house.isPaused;
  const handleProceedOrder = () => router.push("/checkout");

  return (
    <div className="min-h-screen bg-background pb-28">
      <SwitchHouseDialog />
      <PressingBanner
        name={data.house.name}
        coverImageUrl={data.house.coverImageUrl}
        logoUrl={data.house.logoUrl}
      />
      <PressingIdentityHeader house={data.house} />
      <PressingGallery
        photos={data.house.galleryImages || []}
        houseName={data.house.name}
      />

      {/* Mixed cart warning & transfer prompt */}
      <PressingCartTransferBanner
        houseId={data.house.id}
        houseName={data.house.name}
        items={data.items}
        cartHouseId={cart.houseId}
        cartItemsCount={cart.items.length}
        isHydrated={cart.isHydrated}
        onTransfer={(hId, hName, itms) => cart.transferCartToHouse(hId, hName, itms)}
      />

      {/* Exclusions banner */}
      <HouseExclusionsBanner exclusions={data.exclusions} />

      {/* Sticky Category Bar with search, filters & chips */}
      <PressingCategoryNav
        categories={categoriesWithCounts}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        services={data.services}
        activeServiceSlug={activeServiceSlug}
        onSelectService={setActiveServiceSlug}
        fabrics={uniqueFabrics}
        activeFabricId={activeFabricId}
        onSelectFabric={setActiveFabricId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Grid: Articles + Sticky Decision Card */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Catalogue Articles & Details */}
          <div className="lg:col-span-2 space-y-10">
            {filteredArticles.length === 0 ? (
              <div className="py-16 text-center bg-card rounded-3xl border border-border p-6">
                <p className="text-sm text-muted-foreground font-medium">
                  {t("noArticlesMatch")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredArticles.map((art) => (
                  <PressingArticleCard
                    key={art.key}
                    itemName={art.itemNameFr}
                    serviceName={art.serviceNameFr}
                    variants={art.variants}
                    getQuantityInCart={getQuantityInCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    isHouseAvailable={isHouseAvailable}
                    usdExchangeRate={usdExchangeRate}
                  />
                ))}
              </div>
            )}

            {/* Neighborhood Delivery Selector */}
            <PressingDeliverySelector
              neighborhoods={neighborhoodOptions}
              selectedNeighborhoodId={cart.customerNeighborhoodId}
              onSelectNeighborhood={(id) => cart.setCustomerNeighborhoodId(id)}
            />

            {/* Practical Information */}
            <PressingPracticalInfo
              weeklyHours={data.weeklyHours}
              description={data.house.description}
              createdAt={data.house.createdAt}
            />

            {/* Customer Reviews Section */}
            <PressingReviewsSection
              houseId={data.house.id}
              houseName={data.house.name}
              initialReviews={initialReviews}
              stats={stats}
              eligibleOrders={eligibleOrders}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {/* Right Column: Desktop Sticky Decision Card */}
          <div className="hidden lg:block">
            <PressingDecisionCard
              turnaroundHours={data.house.turnaroundHours}
              minimumOrderAmount={data.house.minimumOrderAmount}
              subtotalCdf={activeSubtotal}
              totalItemsCount={totalItemsCount}
              isPaused={Boolean(data.house.isPaused)}
              isOpenNow={Boolean(data.house.isOpenNow)}
              deliveryFee={selectedNeighborhood?.deliveryFeeCdf ?? null}
              neighborhoodName={selectedNeighborhood?.name}
              onProceedOrder={handleProceedOrder}
            />
          </div>
        </div>
      </main>

      {/* Mobile Sticky Cart Bar */}
      <PressingMobileCartBar
        totalItemsCount={totalItemsCount}
        subtotalCdf={activeSubtotal}
        minimumOrderAmount={data.house.minimumOrderAmount}
        onProceedOrder={handleProceedOrder}
        houseName={data.house.name}
      />
    </div>
  );
}
