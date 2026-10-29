"use server";

import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { auth } from "@/services/auth/auth";
import { getCurrentUser } from "@/services/auth/guards";
import { clearUserMustChangePassword, getUserHouseMemberships } from "@/dal";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { rateLimitPasswordChange } from "@/services/abuse";
import { err, ok, type Result } from "@/lib/result";
import { evaluatePasswordStrength } from "@/lib/user-guardrails";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe temporaire requis"),
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les deux mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message:
      "Le nouveau mot de passe doit être différent du mot de passe temporaire",
    path: ["newPassword"],
  });

export async function changeForcedPasswordAction(
  formData: FormData,
): Promise<Result<{ redirectUrl: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return err("Session expirée. Veuillez vous reconnecter.");
  }

  // Rate-limiting based on user id
  const limit = await rateLimitPasswordChange(user.id);
  if (!limit.allowed) {
    return err(
      "Trop de tentatives de modification de mot de passe. Veuillez patienter avant de réessayer.",
    );
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides.");
  }

  const { currentPassword, newPassword } = parsed.data;

  // Verify strength rules
  const strength = evaluatePasswordStrength(newPassword);
  if (!strength.isValid) {
    return err(
      "Le mot de passe doit comporter au moins 8 caractères et inclure au moins un chiffre ou un caractère spécial.",
    );
  }

  try {
    const reqHeaders = await headers();
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: reqHeaders,
    });
  } catch {
    return err(
      "Le mot de passe temporaire est incorrect ou votre session a expiré.",
    );
  }

  // Clear mustChangePassword flag
  try {
    await clearUserMustChangePassword(user.id);
    revalidateTag(CACHE_TAGS.userSession(user.id), "max");
  } catch {
    return err(
      "Votre mot de passe a bien été modifié mais la finalisation a échoué. Veuillez réessayer avec votre nouveau mot de passe comme mot de passe actuel et choisir un autre mot de passe.",
    );
  }

  // Determine redirect URL
  let redirectUrl = "/partner";
  if (user.role === "house") {
    const memberships = await getUserHouseMemberships(user.id);
    if (memberships.length > 0) {
      redirectUrl = `/partner/${memberships[0].houseSlug}`;
    }
  }

  return ok({ redirectUrl });
}
