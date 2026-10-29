"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/services/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  submitReview,
  submitReviewReply,
  reportReview,
  moderateReview,
} from "@/services/review";

const SubmitReviewSchema = z.object({
  orderId: z.string().uuid("Identifiant de commande invalide"),
  houseId: z.string().uuid("Identifiant de pressing invalide"),
  rating: z.number().int().min(1).max(5),
  ratingQuality: z.number().int().min(1).max(5).optional().nullable(),
  ratingPunctuality: z.number().int().min(1).max(5).optional().nullable(),
  ratingCare: z.number().int().min(1).max(5).optional().nullable(),
  ratingValue: z.number().int().min(1).max(5).optional().nullable(),
  comment: z.string().max(1000).optional().nullable(),
  photos: z.array(z.string().url()).max(3).optional(),
});

const SubmitReplySchema = z.object({
  reviewId: z.string().uuid("Identifiant d'avis invalide"),
  houseId: z.string().uuid("Identifiant de pressing invalide"),
  text: z.string().min(1, "La réponse ne peut pas être vide").max(500),
});

const ReportReviewSchema = z.object({
  reviewId: z.string().uuid("Identifiant d'avis invalide"),
  reason: z.string().min(1, "Un motif est obligatoire").max(300),
});

const ModerateReviewSchema = z.object({
  reviewId: z.string().uuid("Identifiant d'avis invalide"),
  status: z.enum(["published", "hidden", "pending"]),
  reason: z.string().min(1, "Un motif est obligatoire"),
});

export async function submitReviewAction(rawInput: unknown) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté pour laisser un avis." };
  }

  const parsed = SubmitReviewSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Données invalides." };
  }

  const res = await submitReview(user.id, parsed.data);
  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidateTag(CACHE_TAGS.housesList, "max");
  revalidateTag(CACHE_TAGS.house(parsed.data.houseId), "max");
  revalidatePath(`/houses`);
  return { success: true, data: res.value };
}

export async function submitReviewReplyAction(rawInput: unknown) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const parsed = SubmitReplySchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Données invalides." };
  }

  const res = await submitReviewReply(user.id, user.role, parsed.data);
  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidateTag(CACHE_TAGS.housesList, "max");
  revalidateTag(CACHE_TAGS.house(parsed.data.houseId), "max");
  revalidatePath(`/houses`);
  return { success: true, data: res.value };
}

export async function reportReviewAction(rawInput: unknown) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const parsed = ReportReviewSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Données invalides." };
  }

  const res = await reportReview(user.id, parsed.data);
  if (!res.ok) {
    return { success: false, error: res.error };
  }

  return { success: true, data: res.value };
}

export async function moderateReviewAction(rawInput: unknown) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { success: false, error: "Action réservée aux administrateurs." };
  }

  const parsed = ModerateReviewSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Données invalides." };
  }

  const res = await moderateReview(user, parsed.data);
  if (!res.ok) {
    return { success: false, error: res.error };
  }

  revalidateTag(CACHE_TAGS.housesList, "max");
  revalidatePath(`/houses`);
  return { success: true, data: res.value };
}
