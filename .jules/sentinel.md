## 2025-02-14 - Replace Math.random with crypto.randomInt for sensitive codes
**Vulnerability:** Weak random number generation (`Math.random()`) used for generating delivery confirmation codes and order tracking IDs.
**Learning:** `Math.random()` is not cryptographically secure and makes guessing codes trivial, which is risky when used for offline/online synchronization codes or tracking tokens.
**Prevention:** Standardize on `node:crypto` (`randomInt`, `randomUUID`) on server-side logic for any security-related identifier.
