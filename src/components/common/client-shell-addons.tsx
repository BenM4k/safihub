"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const CustomerBottomNav = dynamic(
  () =>
    import("@/components/customer/customer-bottom-nav").then(
      (mod) => mod.CustomerBottomNav
    ),
  { ssr: false }
);

const LanguageSwitcher = dynamic(
  () =>
    import("@/components/common/language-switcher").then(
      (mod) => mod.LanguageSwitcher
    ),
  { ssr: false }
);

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false }
);

export function ClientShellAddons() {
  return (
    <>
      <Suspense fallback={null}>
        <CustomerBottomNav />
      </Suspense>
      <LanguageSwitcher />
      <Toaster position="bottom-center" />
    </>
  );
}

