import { describe, expect, it } from "vitest";
import { db, schema, clearUserMustChangePassword } from "@/dal";
import { eq } from "drizzle-orm";
import { changePasswordSchema } from "@/actions/auth-password.actions";

describe("First-Login Forced Password Change Gate", () => {
  const uniqueId = () => Math.random().toString(36).substring(2, 9);

  it("sets mustChangePassword to true by default or via admin creation, and clears on update", async () => {
    const testUserId = crypto.randomUUID();
    const testEmail = `staff-${uniqueId()}@safihub.cd`;

    // Insert user with mustChangePassword = true
    await db.insert(schema.user).values({
      id: testUserId,
      name: "Staff Test",
      email: testEmail,
      role: "house",
      mustChangePassword: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const [created] = await db
      .select({ mustChangePassword: schema.user.mustChangePassword })
      .from(schema.user)
      .where(eq(schema.user.id, testUserId));

    expect(created?.mustChangePassword).toBe(true);

    // Clear flag
    await clearUserMustChangePassword(testUserId);

    const [cleared] = await db
      .select({ mustChangePassword: schema.user.mustChangePassword })
      .from(schema.user)
      .where(eq(schema.user.id, testUserId));

    expect(cleared?.mustChangePassword).toBe(false);
  });

  it("validates password length and rejects weak passwords via schema", () => {
    const res = changePasswordSchema.safeParse({
      currentPassword: "tempPassword123",
      newPassword: "short",
      confirmPassword: "short",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("au moins 8 caractères");
    }
  });

  it("rejects mismatched confirm password", () => {
    const res = changePasswordSchema.safeParse({
      currentPassword: "tempPassword123",
      newPassword: "ValidPassword123!",
      confirmPassword: "DifferentPassword123!",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("ne correspondent pas");
    }
  });

  it("rejects new password that is identical to current password", () => {
    const res = changePasswordSchema.safeParse({
      currentPassword: "SamePassword123!",
      newPassword: "SamePassword123!",
      confirmPassword: "SamePassword123!",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("différent du mot de passe temporaire");
    }
  });
});
