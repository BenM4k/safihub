## 2025-02-27 - [Predictable Delivery Confirmation Code Generation]
**Vulnerability:** The `deliveryConfirmationCode` was generated using `Math.random()`, which is a weak pseudo-random number generator and not cryptographically secure.
**Learning:** Math.random() usage for security-sensitive tokens can lead to predictability, allowing potential attackers to guess codes.
**Prevention:** Always use Node's built-in `crypto` module (e.g., `crypto.randomInt()`) for generating secure tokens, PINs, or codes on the server.
