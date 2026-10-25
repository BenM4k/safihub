import { describe, expect, it } from "vitest";
import {
  partnerApplicationSchema,
  getPartnerApplicationSchema,
} from "../validations/partner-application.schema";

describe("Partner Application Schema", () => {
  const validPayload = {
    houseName: "Pressing du Lac",
    contactName: "Espoir Bahati",
    phone: "+243999123456",
    email: "contact@pressinglelac.com",
    neighborhoodId: "neigh-1",
  };

  it("validates a complete and valid payload", () => {
    const res = partnerApplicationSchema.safeParse(validPayload);
    expect(res.success).toBe(true);
  });

  it("accepts neighborhoodText when neighborhoodId is empty", () => {
    const res = partnerApplicationSchema.safeParse({
      ...validPayload,
      neighborhoodId: null,
      neighborhoodText: "Muhumba, Av. de la Paix",
    });
    expect(res.success).toBe(true);
  });

  it("fails if both neighborhoodId and neighborhoodText are missing", () => {
    const res = partnerApplicationSchema.safeParse({
      ...validPayload,
      neighborhoodId: null,
      neighborhoodText: "",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toBe("NEIGHBORHOOD_REQUIRED");
    }
  });

  it("fails on invalid email format", () => {
    const res = partnerApplicationSchema.safeParse({
      ...validPayload,
      email: "invalid-email-address",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toBe("EMAIL_INVALID");
    }
  });

  it("fails on empty email", () => {
    const res = partnerApplicationSchema.safeParse({
      ...validPayload,
      email: "",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toBe("EMAIL_REQUIRED");
    }
  });

  it("works with localized schema translator", () => {
    const t = (k: string) => `trans_${k}`;
    const schema = getPartnerApplicationSchema(t);
    const res = schema.safeParse({
      ...validPayload,
      email: "bad",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toBe("trans_emailInvalid");
    }
  });
});
