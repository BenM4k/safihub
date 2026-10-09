import { describe, expect, it } from "vitest";
import {
  adminBlockUser,
  adminUnblockUser,
  adminSetUserRole,
  loginCustomer,
  registerCustomer,
} from "../auth.service";
import {
  requireRole,
  requireHouseAccess,
  getCurrentUser,
  redirectIfAuthenticated,
} from "../guards";
import { getRoleCta } from "@/lib/role-cta";
import { auth } from "../auth";
import { addHouseMember, db, schema } from "@/dal";

describe("Roles, Permissions & Area Guards", () => {
  const uniqueId = () => Math.random().toString(36).substring(2, 9);

  // Helper to log in and extract authentic Better Auth signed session headers
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

  describe("Role Area Boundaries (Customer, Courier, House, Admin)", () => {
    it("customer can only reach customer area and is rejected from courier, house, and admin areas", async () => {
      const email = `customer-guard-${uniqueId()}@safihub.cd`;
      const password = "Password123!";
      const reg = await registerCustomer({
        name: "Customer John",
        email,
        password,
        phone: `+24399${Math.floor(1000000 + Math.random() * 9000000)}`,
        consent: true,
      });
      expect(reg.ok).toBe(true);
      if (!reg.ok) return;

      const headers = await loginAndGetHeaders(email, password);

      // 1. Customer reaches customer role
      const customerCheck = await requireRole(["customer"], { headers });
      expect(customerCheck.ok).toBe(true);

      // 2. Customer is rejected from courier area
      const courierCheck = await requireRole(["courier"], { headers });
      expect(courierCheck.ok).toBe(false);
      if (!courierCheck.ok) {
        expect(courierCheck.error).toContain("Forbidden");
      }

      // 3. Customer is rejected from admin area
      const adminCheck = await requireRole(["admin"], { headers });
      expect(adminCheck.ok).toBe(false);
      if (!adminCheck.ok) {
        expect(adminCheck.error).toContain("Forbidden");
      }

      // 4. Customer is rejected from house area
      const houseCheck = await requireHouseAccess({ headers });
      expect(houseCheck.ok).toBe(false);
      if (!houseCheck.ok) {
        expect(houseCheck.error).toContain("Forbidden");
      }
    });

    it("courier can reach courier area but is rejected from house and admin areas", async () => {
      const email = `courier-guard-${uniqueId()}@safihub.cd`;
      const password = "Password123!";
      const reg = await registerCustomer({
        name: "Courier Moise",
        email,
        password,
        phone: "+243992223344",
        consent: true,
      });
      expect(reg.ok).toBe(true);
      if (!reg.ok) return;

      const userId = reg.value.user.id as string;
      // Set role to courier
      await adminSetUserRole({
        adminUserId: "usr_admin_001",
        targetUserId: userId,
        role: "courier",
      });

      const headers = await loginAndGetHeaders(email, password);

      // 1. Reaches courier area
      const courierCheck = await requireRole(["courier"], { headers });
      expect(courierCheck.ok).toBe(true);
      if (courierCheck.ok) {
        expect(courierCheck.value.user.role).toBe("courier");
      }

      // 2. Rejected from admin area
      const adminCheck = await requireRole(["admin"], { headers });
      expect(adminCheck.ok).toBe(false);

      // 3. Rejected from house area
      const houseCheck = await requireHouseAccess({ headers });
      expect(houseCheck.ok).toBe(false);
    });

    it("house staff can reach only their assigned house and is rejected from admin and courier areas", async () => {
      const email = `house-guard-${uniqueId()}@safihub.cd`;
      const password = "Password123!";
      const reg = await registerCustomer({
        name: "House Staff Zawadi",
        email,
        password,
        phone: "+243993334455",
        consent: true,
      });
      expect(reg.ok).toBe(true);
      if (!reg.ok) return;

      const userId = reg.value.user.id as string;
      await adminSetUserRole({
        adminUserId: "usr_admin_001",
        targetUserId: userId,
        role: "house",
      });

      // Fetch or verify a house exists
      const [existingHouse] = await db.select({ id: schema.houses.id }).from(schema.houses).limit(1);
      const houseId = existingHouse?.id || "house-dummy-1";

      // Assign user as member of this house
      await addHouseMember({ houseId, userId });

      const headers = await loginAndGetHeaders(email, password);

      // 1. Reaches general house area
      const generalHouseCheck = await requireHouseAccess({ headers });
      expect(generalHouseCheck.ok).toBe(true);
      if (generalHouseCheck.ok) {
        expect(generalHouseCheck.value.primaryHouseId).toBe(houseId);
        expect(generalHouseCheck.value.isAdminOverride).toBe(false);
      }

      // 2. Reaches assigned specific house
      const assignedHouseCheck = await requireHouseAccess({ houseId, headers });
      expect(assignedHouseCheck.ok).toBe(true);

      // 3. Rejected from an unassigned house
      const fakeHouseId = crypto.randomUUID();
      const unassignedHouseCheck = await requireHouseAccess({ houseId: fakeHouseId, headers });
      expect(unassignedHouseCheck.ok).toBe(false);

      // 4. Rejected from admin area
      const adminCheck = await requireRole(["admin"], { headers });
      expect(adminCheck.ok).toBe(false);

      // 5. Rejected from courier area
      const courierCheck = await requireRole(["courier"], { headers });
      expect(courierCheck.ok).toBe(false);
    });

    it("admin reaches admin area, courier area, and has global override for any house", async () => {
      const adminEmail = `admin-super-${uniqueId()}@safihub.cd`;
      const password = "Password123!";
      const reg = await registerCustomer({
        name: "Admin Boss",
        email: adminEmail,
        password,
        phone: "+243994445566",
        consent: true,
      });
      expect(reg.ok).toBe(true);
      if (!reg.ok) return;

      const userId = reg.value.user.id as string;
      await adminSetUserRole({
        adminUserId: "usr_admin_001",
        targetUserId: userId,
        role: "admin",
      });

      const headers = await loginAndGetHeaders(adminEmail, password);

      // 1. Reaches admin area
      const adminCheck = await requireRole(["admin"], { headers });
      expect(adminCheck.ok).toBe(true);

      // 2. Reaches courier area
      const courierCheck = await requireRole(["courier", "admin"], { headers });
      expect(courierCheck.ok).toBe(true);

      // 3. Reaches any house via admin override
      const randomHouseId = crypto.randomUUID();
      const houseCheck = await requireHouseAccess({ houseId: randomHouseId, headers });
      expect(houseCheck.ok).toBe(true);
      if (houseCheck.ok) {
        expect(houseCheck.value.isAdminOverride).toBe(true);
      }
    });
  });

  describe("Account Blocking & Sign In Rejection", () => {
    it("prevents a blocked user from signing in and accessing protected areas", async () => {
      const email = `blocked-test-${uniqueId()}@safihub.cd`;
      const password = "ValidPassword123!";

      // 1. Register customer
      const reg = await registerCustomer({
        name: "Blocked Customer",
        email,
        password,
        phone: `+24399${Math.floor(1000000 + Math.random() * 9000000)}`,
        consent: true,
      });
      expect(reg.ok).toBe(true);
      if (!reg.ok) return;
      const targetUserId = reg.value.user.id as string;

      // 2. Can sign in while active
      const firstLogin = await loginCustomer({ email, password });
      expect(firstLogin.ok).toBe(true);

      const activeHeaders = await loginAndGetHeaders(email, password);
      const activeCheck = await requireRole(["customer"], { headers: activeHeaders });
      expect(activeCheck.ok).toBe(true);

      // 3. Admin blocks user
      const blockRes = await adminBlockUser({
        adminUserId: "usr_admin_001",
        targetUserId,
        reason: "Suspected abusive orders",
      });
      expect(blockRes.ok).toBe(true);

      // 4. Blocked user cannot sign in
      const blockedLogin = await loginCustomer({ email, password });
      expect(blockedLogin.ok).toBe(false);
      if (!blockedLogin.ok) {
        expect(blockedLogin.error).toContain("Account is blocked");
      }

      // 5. Previously active session is revoked and cannot access area
      const areaCheck = await requireRole(["customer"], { headers: activeHeaders });
      expect(areaCheck.ok).toBe(false);

      // 6. Admin unblocks user
      const unblockRes = await adminUnblockUser({
        adminUserId: "usr_admin_001",
        targetUserId,
      });
      expect(unblockRes.ok).toBe(true);

      // 7. Unblocked user can sign in again
      const restoredLogin = await loginCustomer({ email, password });
      expect(restoredLogin.ok).toBe(true);
    });
  });

  describe("Session Guards & Role CTA Resolution", () => {
    it("getCurrentUser returns null when unauthenticated and user details when authenticated", async () => {
      // 1. Unauthenticated with empty headers returns null
      const unauth = await getCurrentUser({ headers: new Headers() });
      expect(unauth).toBeNull();

      // 2. Authenticated user returns user info
      const email = `session-check-${uniqueId()}@safihub.cd`;
      const password = "Password123!";
      await registerCustomer({
        name: "Session User",
        email,
        password,
        phone: "+243991234567",
        consent: true,
      });

      const headers = await loginAndGetHeaders(email, password);
      const user = await getCurrentUser({ headers });
      expect(user).not.toBeNull();
      expect(user?.email).toBe(email);
      expect(user?.role).toBe("customer");
    });

    it("getRoleCta resolves correct URLs and roles for guest, customer, admin, courier, and house", () => {
      expect(getRoleCta(null)).toEqual({
        href: "#catalogue",
        isExternalOrAnchor: true,
        roleKey: "guest",
      });

      expect(
        getRoleCta({
          id: "1",
          email: "a@a.com",
          name: "Guest",
          role: "customer",
          status: "active",
          isGuest: true,
        })
      ).toEqual({
        href: "#catalogue",
        isExternalOrAnchor: true,
        roleKey: "guest",
      });

      expect(
        getRoleCta({
          id: "1",
          email: "c@c.com",
          name: "Customer",
          role: "customer",
          status: "active",
          isGuest: false,
        })
      ).toEqual({
        href: "#catalogue",
        isExternalOrAnchor: true,
        roleKey: "customer",
      });

      expect(
        getRoleCta({
          id: "2",
          email: "adm@adm.com",
          name: "Admin",
          role: "admin",
          status: "active",
          isGuest: false,
        })
      ).toEqual({
        href: "/admin",
        isExternalOrAnchor: false,
        roleKey: "admin",
      });

      expect(
        getRoleCta({
          id: "3",
          email: "cou@cou.com",
          name: "Courier",
          role: "courier",
          status: "active",
          isGuest: false,
        })
      ).toEqual({
        href: "/courier",
        isExternalOrAnchor: false,
        roleKey: "courier",
      });

      expect(
        getRoleCta({
          id: "4",
          email: "hse@hse.com",
          name: "House",
          role: "house",
          status: "active",
          isGuest: false,
        })
      ).toEqual({
        href: "/house",
        isExternalOrAnchor: false,
        roleKey: "house",
      });
    });

    it("redirectIfAuthenticated does nothing for guest/unauthenticated and redirects authenticated users", async () => {
      // 1. Unauthenticated -> does not throw redirect
      await expect(
        redirectIfAuthenticated({ headers: new Headers() })
      ).resolves.toBeUndefined();

      // 2. Authenticated customer -> triggers redirect
      const email = `redirect-check-${uniqueId()}@safihub.cd`;
      const password = "Password123!";
      await registerCustomer({
        name: "Redirect User",
        email,
        password,
        phone: "+243997654321",
        consent: true,
      });

      const headers = await loginAndGetHeaders(email, password);
      await expect(redirectIfAuthenticated({ headers })).rejects.toThrow();
    });
  });
});

