## 2025-03-05 - Fix XSS in JSON-LD serialization
**Vulnerability:** A Cross-Site Scripting (XSS) vulnerability was found in `src/components/houses/detail/pressing-json-ld.tsx` where user-controlled content (`house.name`) was being injected into a `<script type="application/ld+json">` tag using `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}`. An attacker could provide a value like `</script><script>alert(1)</script>` to break out of the script tag and execute arbitrary JS.
**Learning:** `JSON.stringify` does not escape HTML characters like `<` by default, making it unsafe to inject directly into script tags without sanitization.
**Prevention:** Always escape `<` characters when injecting serialized JSON into HTML using `.replace(/</g, '\\u003c')`.
