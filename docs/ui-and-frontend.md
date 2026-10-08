# UI & Frontend Architecture Guide

This document describes SafiHub's frontend engineering standards, component boundaries, mobile-first design system, PWA and offline architectures, and localization in French and Swahili.

---

## 1. Component Standards & shadcn/ui Mandate

SafiHub enforces strict design consistency using Tailwind CSS v4 and shadcn/ui.

### 1. Component Size & Decomposition (Primary Constraint)

- **Line Limit:** No single component file should exceed **~150–200 lines**. If a component grows past this, decompose it immediately into co-located subcomponents, parts, or custom hooks.
- **Single Responsibility:** Separate layout/data assembly from interactive controls.
- **Composition over Configuration:** Prefer small composed components passed as children/props over massive components with dozens of conditional props.

### 2. Mandatory shadcn/ui Primitives

- Always compose official shadcn components in `src/components/ui/` (`DropdownMenu`, `Dialog`, `Sheet`, `Button`, `Badge`, `Input`, `Select`, `Card`, `Tabs`).
- **No Handwritten Overlays:** Building ad-hoc custom modal sheets, dropdowns, or tooltips using raw `useState` and manual floating coordinate math is **strictly forbidden**.

---

## 2. Design System (Tailwind v4, CSS-first)

No `tailwind.config` — everything lives in CSS. `src/app/globals.css` imports, in order:

| File | Contents |
| :--- | :------- |
| `src/styles/tokens.css` | Raw palettes (`lagoon` primary, `mint`, `citrus`, `coral`, `ink` neutrals), semantic roles in `:root`/`.dark` (shadcn names + `heading`, `surface`, `primary-soft`, `highlight`, `success/warning/destructive(-soft)`), fluid type scale (`text-display`, `text-h1…h4`, `text-lead`), spacing (`gutter`, `section`, `section-sm`, `touch`), containers (`max-w-page/narrow/prose-tight`), radii (`rounded-control/card/panel`), shadows (`soft/card/lift/nav/glow`), `ease-soft`, `animate-fade-up/in`, `xs` (360px) breakpoint, class-based `dark:` variant. |
| `src/styles/base.css` | Element defaults: Plus Jakarta Sans, heading sizes/weights/balance, focus ring, selection, tabular numerals for `data`/`time`/`.tabular`, reduced-motion. |
| `src/styles/layout.css` | `container-page/narrow/prose`, `section(-sm)`, `stack(-n)`, `cluster(-n)`, `grid-auto-{container}` / `grid-auto-[14rem]`, `split`, `touch`. |
| `src/styles/controls.css` | `btn` + variant (`btn-primary/secondary/contrast/outline/ghost/warm/destructive`) + size (`btn-sm/lg/icon/block`); `link`, `link-quiet`, `link-arrow`. |
| `src/styles/surfaces.css` | `card`, `card-interactive`, `panel`, `surface-float`, `glass`, `bg-brand`, `bg-wash(-warm)`, `text-gradient`, `orb`, `eyebrow`, `icon-tile(-soft)`. |

**Rules**

- Components use **semantic** tokens (`bg-primary`, `text-heading`, `text-muted-foreground`, `border-border`); raw palettes only for illustrations/charts.
- Buttons compose `btn btn-<variant> btn-<size>`. Variants only set `--btn-*` custom properties, so class order never matters. Mark trailing arrows with `data-icon="trailing"` for the hover nudge. shadcn `Button` cva variants should map onto these classes.
- All buttons are ≥ 44px tall; hover effects are wrapped in `@media (hover: hover)` so touch devices never get sticky hover.
- Headings are heavy (700–800) with tight negative tracking; body is 16px / 1.6; lead copy 17–20px / 1.65.
- Decorative glows (`orb`) use radial gradients, **not** `filter: blur()`, to stay cheap on low-end Android GPUs.
- Elevation is soft and large (`shadow-card`, `shadow-lift`); borders are 1px `border-border`; cards 24px radius, panels 32px (≥ md), controls 12px.

---

## 3. Server vs. Client Component Boundaries

SafiHub follows modern Next.js 16.4 and React 19 architecture:

