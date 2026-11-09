import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "SafiHub — Pressing & Blanchisserie à Bukavu";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  let logoBase64 = "";
  try {
    const logoBuffer = await readFile(join(process.cwd(), "public", "logo-dark.png"));
    logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    logoBase64 = "";
  }

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
        {/* Top Header: Brand Logo & City Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {logoBase64 ? (
              <img
                src={logoBase64}
                width={52}
                height={52}
                style={{ objectFit: "contain" }}
                alt="SafiHub Logo"
              />
            ) : (
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "#2824D5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  fontWeight: "bold",
                  color: "#FFFFFF",
                }}
              >
                S
              </div>
            )}
            <span
              style={{
                fontSize: "36px",
                fontWeight: "900",
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                display: "flex",
              }}
            >
              Safi<span style={{ color: "#38BDF8" }}>Hub</span>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "999px",
              backgroundColor: "rgba(40, 36, 213, 0.25)",
              border: "1px solid rgba(40, 36, 213, 0.5)",
              color: "#93C5FD",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            <span>📍 Bukavu, Sud-Kivu, RDC</span>
          </div>
        </div>

        {/* Main Center Headline: Short, Punchy, High Impact */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <h1
            style={{
              fontSize: "64px",
              lineHeight: 1.1,
              fontWeight: "900",
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              margin: 0,
            }}
          >
            Le Pressing Moderne <span style={{ color: "#38BDF8" }}>à Bukavu</span>
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#94A3B8",
              margin: 0,
              maxWidth: "850px",
              lineHeight: 1.4,
            }}
          >
            Collecte & livraison à domicile en 24h à 48h. Double comptage au seuil
            et paiement Cash on Delivery CDF ou USD.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            borderTop: "1px solid rgba(148, 163, 184, 0.2)",
            paddingTop: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#CBD5E1",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Collecte 24h-48h</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#CBD5E1",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Contrôle au seuil</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#CBD5E1",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Cash on Delivery CDF / USD</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
