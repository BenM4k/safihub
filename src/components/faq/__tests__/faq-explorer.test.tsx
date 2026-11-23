// @vitest-environment jsdom

import "@/test/ui-sdk-setup";
import { NextIntlClientProvider } from "next-intl";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import frMessages from "../../../../messages/fr.json";
import enMessages from "../../../../messages/en.json";
import swMessages from "../../../../messages/sw.json";
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS_META,
  filterFaqItems,
  type LocalizedFaqItem,
} from "@/lib/faq-data";
import { FaqExplorer, type FaqCategoryOption } from "../faq-explorer";

function buildFrFaqFixtures(): {
  items: LocalizedFaqItem[];
  categories: FaqCategoryOption[];
} {
  const faq = frMessages.faq;
  const items: LocalizedFaqItem[] = FAQ_ITEMS_META.map((meta) => ({
    id: meta.id,
    category: meta.category,
    categoryLabel: faq.categories[meta.category],
    question: faq.items[meta.id].question,
    answer: faq.items[meta.id].answer,
    links: meta.links?.map((link) => ({
      label: faq.links[link.key],
      href: link.href,
    })),
  }));

  const categories: FaqCategoryOption[] = FAQ_CATEGORIES.map((id) => ({
    id,
    label: faq.categories[id],
    count:
      id === "all"
        ? items.length
        : items.filter((item) => item.category === id).length,
  }));

  return { items, categories };
}

function renderFaqExplorer() {
  const { items, categories } = buildFrFaqFixtures();
  return render(
    <NextIntlClientProvider locale="fr" messages={frMessages}>
      <FaqExplorer items={items} categories={categories} />
    </NextIntlClientProvider>
  );
}

describe("FAQ Data, Localization Parity & FaqExplorer", () => {
  it("maintains strict fr/en/sw key parity, non-empty copy, and valid inline links across all 15 FAQ items", () => {
    const locales = [
      { code: "fr", faq: frMessages.faq },
      { code: "en", faq: enMessages.faq },
      { code: "sw", faq: swMessages.faq },
    ] as const;

    const frPageKeys = Object.keys(frMessages.faq.page).sort();
    const frCategoryKeys = Object.keys(frMessages.faq.categories).sort();
    const frLinkKeys = Object.keys(frMessages.faq.links).sort();
    const frItemKeys = Object.keys(frMessages.faq.items).sort();

    for (const loc of locales) {
      expect(Object.keys(loc.faq.page).sort()).toEqual(frPageKeys);
      expect(Object.keys(loc.faq.categories).sort()).toEqual(frCategoryKeys);
      expect(Object.keys(loc.faq.links).sort()).toEqual(frLinkKeys);
      expect(Object.keys(loc.faq.items).sort()).toEqual(frItemKeys);

      for (const meta of FAQ_ITEMS_META) {
        const entry = loc.faq.items[meta.id];
        expect(
          entry.question.trim().length,
          `${loc.code}:${meta.id}.question`
        ).toBeGreaterThan(0);
        expect(
          entry.answer.trim().length,
          `${loc.code}:${meta.id}.answer`
        ).toBeGreaterThan(0);
        expect(entry.answer).not.toMatch(/\/track|\/partners\/apply/);

        for (const link of meta.links ?? []) {
          const label = loc.faq.links[link.key];
          expect(entry.answer, `${loc.code}:${meta.id}`).toContain(label);
        }
      }
    }
  });

  it("filters FAQ items case- and diacritic-insensitively across category and query", () => {
    const { items } = buildFrFaqFixtures();

    const byDiacriticQuery = filterFaqItems(items, {
      category: "all",
      query: "delais",
    });
    expect(byDiacriticQuery.some((item) => item.id === "turnaroundTimes")).toBe(
      true
    );

    const byCategory = filterFaqItems(items, {
      category: "partners",
      query: "",
    });
    expect(byCategory.map((item) => item.id)).toEqual(["becomePartner"]);

    const noMatches = filterFaqItems(items, {
      category: "payment",
      query: "requisition-inexistante-xyz",
    });
    expect(noMatches).toEqual([]);
  });

  it("switches category tabs, renders inline primary underlined links, resets empty state, and toggles accordion items", async () => {
    const user = userEvent.setup();
    renderFaqExplorer();

    expect(screen.getByText("15 questions affichées")).toBeTruthy();

    // Switch to Partner Houses tab via @ui-sdk Tabs -> renders inline link to /partners/apply
    const partnersTab = screen.getByRole("tab", {
      name: /Pressings partenaires/i,
    });
    await user.click(partnersTab);

    expect(screen.getByText("1 question affichée")).toBeTruthy();
    const partnerLink = screen.getByRole("link", {
      name: frMessages.faq.links.partnerApply,
    });
    expect(partnerLink.getAttribute("href")).toBe("/partners/apply");
    expect(partnerLink.className).toContain("text-primary");
    expect(partnerLink.className).toContain("underline");

    // Switch to Orders tab and open guestTracking -> renders inline link to /track
    await user.click(screen.getByRole("tab", { name: /^Commandes/i }));
    await user.click(
      screen.getByRole("button", {
        name: frMessages.faq.items.guestTracking.question,
      })
    );
    const trackLink = screen.getByRole("link", {
      name: frMessages.faq.links.trackPage,
    });
    expect(trackLink.getAttribute("href")).toBe("/track");
    expect(trackLink.className).toContain("text-primary");
    expect(trackLink.className).toContain("underline");

    // Type unmatched query -> empty state appears -> click reset filters
    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "introuvable999");

    expect(screen.getByText(frMessages.faq.page.emptyTitle)).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: frMessages.faq.page.resetFilters })
    );

    expect(screen.getByText("15 questions affichées")).toBeTruthy();
  });
});
