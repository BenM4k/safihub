import { describe, expect, it, beforeEach } from "vitest";
import {
  adminCreateGuestUser,
  adminMergeGuestUser,
  adminResetUserPassword,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  requestPasswordReset,
  resetPasswordWithToken,
} from "../auth.service";
import { getUserById, getUserConsents } from "@/dal";
import { clearSentEmails, getSentEmails } from "@/services/email";
import { db, schema } from "@/dal/db";
import { eq } from "drizzle-orm";

describe("Better Auth & Customer Authentication", () => {
  beforeEach(() => {
    clearSentEmails();
  });

  const uniqueId = () => Math.random().toString(36).substring(2, 9);

  describe("Registration Flow", () => {
    it("requires explicit user consent to Terms and Privacy Policy", async () => {
      const email = `test-noconsent-${uniqueId()}@safihub.cd`;
      const result = await registerCustomer({
        name: "Test User",
        email,
        password: "Password123!",
        phone: "+243999111222",
        consent: false,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("Consent");
      }
    });

    it("registers a customer, sets contactPhone, and logs consents in the audit table", async () => {
      const idStr = uniqueId();
      const email = `customer-${idStr}@safihub.cd`;
      const phone = `+24399000${idStr.substring(0, 4)}`;

      const result = await registerCustomer({
        name: "Amani Mulemangabo",
        email,
        password: "SecurePassword123!",
        phone,
        consent: true,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.user.email).toBe(email);
        expect(result.value.user.name).toBe("Amani Mulemangabo");
        expect(result.value.user.contactPhone).toBe(phone);

        const userId = result.value.user.id as string;

        // Verify user in DAL
        const dbUser = await getUserById(userId);
        expect(dbUser).toBeDefined();
        expect(dbUser?.contactPhone).toBe(phone);
        expect(dbUser?.isGuest).toBe(false);

        // Verify consent audit entries in DB
        const consents = await getUserConsents(userId);
        expect(consents.length).toBeGreaterThanOrEqual(2);
        const documents = consents.map((c) => c.document);
        expect(documents).toContain("terms");
        expect(documents).toContain("privacy");
      }
    });

    it("rejects duplicate registration for an already registered email", async () => {
      const email = `dup-${uniqueId()}@safihub.cd`;

      const first = await registerCustomer({
        name: "First Customer",
        email,
        password: "SecurePassword123!",
        phone: "+243991234567",
        consent: true,
      });
      expect(first.ok).toBe(true);

      const second = await registerCustomer({
        name: "Second Customer",
        email,
        password: "AnotherPassword123!",
        phone: "+243997654321",
        consent: true,
      });

      expect(second.ok).toBe(false);
      if (!second.ok) {
        expect(second.error).toContain("already exists");
      }
    });
  });

  describe("Login and Sign Out Flow", () => {
    it("authenticates a registered user with correct credentials and rejects invalid passwords", async () => {
      const email = `login-${uniqueId()}@safihub.cd`;
      const password = "ValidPassword123!";

      await registerCustomer({
        name: "Login User",
        email,
        password,
        phone: "+243993334444",
        consent: true,
      });

      // Attempt login with wrong password
      const badLogin = await loginCustomer({
        email,
        password: "WrongPassword!",
      });
      expect(badLogin.ok).toBe(false);

      // Attempt login with valid password
      const goodLogin = await loginCustomer({
        email,
        password,
      });
      expect(goodLogin.ok).toBe(true);
      if (goodLogin.ok) {
        expect(goodLogin.value.user.email).toBe(email);
      }
    });

    it("signs out successfully", async () => {
      const res = await logoutCustomer();
      expect(res.ok).toBe(true);
    });
  });

  describe("Password Reset Flow (Email Link & Admin Fallback)", () => {
    it("sends a password reset email link containing a valid token", async () => {
      const email = `reset-${uniqueId()}@safihub.cd`;
      const password = "InitialPassword123!";

      await registerCustomer({
        name: "Reset User",
        email,
        password,
        phone: "+243994445555",
        consent: true,
      });

      const requestRes = await requestPasswordReset({
        email,
        redirectTo: "http://localhost:3000/reset-password",
      });

      expect(requestRes.ok).toBe(true);

      const emails = getSentEmails();
      expect(emails.length).toBeGreaterThanOrEqual(1);
      const resetEmail = emails.find((e) => e.to === email);
      expect(resetEmail).toBeDefined();
      expect(resetEmail?.subject).toContain("Réinitialisation");
      expect(resetEmail?.text).toContain("token=");

      // Extract token from reset URL
      const match = resetEmail?.text.match(/token=([a-zA-Z0-9_-]+)/);
      expect(match).not.toBeNull();
      const token = match ? match[1] : "";
      expect(token.length).toBeGreaterThan(0);

      // Reset password using the token
      const newPassword = "BrandNewPassword123!";
      const resetRes = await resetPasswordWithToken({
        token,
        newPassword,
      });
      expect(resetRes.ok).toBe(true);

      // Verify sign in with new password
      const newLogin = await loginCustomer({
        email,
        password: newPassword,
      });
      expect(newLogin.ok).toBe(true);
    });

    it("allows an admin to reset a user password as a fallback", async () => {
      const email = `admin-fallback-${uniqueId()}@safihub.cd`;
      const initialPassword = "OldPassword123!";

      const reg = await registerCustomer({
        name: "Fallback User",
        email,
        password: initialPassword,
        phone: "+243995556666",
        consent: true,
      });
      expect(reg.ok).toBe(true);
      if (!reg.ok) return;

      const targetUserId = reg.value.user.id as string;
      const adminUserId = "usr_admin_001"; // seeded admin user

      const adminResetRes = await adminResetUserPassword({
        adminUserId,
        targetUserId,
        newPassword: "AdminAssignedPass123!",
      });

      expect(adminResetRes.ok).toBe(true);

      // Verify sign in with admin-assigned password
      const loginRes = await loginCustomer({
        email,
        password: "AdminAssignedPass123!",
      });
      expect(loginRes.ok).toBe(true);
    });

    it("rejects non-admin users from performing admin password resets", async () => {
      const email = `nonadmin-${uniqueId()}@safihub.cd`;
      const reg = await registerCustomer({
        name: "Normal Customer",
        email,
        password: "SomePassword123!",
        phone: "+243996667777",
        consent: true,
      });
      expect(reg.ok).toBe(true);
      if (!reg.ok) return;

      const nonAdminId = reg.value.user.id as string;

      const fakeAttempt = await adminResetUserPassword({
        adminUserId: nonAdminId,
        targetUserId: nonAdminId,
        newPassword: "HackedPassword123!",
      });

      expect(fakeAttempt.ok).toBe(false);
      if (!fakeAttempt.ok) {
        expect(fakeAttempt.error).toContain("Only administrators");
      }
    });
  });

  describe("Guest User Handling & Account Merging", () => {
    it("creates a guest user with placeholder email, isGuest=true, and no login ability", async () => {
      const adminUserId = "usr_admin_001";
      const guestPhone = "+243998889999";

      const guestRes = await adminCreateGuestUser({
        adminUserId,
        name: "Mama Zawadi (WhatsApp)",
        phone: guestPhone,
      });

      expect(guestRes.ok).toBe(true);
      if (!guestRes.ok) return;

      expect(guestRes.value.email).toMatch(/^guest-usr_[a-zA-Z0-9-]+\@guest\.invalid$/);
      expect(guestRes.value.contactPhone).toBe(guestPhone);

      // Verify in DB that isGuest is true and no account credentials exist
      const dbGuest = await getUserById(guestRes.value.id);
      expect(dbGuest?.isGuest).toBe(true);
      expect(dbGuest?.role).toBe("customer");

      // Verify direct login fails for guest user
      const loginAttempt = await loginCustomer({
        email: guestRes.value.email,
        password: "AnyPassword123!",
      });
      expect(loginAttempt.ok).toBe(false);
    });

    it("allows the admin to merge a guest user into a registered account", async () => {
      const adminUserId = "usr_admin_001";
      const sharedPhone = "+243991112233";

      // 1. Admin creates guest user from a phone call
      const guestRes = await adminCreateGuestUser({
        adminUserId,
        name: "Guest Phone Customer",
        phone: sharedPhone,
      });
      expect(guestRes.ok).toBe(true);
      if (!guestRes.ok) return;
      const guestUserId = guestRes.value.id;

      // 2. Simulate orders created under this guest customer
      const testOrderId = crypto.randomUUID();
      const dummyHouse = await db.select({ id: schema.houses.id }).from(schema.houses).limit(1);
      const dummyNeighborhood = await db.select({ id: schema.neighborhoods.id }).from(schema.neighborhoods).limit(1);

      if (dummyHouse[0] && dummyNeighborhood[0]) {
        await db.insert(schema.orders).values({
          id: testOrderId,
          code: `ORD-${uniqueId()}`,
          trackingToken: crypto.randomUUID(),
          idempotencyKey: crypto.randomUUID(),
          customerId: guestUserId,
          houseId: dummyHouse[0].id,
          neighborhoodId: dummyNeighborhood[0].id,
          landmark: "Rond-point ISP",
          contactPhone: sharedPhone,
          pickupSlotStart: new Date(),
          pickupSlotEnd: new Date(Date.now() + 3600000),
          itemsTotal: 15000,
          deliveryFee: 3000,
          commissionBps: 2000,
          commissionAmount: 3000,
          totalDue: 18000,
        });
      }

      // 3. Customer later registers with an email
      const regRes = await registerCustomer({
        name: "Registered Customer",
        email: `registered-${uniqueId()}@safihub.cd`,
        password: "Password123!",
        phone: sharedPhone,
        consent: true,
      });
      expect(regRes.ok).toBe(true);
      if (!regRes.ok) return;
      const registeredUserId = regRes.value.user.id as string;

      // 4. Admin merges the guest customer into the registered account
      const mergeRes = await adminMergeGuestUser({
        adminUserId,
        guestUserId,
        targetUserId: registeredUserId,
      });

      expect(mergeRes.ok).toBe(true);
      if (!mergeRes.ok) return;

      expect(mergeRes.value.guestUserId).toBe(guestUserId);
      expect(mergeRes.value.targetUserId).toBe(registeredUserId);

      // Verify that the orders are now owned by the registered customer
      if (dummyHouse[0] && dummyNeighborhood[0]) {
        const order = await db
          .select()
          .from(schema.orders)
          .where(eq(schema.orders.id, testOrderId));
        expect(order[0]?.customerId).toBe(registeredUserId);
      }

      // Verify guest user status in DB
      const updatedGuest = await getUserById(guestUserId);
      expect(updatedGuest?.status).toBe("merged");
      expect(updatedGuest?.banned).toBe(true);
      expect(updatedGuest?.banReason).toContain(registeredUserId);
    });
  });
});