- **Server Components by Default:** All layouts and route `page.tsx` files are Server Components.
- **Push `"use client"` to Leaves:** Wrap only the interactive leaf elements (e.g. cart quantity stepper, offline mission sync toggle, camera capture modal) with `"use client"`. Never convert an entire page into a Client Component.
- **Server Data Fetching:** Never fetch data in a Client Component if it can be fetched on the server and passed down as props.
- **Async Route Params:** In Next.js 16, route parameters and query strings are promises. Always `await params` and `await searchParams` before accessing properties.
- **Form Architecture & Validation (`react-hook-form` + `Zod`):** Interactive forms use `react-hook-form` with `@hookform/resolvers/zod` and centralized Zod schemas (`src/lib/validations/`) for instant client-side validation. Empty or invalid submissions are blocked before dispatching network requests, displaying localized inline errors (`next-intl`). Valid data dispatches to Server Actions wrapped in React 19 transitions (`useTransition`).
- **Suspense Boundaries:** Wrap dynamic request-time reads tightly in `<Suspense>` so the surrounding page shell prerenders as a static shell.

---

## 4. Mobile-First Engineering for Bukavu Context

- **Screen Dimensions:** Optimized for small viewports starting at **360px width** (typical low-end Android smartphones running Chrome or Samsung Internet).
- **Touch Targets:** All interactive controls (buttons, quantity toggles, slot selectors) must maintain a minimum touch target size of **44px $\times$ 44px**.
- **Input Typography (16px Mobile Minimum):** All text inputs, email, password, phone, number, and textarea fields must maintain a minimum font size of **16px (`1rem` / `text-base`)** on mobile viewports (< 640px) to prevent iOS Safari and mobile browsers from triggering unwanted automatic viewport zooming on focus.
- **Performance Budget:** Customer ordering pages (neighborhood selection, house listing, cart, checkout) must transfer **under 200 KB** total payload and render interactively in under 5 seconds over a throttled 3G profile.
- **Pull-to-Refresh over Polling:** To conserve expensive mobile data for users, inboxes and order lists use pull-to-refresh or explicit refresh buttons rather than aggressive background polling intervals.

---

## 5. PWA Progressive Enhancement & Courier Offline Architecture

SafiHub adopts a role-specific progressive enhancement strategy:

### 1. Web App First

- All roles access SafiHub as a standard responsive web application.
- Web app manifest and icons are configured from day one to support "Add to Home Screen".

### 2. Courier Offline Mode (Service Worker + IndexedDB)

- **Local State Store:** Built with **Zustand** using an **IndexedDB** persistence adapter (`idb-keyval`).
- **Cached Shell:** The courier service worker pre-caches the courier app shell and active mission list.
- **Action Queue:** While disconnected:
  - Item count changes, condition notes, and cash collections are appended to a local offline action queue with UUID mutation IDs.
  - Photos are saved as compressed `Blob`s in IndexedDB.
- **Background Synchronization:** When network connectivity is restored, the queue replays operations in chronological order against Server Actions, updating the UI in real time.

### 3. House Web Push Notifications

- Partner laundry facilities receive push notifications (`web-push`) when new orders arrive, ensuring the 45-minute acceptance deadline is not missed.

---

## 6. Localization & Internationalization (`next-intl`)

SafiHub serves a multilingual user base in Bukavu and internationally, supporting **French (`fr`)**, **English (`en`)**, and **Swahili (`sw`)**:

- **Mandatory Invariant:** Every new page, feature, dialog, modal, form validation, and error message MUST handle translations across all 3 languages. Never hardcode raw user-facing copy or error strings in code.
- **Cookie-Based Language Switching:** The active locale is stored in a cookie (`NEXT_LOCALE`), keeping route URLs clean (e.g. `/houses` instead of `/fr/houses`). The switcher is rendered as a floating circular widget at the bottom-right of the screen.
- **Catalogue Multilingual Storage:** The master catalogue stores names in French and Swahili (`items.nameFr`, `items.nameSw`, `fabrics.nameFr`, `fabrics.nameSw`).
- **Message Catalogues:** Application copy and error messages are synchronized across `messages/fr.json`, `messages/en.json`, and `messages/sw.json` with strict key parity.
- **Compile-Time Type Safety:** Augmentation via `src/types/global.d.ts` (`IntlMessages`) ensures typed keys and catches missing translation keys at build time.
- **Usage:**
  - Client Components: `useTranslations("namespace")`
  - Server Components / Actions: `const t = await getTranslations("namespace")`
  - Error Boundaries & Error Messages: Dedicated `errors` namespace for technical disruptions, input validations, network errors, and auth failures.


---

## 7. Cache Components & Revalidation

- **Data-Level Caching (`"use cache"`):** Reusable DAL fetchers in `src/lib/cached-data.ts` are declared with `"use cache"` and register semantic cache tags via `cacheTag(tag)`.
- **Canonical Tags (`src/lib/cache-tags.ts`):** `catalog:items`, `coverage:zones`, `house:<houseId>`, `order:<orderId>`, `admin:dispatch`.
- **Targeted Invalidation:** Server actions call `revalidateTag(tag, "max")` after mutations, avoiding broad `revalidatePath` calls.
