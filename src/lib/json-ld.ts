import { getAppBaseUrl } from "@/lib/app-url";

export function createOrganizationJsonLd() {
  const baseUrl = getAppBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SafiHub",
    alternateName: "SafiHub Bukavu",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "Plateforme de pressing et blanchisserie à la demande à Bukavu, RDC.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bukavu",
      addressRegion: "Sud-Kivu",
      addressCountry: "CD",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+243-970-000-000",
      contactType: "customer service",
      areaServed: "Bukavu, Sud-Kivu, RDC",
      availableLanguage: ["French", "Swahili", "English"],
    },
  };
}

export function createWebSiteJsonLd() {
  const baseUrl = getAppBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SafiHub",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/houses?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function createBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
) {
  const baseUrl = getAppBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const cleanPath = item.path.startsWith("/") ? item.path : `/${item.path}`;
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${baseUrl}${cleanPath === "/" ? "" : cleanPath}`,
      };
    }),
  };
}

export function createFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

