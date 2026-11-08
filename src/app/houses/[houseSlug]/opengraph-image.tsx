import { ImageResponse } from "next/og";
import { getCachedCustomerHouseProfile } from "@/lib/cached-data";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ houseSlug: string }>;
}) {
  const { houseSlug } = await params;
  const res = await getCachedCustomerHouseProfile(houseSlug);
  const house = res.ok ? res.value.house : null;

  const houseName = house?.name || "Pressing Partenaire";
  const neighborhood = house?.neighborhoodName || "Bukavu";
  const turnaround = house?.turnaroundHours ? `${house.turnaroundHours}h` : "24h-48h";
  const rating =
    house?.rating && house.reviewCount >= 3
      ? `Note: ${house.rating.toFixed(1)}/5 (${house.reviewCount} avis)`
      : "Pressing Partenaire Certifié";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#101828",
          padding: "60px 80px",
          fontFamily: "sans-serif",
          color: "#FFFFFF",
        }}
      >
        {/* Brand bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "#2824D5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#FFFFFF",
              }}
            >
              S
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: "800",
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
              }}
            >
              SafiHub Bukavu
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "999px",
              backgroundColor: "rgba(40, 36, 213, 0.3)",
              color: "#93C5FD",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            <span>{rating}</span>
          </div>
        </div>

        {/* Center: House Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "20px",
              color: "#38BDF8",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Maison de Pressing à {neighborhood}
          </div>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "900",
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {houseName}
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#94A3B8",
              margin: 0,
              maxWidth: "800px",
            }}
          >
            Lavage, repassage et nettoyage à sec avec collecte et livraison à
            domicile à Bukavu.
          </p>
        </div>

        {/* Bottom Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            borderTop: "1px solid rgba(148, 163, 184, 0.2)",
            paddingTop: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#E2E8F0",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            <span style={{ color: "#38BDF8" }}>⏱</span>
            <span>Délai moyen: {turnaround}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#E2E8F0",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            <span style={{ color: "#38BDF8" }}>💵</span>
            <span>Paiement Cash CDF / USD</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#E2E8F0",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            <span style={{ color: "#38BDF8" }}>🛡️</span>
            <span>Contrôle au seuil</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

