import { describe, expect, it } from "vitest";
import { constructMetadata, getCanonicalUrl } from "../seo";
import {
  createOrganizationJsonLd,
  createWebSiteJsonLd,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
} from "../json-ld";

describe("SEO Utilities", () => {
  it("generates correct canonical URL", () => {
    const url = getCanonicalUrl("/houses");
    expect(url).toContain("/houses");
  });

  it("constructs indexable metadata with OpenGraph and Twitter", () => {
    const meta = constructMetadata({
      title: "Trouver un Pressing | SafiHub",
      description: "Comparez les pressings de Bukavu.",
      path: "/houses",
    });

    expect(meta.title).toBe("Trouver un Pressing | SafiHub");
    expect(meta.description).toBe("Comparez les pressings de Bukavu.");
    expect(meta.openGraph?.title).toBe("Trouver un Pressing | SafiHub");
    expect((meta.twitter as { card?: string })?.card).toBe(
      "summary_large_image"
    );
    expect(meta.robots).toEqual(
      expect.objectContaining({
        index: true,
        follow: true,
      })
    );
  });

  it("constructs noindex metadata for private pages", () => {
    const meta = constructMetadata({
      title: "Mon Compte | SafiHub",
      noIndex: true,
    });

    expect(meta.robots).toEqual(
      expect.objectContaining({
        index: false,
        follow: false,
      })
    );
    expect(meta.openGraph).toBeUndefined();
  });
});

describe("JSON-LD Utilities", () => {
  it("creates valid Organization and WebSite schema", () => {
    const org = createOrganizationJsonLd();
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("SafiHub");

    const site = createWebSiteJsonLd();
    expect(site["@type"]).toBe("WebSite");
    expect(site.potentialAction).toBeDefined();
  });

  it("creates BreadcrumbList schema", () => {
    const breadcrumb = createBreadcrumbJsonLd([
      { name: "Accueil", path: "/" },
      { name: "Pressings", path: "/houses" },
    ]);
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(breadcrumb.itemListElement).toHaveLength(2);
    expect(breadcrumb.itemListElement[0].position).toBe(1);
    expect(breadcrumb.itemListElement[1].name).toBe("Pressings");
  });

  it("creates FAQPage schema", () => {
    const faq = createFaqJsonLd([
      { question: "Quel est le délai ?", answer: "24h à 48h." },
    ]);
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity[0].name).toBe("Quel est le délai ?");
  });
});

