import "server-only";
import { and, eq, ne, or } from "drizzle-orm";
import { db, schema } from "./db";
import { ok, err, type Result } from "@/lib/result";

export type ConsentDocumentType = "terms" | "privacy" | "photos";

export interface GuestMergeResult {
  guestUserId: string;
  targetUserId: string;
  ordersMerged: number;
  addressesMerged: number;
}

/**
 * Retrieves a user by their unique primary key ID.
 */
export async function getUserById(
  id: string
): Promise<typeof schema.user.$inferSelect | null> {
  const users = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, id))
    .limit(1);

  return users[0] ?? null;
}

/**
 * Retrieves a user by their unique email address.
 */
export async function getUserByEmail(
  email: string
): Promise<typeof schema.user.$inferSelect | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const users = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, normalizedEmail))
    .limit(1);

  return users[0] ?? null;
}

/**
 * Retrieves a user by their contact phone number.
 */
export async function getUserByContactPhone(
  phone: string
): Promise<typeof schema.user.$inferSelect | null> {
  const normalizedPhone = phone.trim();
  const users = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.contactPhone, normalizedPhone))
    .limit(1);

  return users[0] ?? null;
}

/**
 * Records an audit consent document acceptance for a user.
 */
export async function recordConsent({
  userId,
  document,
  version = "1.0",
}: {
  userId: string;
  document: ConsentDocumentType;
  version?: string;
}): Promise<Result<typeof schema.consents.$inferSelect>> {
  try {
    const existing = await db
      .select()
      .from(schema.consents)
      .where(eq(schema.consents.userId, userId));

    const alreadyAccepted = existing.find(
      (c) => c.document === document && c.version === version
    );

    if (alreadyAccepted) {
      return ok(alreadyAccepted);
    }

    const [inserted] = await db
      .insert(schema.consents)
      .values({
        id: crypto.randomUUID(),
        userId,
        document,
        version,
      })
      .returning();

    if (!inserted) {
      return err("Failed to record consent in database.");
    }

    return ok(inserted);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Database error recording consent."
    );
  }
}

/**
 * Retrieves all recorded consents for a given user.
 */
export async function getUserConsents(
  userId: string
): Promise<Array<typeof schema.consents.$inferSelect>> {
  return db
    .select()
    .from(schema.consents)
    .where(eq(schema.consents.userId, userId));
}

/**
 * Creates a guest user with placeholder email, isGuest=true, and no login credentials.
 * Used for phone and WhatsApp manual orders entered by administrators.
 */
export async function createGuestUser({
  name = "Client Invité",
  phone,
}: {
  name?: string;
  phone: string;
}): Promise<Result<typeof schema.user.$inferSelect>> {
  try {
    const guestId = `usr_${crypto.randomUUID()}`;
    const placeholderEmail = `guest-${guestId}@guest.invalid`;

    const [created] = await db
      .insert(schema.user)
      .values({
        id: guestId,
        name: name.trim() || "Client Invité",
        email: placeholderEmail,
        emailVerified: false,
        role: "customer",
        isGuest: true,
        status: "active",
        contactPhone: phone.trim(),
      })
      .returning();

    if (!created) {
      return err("Failed to create guest user record.");
    }

    return ok(created);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Database error creating guest user."
    );
  }
}

/**
 * Merges a guest customer account into a registered authenticated account.
 * Reassigns past orders, customer addresses, and marks the guest record as merged.
 */
export async function mergeGuestUser({
  guestUserId,
  targetUserId,
}: {
  guestUserId: string;
  targetUserId: string;
}): Promise<Result<GuestMergeResult>> {
  try {
    if (guestUserId === targetUserId) {
      return err("Cannot merge a user account into itself.");
    }

    const guestUser = await getUserById(guestUserId);
    if (!guestUser) {
      return err(`Guest user with ID ${guestUserId} not found.`);
    }

    if (!guestUser.isGuest) {
      return err(`User ${guestUserId} is not a guest account.`);
    }

    const targetUser = await getUserById(targetUserId);
    if (!targetUser) {
      return err(`Target user with ID ${targetUserId} not found.`);
    }

    if (targetUser.isGuest) {
      return err(`Target user ${targetUserId} cannot be a guest account.`);
    }

    // 1. Reassign orders from guest customer to registered user
    const updatedOrders = await db
      .update(schema.orders)
      .set({ customerId: targetUserId })
      .where(eq(schema.orders.customerId, guestUserId))
      .returning({ id: schema.orders.id });

    // 2. Reassign saved customer addresses
    const updatedAddresses = await db
      .update(schema.customerAddresses)
      .set({ userId: targetUserId })
      .where(eq(schema.customerAddresses.userId, guestUserId))
      .returning({ id: schema.customerAddresses.id });

    // 3. Mark the guest account as merged and blocked from further orders
    await db
      .update(schema.user)
      .set({
        isGuest: false,
        status: "merged",
        banned: true,
        banReason: `Merged into registered account ${targetUserId}`,
      })
      .where(eq(schema.user.id, guestUserId));

    return ok({
      guestUserId,
      targetUserId,
      ordersMerged: updatedOrders.length,
      addressesMerged: updatedAddresses.length,
    });
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Database error merging guest user."
    );
  }
}

