import { z } from "zod";

export type PartnerApplyTranslator = (key: string) => string;

export function getPartnerApplicationSchema(t: PartnerApplyTranslator) {
  return z
    .object({
      houseName: z
        .string()
        .trim()
        .min(2, t("houseNameRequired")),
      contactName: z
        .string()
        .trim()
        .min(2, t("contactNameRequired")),
      phone: z
        .string()
        .trim()
        .min(6, t("phoneRequired")),
      email: z
        .string()
        .trim()
        .min(1, t("emailRequired"))
        .email(t("emailInvalid")),
      neighborhoodId: z.string().trim().optional().nullable(),
      neighborhoodText: z.string().trim().optional().nullable(),
      addressNote: z.string().trim().optional().nullable(),
      servicesNote: z.string().trim().optional().nullable(),
      hoursNote: z.string().trim().optional().nullable(),
      message: z.string().trim().optional().nullable(),
    })
    .refine(
      (data) =>
        Boolean(data.neighborhoodId && data.neighborhoodId.length > 0) ||
        Boolean(data.neighborhoodText && data.neighborhoodText.length > 0),
      {
        message: t("neighborhoodRequired"),
        path: ["neighborhoodId"],
      }
    );
}

export const partnerApplicationSchema = z
  .object({
    houseName: z.string().trim().min(2, "HOUSE_NAME_REQUIRED"),
    contactName: z.string().trim().min(2, "CONTACT_NAME_REQUIRED"),
    phone: z.string().trim().min(6, "PHONE_REQUIRED"),
    email: z.string().trim().min(1, "EMAIL_REQUIRED").email("EMAIL_INVALID"),
    neighborhoodId: z.string().trim().optional().nullable(),
    neighborhoodText: z.string().trim().optional().nullable(),
    addressNote: z.string().trim().optional().nullable(),
    servicesNote: z.string().trim().optional().nullable(),
    hoursNote: z.string().trim().optional().nullable(),
    message: z.string().trim().optional().nullable(),
  })
  .refine(
    (data) =>
      Boolean(data.neighborhoodId && data.neighborhoodId.length > 0) ||
      Boolean(data.neighborhoodText && data.neighborhoodText.length > 0),
    {
      message: "NEIGHBORHOOD_REQUIRED",
      path: ["neighborhoodId"],
    }
  );

export type PartnerApplicationInput = z.infer<typeof partnerApplicationSchema>;
