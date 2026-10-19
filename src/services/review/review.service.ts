import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  findReviewByOrderId,
  insertReview,
  insertReviewReply,
  insertReviewReport,
  setReviewModerationStatus,
} from "@/dal/review.dal";
import { getOrderById } from "@/dal/order.dal";
import { checkUserHouseAccess } from "@/dal/house.dal";
import type { Review, ReviewReply, ReviewReport } from "@/services/db/schema/review";

export interface SubmitReviewInput {
  orderId: string;
  houseId: string;
  rating: number;
  ratingQuality?: number | null;
  ratingPunctuality?: number | null;
  ratingCare?: number | null;
  ratingValue?: number | null;
  comment?: string | null;
  photos?: string[];
}

export interface SubmitReviewReplyInput {
  reviewId: string;
  houseId: string;
  text: string;
}

export interface ModerateReviewInput {
  reviewId: string;
  status: "published" | "hidden" | "pending";
  reason: string;
}

/**
 * Checks text for phone numbers, URLs, or obvious spam to flag for moderation.
 */
function checkForSpamOrPII(text?: string | null): boolean {
  if (!text) return false;
  // Regex for phone numbers (DRC +243 or local 09..., 08...)
  const phonePattern = /(?:\+?243|0)[0-9]{8,10}\b/;
  // Regex for URLs
  const urlPattern = /(https?:\/\/|www\.)[^\s]+/i;

  return phonePattern.test(text) || urlPattern.test(text);
}

/**
 * Submits a new review for a delivered order.
 */
export async function submitReview(
  customerId: string,
  input: SubmitReviewInput
): Promise<Result<Review>> {
  if (!customerId) {
    return err("Utilisateur non authentifié.");
  }

  // 1. Rating validation
  if (!input.rating || input.rating < 1 || input.rating > 5 || !Number.isInteger(input.rating)) {
    return err("La note globale doit être un entier compris entre 1 et 5.");
  }

  if (input.comment && input.comment.length > 1000) {
    return err("Le commentaire ne doit pas dépasser 1000 caractères.");
  }

  // 2. Fetch order to verify eligibility
  const order = await getOrderById(input.orderId);
  if (!order) {
    return err("Commande introuvable.");
  }

  if (order.customerId !== customerId) {
    return err("Vous ne pouvez évaluer que vos propres commandes.");
  }

  if (order.houseId !== input.houseId) {
    return err("La commande ne correspond pas à cet établissement de pressing.");
  }

  if (order.status !== "delivered") {
    return err("Seules les commandes livrées peuvent faire l'objet d'un avis.");
  }

  // 3. Unique review per order check
  const existingReview = await findReviewByOrderId(input.orderId);
  if (existingReview) {
    return err("Vous avez déjà soumis un avis pour cette commande.");
  }

  // 4. Auto-flagging for spam / PII
  const hasSuspiciousContent = checkForSpamOrPII(input.comment);
  const status = hasSuspiciousContent ? "pending" : "published";

  // 5. Insert review
  const created = await insertReview({
    orderId: input.orderId,
    houseId: input.houseId,
    customerId,
    rating: input.rating,
    ratingQuality: input.ratingQuality ?? null,
    ratingPunctuality: input.ratingPunctuality ?? null,
    ratingCare: input.ratingCare ?? null,
    ratingValue: input.ratingValue ?? null,
    comment: input.comment?.trim() || null,
    photos: input.photos?.slice(0, 3) || [],
    status,
  });

  return ok(created);
}

/**
 * Submits a partner reply to a review.
 */
export async function submitReviewReply(
  userId: string,
  userRole: string | undefined,
  input: SubmitReviewReplyInput
): Promise<Result<ReviewReply>> {
  if (!userId) {
    return err("Non authentifié.");
  }

  // Check house membership or admin role
  const isAuthorized =
    userRole === "admin" || (await checkUserHouseAccess(userId, input.houseId));
  if (!isAuthorized) {
    return err("Vous n'êtes pas autorisé à répondre pour cet établissement.");
  }

  if (!input.text || input.text.trim().length === 0) {
    return err("La réponse ne peut pas être vide.");
  }

  if (input.text.length > 500) {
    return err("La réponse ne doit pas dépasser 500 caractères.");
  }

  try {
    const reply = await insertReviewReply({
      reviewId: input.reviewId,
      houseId: input.houseId,
      authorId: userId,
      text: input.text.trim(),
    });

    return ok(reply);
  } catch {
    return err("Une réponse a déjà été enregistrée pour cet avis.");
  }
}

/**
 * Reports a review for moderation.
 */
export async function reportReview(
  userId: string,
  input: { reviewId: string; reason: string }
): Promise<Result<ReviewReport>> {
  if (!userId) {
    return err("Non authentifié.");
  }

  if (!input.reason || input.reason.trim().length === 0) {
    return err("Le motif du signalement est obligatoire.");
  }

  const report = await insertReviewReport({
    reviewId: input.reviewId,
    reporterId: userId,
    reason: input.reason.trim(),
  });

  return ok(report);
}

/**
 * Moderates a review (admin only).
 */
export async function moderateReview(
  adminUser: { id: string; role?: string },
  input: ModerateReviewInput
): Promise<Result<Review>> {
  if (adminUser.role !== "admin") {
    return err("Action réservée aux administrateurs SafiHub.");
  }

  if (!input.reason || input.reason.trim().length === 0) {
    return err("Un motif de modération est obligatoire.");
  }

  const updated = await setReviewModerationStatus(
    input.reviewId,
    input.status,
    input.reason.trim()
  );

  if (!updated) {
    return err("Avis introuvable.");
  }

  return ok(updated);
}