/**
 * Updates or creates credential account password for a user.
 */
export async function setUserPasswordCredential({
  userId,
  hashedPassword,
}: {
  userId: string;
  hashedPassword: string;
}): Promise<Result<boolean>> {
  try {
    const existingAccounts = await db
      .select()
      .from(schema.account)
      .where(eq(schema.account.userId, userId));

    const credentialAccount = existingAccounts.find(
      (a) => a.providerId === "credential"
    );

    if (credentialAccount) {
      await db
        .update(schema.account)
        .set({ password: hashedPassword })
        .where(eq(schema.account.id, credentialAccount.id));
    } else {
      await db.insert(schema.account).values({
        id: crypto.randomUUID(),
        userId,
        accountId: userId,
        providerId: "credential",
        password: hashedPassword,
      });
    }

    return ok(true);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Failed to update account password credential."
    );
  }
}

/**
 * Blocks a user account: marks status as blocked, sets banned=true,
 * and immediately revokes all active sessions.
 */
export async function blockUserAccount({
  userId,
  reason = "Compte bloqué par l'administrateur",
}: {
  userId: string;
  reason?: string;
}): Promise<Result<typeof schema.user.$inferSelect>> {
  try {
    const [updated] = await db
      .update(schema.user)
      .set({
        status: "blocked",
        banned: true,
        banReason: reason,
      })
      .where(eq(schema.user.id, userId))
      .returning();

    if (!updated) {
      return err("Utilisateur introuvable.");
    }

    // Revoke all active sessions
    await db.delete(schema.session).where(eq(schema.session.userId, userId));

    return ok(updated);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Erreur de base de données lors du blocage."
    );
  }
}

/**
 * Unblocks a user account: restores status to active and lifts ban.
 */
export async function unblockUserAccount(
  userId: string
): Promise<Result<typeof schema.user.$inferSelect>> {
  try {
    const [updated] = await db
      .update(schema.user)
      .set({
        status: "active",
        banned: false,
        banReason: null,
        banExpires: null,
      })
      .where(eq(schema.user.id, userId))
      .returning();

    if (!updated) {
      return err("Utilisateur introuvable.");
    }

    return ok(updated);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Erreur de base de données lors du déblocage."
    );
  }
}

/**
 * Updates a user's role in the database.
 */
export async function updateUserRole({
  userId,
  role,
}: {
  userId: string;
  role: string;
}): Promise<Result<typeof schema.user.$inferSelect>> {
  try {
    const [updated] = await db
      .update(schema.user)
      .set({ role })
      .where(eq(schema.user.id, userId))
      .returning();

    if (!updated) {
      return err("Utilisateur introuvable.");
    }

    return ok(updated);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Erreur de mise à jour du rôle."
    );
  }
}

/**
 * Checks whether a given contact phone number or email address is associated
 * with a blocked or banned account.
 */
export async function isPhoneOrEmailBlocked(params: {
  phone?: string;
  email?: string;
}): Promise<boolean> {
  const conditions = [];
  if (params.phone?.trim()) {
    conditions.push(eq(schema.user.contactPhone, params.phone.trim()));
  }
  if (params.email?.trim()) {
    conditions.push(eq(schema.user.email, params.email.toLowerCase().trim()));
  }

  if (conditions.length === 0) return false;

  const users = await db
    .select({ status: schema.user.status, banned: schema.user.banned })
    .from(schema.user)
    .where(
      and(
        or(...conditions),
        ne(schema.user.status, "merged"),
        or(eq(schema.user.status, "blocked"), eq(schema.user.banned, true))
      )
    )
    .limit(1);

  return users.length > 0;
}

