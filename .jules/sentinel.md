## 2025-02-12 - [Weak PRNG (Math.random) Used for Identifiers & Codes]
**Vulnerability:** Weak PRNG (`Math.random()`) was found being used to generate unique identifiers and confirmation codes across multiple services (e.g. `src/services/order/customer-order.service.ts`, `src/services/admin/order.service.ts`, `src/services/house/house.service.ts`).
**Learning:** `Math.random()` does not provide cryptographically secure values, which could result in predictable tokens leading to enumeration, spoofing, or unauthorized access.
**Prevention:** Always use `node:crypto` (`crypto.randomInt`, `crypto.randomUUID`, `crypto.randomBytes`) for server-side generation of unpredictable values, and the `crypto` global (`crypto.randomUUID()`) for client-side generation.
