import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/home/header/navbar";
import { getCurrentUser } from "@/services/auth";
import {
  getCachedCustomerHouseProfile,
  getCachedHouseReviews,
  getCachedHouseRatingStats,
  getCachedNeighborhoods,
  getCachedZoneFees,
  getCachedExchangeRate,
} from "@/lib/cached-data";
import { getCustomerDeliveredOrdersEligibleForReview } from "@/dal/review.dal";
import { checkUserHouseAccess } from "@/dal";
import { HouseCatalogueView } from "@/components/houses/detail/house-catalogue-view";
import { HouseDetailSkeleton } from "@/components/houses/detail/house-detail-skeleton";
import { PressingJsonLd } from "@/components/houses/detail/pressing-json-ld";
import { getAppBaseUrl } from "@/lib/app-url";

interface HouseDetailPageProps {
  params: Promise<{ houseSlug: string }>;
}

export async function generateMetadata({
  params,
}: HouseDetailPageProps): Promise<Metadata> {
  const { houseSlug } = await params;
  const res = await getCachedCustomerHouseProfile(houseSlug);
  const isApproved =
    res.ok && res.value?.house?.reviewStatus
      ? res.value.house.reviewStatus === "approved"
      : true;
  if (!res.ok || !res.value.house.isActive || !isApproved) {
    return {
      title: "Pressing introuvable | SafiHub",
      robots: { index: false, follow: false },
    };
  }

  const { house } = res.value;
  const cover = house.coverImageUrl || house.imageUrl;
  const title = `${house.name} - Services & Tarifs | SafiHub Bukavu`;
  const description = `Consultez les tarifs de pressing, lavage et repassage de ${house.name} à ${house.neighborhoodName}, Bukavu. Délais garantis et paiement à la livraison.`;
  const baseUrl = getAppBaseUrl();
  const pageUrl = `${baseUrl}/houses/${house.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      images: [
        {
          url: cover,
          width: 1200,
          height: 630,
          alt: `Pressing ${house.name} à Bukavu`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cover],
    },
  };
}

async function HouseDetailContent({ params }: HouseDetailPageProps) {
  const { houseSlug } = await params;
  const [user, profileRes] = await Promise.all([
    getCurrentUser(),
    getCachedCustomerHouseProfile(houseSlug),
  ]);

  if (!profileRes.ok || !profileRes.value.house.isActive) {
    notFound();
  }

  const data = profileRes.value;
  const isApproved = data.house.reviewStatus
    ? data.house.reviewStatus === "approved"
    : true;

  let isPreviewAllowed = false;
  if (!isApproved) {
    if (user?.role === "admin") {
      isPreviewAllowed = true;
    } else if (user?.id) {
      isPreviewAllowed = await checkUserHouseAccess(user.id, data.house.id);
    }

    if (!isPreviewAllowed) {
      notFound();
    }
  }

  const [
    reviewsData,
    stats,
    eligibleOrders,
    neighborhoods,
    zoneFeesRows,
    rateRecord,
  ] = await Promise.all([
    getCachedHouseReviews(data.house.id, 10),
    getCachedHouseRatingStats(data.house.id),
    user
      ? getCustomerDeliveredOrdersEligibleForReview(user.id, data.house.id)
      : Promise.resolve([]),
    getCachedNeighborhoods(),
    getCachedZoneFees(),
    getCachedExchangeRate("USD", "CDF"),
  ]);

  const zoneFeesMap: Record<string, number> = {};
  for (const fee of zoneFeesRows) {
    if (fee.houseZoneId === data.house.zoneId) {
      zoneFeesMap[fee.customerZoneId] = fee.deliveryFee;
    }
  }

  const usdExchangeRate = rateRecord?.rate ? Number(rateRecord.rate) : 2800;
  const baseUrl = getAppBaseUrl();
  const pageUrl = `${baseUrl}/houses/${data.house.slug}`;

  return (
    <>
      <PressingJsonLd house={data.house} url={pageUrl} />
      {!isApproved && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 py-2.5 px-4 text-center text-xs font-bold flex items-center justify-center gap-2">
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          <span>
            Aperçu, non visible par les clients (en attente de validation par
            SafiHub)
          </span>
        </div>
      )}
      <Navbar variant="solid" user={user} />
      <main className="flex-1">
        <HouseCatalogueView
          data={data}
          initialReviews={reviewsData.reviews}
          stats={stats}
          eligibleOrders={eligibleOrders}
          neighborhoods={neighborhoods}
          zoneFees={zoneFeesMap}
          usdExchangeRate={usdExchangeRate}
          isAuthenticated={Boolean(user)}
        />
      </main>
    </>
  );
}

export default function CustomerHouseDetailPage({
  params,
}: HouseDetailPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Suspense
        fallback={
          <>
            <Navbar variant="solid" user={null} />
            <main className="flex-1">
              <HouseDetailSkeleton />
            </main>
          </>
        }
      >
        <HouseDetailContent params={params} />
      </Suspense>
    </div>
  );
}
