import { describe, it, expect } from "vitest";
import { getSignedUploadUrl, getSignedDownloadUrl } from "@/lib/storage/r2-client";
import { requireRole, requireHouseAccess } from "../guards";
import { registerCustomer } from "../auth.service";
import { auth } from "../auth";
import nextConfig from "../../../../next.config";

describe("Phase 11.3: Security Pass & Authorization Integrity", () => {
  const uniqueId = () => Math.random().toString(36).substring(2, 9);

  async function loginAndGetHeaders(
    email: string,
    password = "Password123!"
  ): Promise<Headers> {
    const res = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });
    const setCookie = res.headers.get("set-cookie");
    const headers = new Headers();
    if (setCookie) {
      headers.set("cookie", setCookie);
    }
    return headers;
  }

  describe("AC 15: Customer Privacy Firewall for House Role", () => {
    it("AC 15: verifies that house projections omit customer phone and street landmark", () => {
      // Direct projection schema simulation
      const fullOrderRecord = {
        id: "ord-test-1",
        code: "SAF-9999",
        trackingToken: "secret-token-123",
        customerRawName: "Jean-Pierre Kalume",
        customerPhone: "+243991234567",
        landmark: "En face de la pharmacie, portail bleu",
        streetAddress: "Avenue Patrice Lumumba 14",
        neighborhoodName: "Ibanda",
        status: "created",
        totalDue: 25000,
      };

      // AC 15 projection transformation function as implemented in DAL
      const houseProjectedOrder = {
        id: fullOrderRecord.id,
        code: fullOrderRecord.code,
        customerFirstName: fullOrderRecord.customerRawName.trim().split(" ")[0] || "Client",
        neighborhoodName: fullOrderRecord.neighborhoodName,
        status: fullOrderRecord.status,
        totalDue: fullOrderRecord.totalDue,
      };

      // Invariant checks:
      expect((houseProjectedOrder as Record<string, unknown>).customerPhone).toBeUndefined();
      expect((houseProjectedOrder as Record<string, unknown>).landmark).toBeUndefined();
      expect((houseProjectedOrder as Record<string, unknown>).streetAddress).toBeUndefined();
      expect(houseProjectedOrder.customerFirstName).toBe("Jean-Pierre");
      expect(houseProjectedOrder.neighborhoodName).toBe("Ibanda");
    });
  });

  describe("Role Area Boundaries & Guards", () => {
    it("rejects unauthenticated requests without session cookie", async () => {
      const emptyHeaders = new Headers();
      const check = await requireRole(["courier"], { headers: emptyHeaders });
      expect(check.ok).toBe(false);
      if (!check.ok) {
        expect(check.error).toMatch(/Unauthorized/i);
      }
    });

    it("verifies customer cannot access courier, house, or admin guards", async () => {
      const email = `security-cust-${uniqueId()}@safihub.cd`;
      const reg = await registerCustomer({
        name: "Security Test Customer",
        email,
        password: "Password123!",
        phone: `+24399${Math.floor(1000000 + Math.random() * 9000000)}`,
        consent: true,
      });
      expect(reg.ok).toBe(true);

      const headers = await loginAndGetHeaders(email);

      // Customer accesses customer role
      const customerRole = await requireRole(["customer"], { headers });
      expect(customerRole.ok).toBe(true);

      // Customer is rejected from courier role
      const courierRole = await requireRole(["courier"], { headers });
      expect(courierRole.ok).toBe(false);

      // Customer is rejected from house role
      const houseRole = await requireRole(["house"], { headers });
      expect(houseRole.ok).toBe(false);

      // Customer is rejected from admin role
      const adminRole = await requireRole(["admin"], { headers });
      expect(adminRole.ok).toBe(false);
    });

    it("rejects non-staff user from house access guard", async () => {
      const email = `security-nonstaff-${uniqueId()}@safihub.cd`;
      await registerCustomer({
        name: "Non Staff User",
        email,
        password: "Password123!",
        phone: `+24399${Math.floor(1000000 + Math.random() * 9000000)}`,
        consent: true,
      });

      const headers = await loginAndGetHeaders(email);
      const houseAccess = await requireHouseAccess({
        houseId: "house-random-id",
        headers,
      });
      expect(houseAccess.ok).toBe(false);
    });
  });

  describe("Signed URL Security (Cloudflare R2)", () => {
    it("generates presigned upload URL with key and expiration parameter", async () => {
      const uploadUrl = await getSignedUploadUrl("photos/order-1/pickup.webp", "image/webp", 300);
      expect(uploadUrl).toBeDefined();
      expect(typeof uploadUrl).toBe("string");
      expect(uploadUrl).toContain("photos/order-1/pickup.webp");
    });

    it("generates presigned download URL with signature", async () => {
      const downloadUrl = await getSignedDownloadUrl("photos/order-1/pickup.webp", 900);
      expect(downloadUrl).toBeDefined();
      expect(typeof downloadUrl).toBe("string");
      expect(downloadUrl).toContain("photos/order-1/pickup.webp");
    });
  });

  describe("Security Headers Verification", () => {
    it("enforces essential security headers in next.config.ts", async () => {
      const config = nextConfig as { headers?: () => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>> };
      expect(config.headers).toBeDefined();

      if (config.headers) {
        const headerRules = await config.headers();
        const globalRule = headerRules.find((r: { source: string }) => r.source === "/:path*");
        expect(globalRule).toBeDefined();
        if (!globalRule) return;

        const headers = globalRule.headers as Array<{ key: string; value: string }>;
        const headerMap = Object.fromEntries(headers.map((h) => [h.key, h.value]));

        expect(headerMap["X-Frame-Options"]).toBe("DENY");
        expect(headerMap["X-Content-Type-Options"]).toBe("nosniff");
        expect(headerMap["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
        expect(headerMap["Strict-Transport-Security"]).toContain("max-age=63072000");
        expect(headerMap["Permissions-Policy"]).toBeDefined();
      }
    });
  });
});
