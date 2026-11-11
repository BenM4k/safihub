## 2024-05-24 - [Insecure RNG for IDs]
**Vulnerability:** Weak PRNG (`Math.random()`) was being used for sensitive values like `deliveryConfirmationCode` and order identifiers.
**Learning:** Common frontend pattern (`Math.random().toString(36)`) was mistakenly ported to backend DAL and Services, exposing codes to predictability.
**Prevention:** Strictly enforce the use of `node:crypto` (`crypto.randomInt` / `crypto.randomBytes` / `crypto.randomUUID`) across all server-side identifier/code generation logic. Ensure client-side fallback logic safely degrades if crypto is unavailable.
