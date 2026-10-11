import { z } from "zod";

export type PartnerApplicationTranslator = (key: string) => string;

export function getPartnerApplicationSchema(
  t?: PartnerApplicationTranslator
) {
  const tr = t ?? ((k: string) => k);

  return z
    .object({
      houseName: z
        .string()
        .trim()
        .min(2, tr("validation.houseNameRequired")),
      contactName: z
        .string()
        .trim()
        .min(2, tr("validation.contactNameRequired")),
      phone: z
        .string()
        .trim()
        .min(6, tr("validation.phoneRequired")),
      email: z
        .string()
        .trim()
        .min(1, tr("validation.invalidEmail"))
        .email(tr("validation.invalidEmail")),
      neighborhoodId: z.string().optional(),
      neighborhoodText: z.string().optional(),
      addressNote: z.string().optional(),
      servicesNote: z.string().optional(),
      hoursNote: z.string().optional(),
      message: z.string().optional(),
    })
    .refine(
      (data) =>
        Boolean(
          (data.neighborhoodId && data.neighborhoodId.trim().length > 0) ||
            (data.neighborhoodText && data.neighborhoodText.trim().length > 0)
        ),
      {
        message: tr("validation.neighborhoodRequired"),
        path: ["neighborhoodId"],
      }
    );
}

export type PartnerApplicationFormValues = z.infer<
  ReturnType<typeof getPartnerApplicationSchema>
>;
