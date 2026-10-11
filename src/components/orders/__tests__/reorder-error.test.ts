import { describe, it, expect, vi } from "vitest";
import { formatReorderErrorMessage } from "../reorder-error";

describe("formatReorderErrorMessage", () => {
  const mockTranslations: Record<string, string> = {
    orderAgainUnauthenticated: "Vous devez être connecté pour renouveler une commande.",
    orderAgainNotFound: "Commande introuvable.",
    orderAgainAccessDenied: "Accès refusé à cette commande.",
    orderAgainHouseInactive: "Cet atelier de pressing n'est plus actif sur la plateforme.",
    orderAgainOrderEmpty: "Cette commande ne contient aucun article.",
    orderAgainNoItemsAvailable: "Tous les articles de cette commande ne sont plus traités ou disponibles dans cet atelier.",
    orderAgainError: "Impossible de renouveler cette commande.",
  };

  const t = vi.fn((key: string) => mockTranslations[key] ?? key);

  it("maps UNAUTHENTICATED to orderAgainUnauthenticated", () => {
    expect(formatReorderErrorMessage("UNAUTHENTICATED", t)).toBe(
      "Vous devez être connecté pour renouveler une commande."
    );
    expect(t).toHaveBeenCalledWith("orderAgainUnauthenticated");
  });

  it("maps ORDER_NOT_FOUND to orderAgainNotFound", () => {
    expect(formatReorderErrorMessage("ORDER_NOT_FOUND", t)).toBe("Commande introuvable.");
    expect(t).toHaveBeenCalledWith("orderAgainNotFound");
  });

  it("maps ACCESS_DENIED to orderAgainAccessDenied", () => {
    expect(formatReorderErrorMessage("ACCESS_DENIED", t)).toBe("Accès refusé à cette commande.");
    expect(t).toHaveBeenCalledWith("orderAgainAccessDenied");
  });

  it("maps HOUSE_NOT_ACTIVE to orderAgainHouseInactive", () => {
    expect(formatReorderErrorMessage("HOUSE_NOT_ACTIVE", t)).toBe(
      "Cet atelier de pressing n'est plus actif sur la plateforme."
    );
    expect(t).toHaveBeenCalledWith("orderAgainHouseInactive");
  });

  it("maps ORDER_EMPTY to orderAgainOrderEmpty", () => {
    expect(formatReorderErrorMessage("ORDER_EMPTY", t)).toBe("Cette commande ne contient aucun article.");
    expect(t).toHaveBeenCalledWith("orderAgainOrderEmpty");
  });

  it("maps NO_ITEMS_AVAILABLE to orderAgainNoItemsAvailable", () => {
    expect(formatReorderErrorMessage("NO_ITEMS_AVAILABLE", t)).toBe(
      "Tous les articles de cette commande ne sont plus traités ou disponibles dans cet atelier."
    );
    expect(t).toHaveBeenCalledWith("orderAgainNoItemsAvailable");
  });

  it("maps unknown or undefined error codes to fallback orderAgainError", () => {
    expect(formatReorderErrorMessage(undefined, t)).toBe("Impossible de renouveler cette commande.");
    expect(formatReorderErrorMessage("RANDOM_ERROR", t)).toBe("Impossible de renouveler cette commande.");
  });
});
