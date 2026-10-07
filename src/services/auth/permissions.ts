import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export type UserRole = "customer" | "courier" | "house" | "admin";
export type AccountStatus = "active" | "blocked" | "merged";

/**
 * Access control statements extending better-auth defaults
 * with SafiHub domain resource permissions.
 */
export const statement = {
  ...defaultStatements,
  order: ["create", "read", "update", "cancel"],
  mission: ["read", "update"],
  house: ["read", "update"],
} as const;

export const ac = createAccessControl(statement);

export const adminRole = ac.newRole({
  ...adminAc.statements,
  order: ["create", "read", "update", "cancel"],
  mission: ["read", "update"],
  house: ["read", "update"],
});

export const customerRole = ac.newRole({
  order: ["create", "read", "cancel"],
});

export const courierRole = ac.newRole({
  mission: ["read", "update"],
});

export const houseRole = ac.newRole({
  order: ["read", "update"],
  house: ["read", "update"],
});

export const roles = {
  admin: adminRole,
  customer: customerRole,
  courier: courierRole,
  house: houseRole,
};
