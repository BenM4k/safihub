import type { CustomerHouseDetailData } from "@/dal";

interface PressingJsonLdProps {
  house: CustomerHouseDetailData["house"];
  url: string;
}

export function PressingJsonLd({ house, url }: PressingJsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "DryCleaningOrLaundry",
    name: house.name,
    image: house.coverImageUrl || house.imageUrl,
    url,
    priceRange: "CDF",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bukavu",
      addressRegion: "Sud-Kivu",
      addressCountry: "CD",
      streetAddress: `${house.neighborhoodName}, ${house.zoneName}`,
    },
  };

  // Only include aggregateRating when real visible reviews meet the threshold of 3
  if (house.reviewCount >= 3 && house.rating !== null) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: house.rating,
      reviewCount: house.reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
