import { describe, expect, it } from "vitest";
import { getChecklistItemsConfig } from "../checklist-config";
import fr from "@/../messages/fr.json";

describe("getChecklistItemsConfig", () => {
  it("generates default fallback strings without a translation function", () => {
    const config = getChecklistItemsConfig("test-house");
    expect(config).toHaveLength(6);
    expect(config[0]).toMatchObject({
      key: "photos",
      stepNumber: 1,
      title: "Photo de couverture et logo",
      href: "/partner/test-house/settings",
      buttonLabel: "Profil",
    });
  });

  it("resolves translations from the message catalog correctly", () => {
    const items = fr.house.checklist.items;
    const config = getChecklistItemsConfig("test-house", (key) => {
      const [itemKey, field] = key.split(".") as [
        keyof typeof items,
        keyof (typeof items)[keyof typeof items]
      ];
      return items[itemKey][field];
    });

    expect(config).toHaveLength(6);
    expect(config[0].title).toBe(fr.house.checklist.items.photos.title);
    expect(config[0].benefit).toBe(fr.house.checklist.items.photos.benefit);
    expect(config[0].buttonLabel).toBe(fr.house.checklist.items.photos.buttonLabel);
  });
});

