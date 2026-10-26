import { describe, expect, it } from "vitest";

describe("Admin Shared Primitives Logic", () => {
  describe("DataTable Pagination Calculations", () => {
    function computePagination(page: number, pageSize: number, totalItems: number) {
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
      const end = Math.min(page * pageSize, totalItems);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return { totalPages, start, end, hasNext, hasPrev };
    }

    it("handles first page of multi-page data", () => {
      const res = computePagination(1, 10, 45);
      expect(res.totalPages).toBe(5);
      expect(res.start).toBe(1);
      expect(res.end).toBe(10);
      expect(res.hasPrev).toBe(false);
      expect(res.hasNext).toBe(true);
    });

    it("handles middle page", () => {
      const res = computePagination(3, 10, 45);
      expect(res.start).toBe(21);
      expect(res.end).toBe(30);
      expect(res.hasPrev).toBe(true);
      expect(res.hasNext).toBe(true);
    });

    it("handles last page with partial count", () => {
      const res = computePagination(5, 10, 45);
      expect(res.start).toBe(41);
      expect(res.end).toBe(45);
      expect(res.hasPrev).toBe(true);
      expect(res.hasNext).toBe(false);
    });

    it("handles empty data gracefully", () => {
      const res = computePagination(1, 10, 0);
      expect(res.totalPages).toBe(1);
      expect(res.start).toBe(0);
      expect(res.end).toBe(0);
      expect(res.hasPrev).toBe(false);
      expect(res.hasNext).toBe(false);
    });
  });

  describe("Confirm Dialog Guardrails", () => {
    function canSubmitConfirmation(requireReason: boolean, reason: string): boolean {
      if (!requireReason) return true;
      return reason.trim().length > 0;
    }

    it("allows submission without reason when requireReason is false", () => {
      expect(canSubmitConfirmation(false, "")).toBe(true);
      expect(canSubmitConfirmation(false, "   ")).toBe(true);
    });

    it("blocks submission when requireReason is true and reason is empty/whitespace", () => {
      expect(canSubmitConfirmation(true, "")).toBe(false);
      expect(canSubmitConfirmation(true, "   ")).toBe(false);
      expect(canSubmitConfirmation(true, "\n\t")).toBe(false);
    });

    it("permits submission when a valid reason is provided", () => {
      expect(canSubmitConfirmation(true, "Compte suspect")).toBe(true);
      expect(canSubmitConfirmation(true, "  Motif valide  ")).toBe(true);
    });
  });

  describe("Status Badge Tone Resolution", () => {
    function resolveBadgeVariant(tone: "success" | "warning" | "destructive" | "info" | "secondary" | "outline") {
      switch (tone) {
        case "success":
          return "bg-success-soft text-success";
        case "warning":
          return "bg-warning-soft text-warning";
        case "destructive":
          return "bg-destructive text-destructive-foreground";
        case "info":
          return "bg-primary-soft text-primary";
        case "outline":
          return "text-foreground";
        case "secondary":
        default:
          return "bg-secondary text-secondary-foreground";
      }
    }

    it("maps all supported status tones to semantic tokens", () => {
      expect(resolveBadgeVariant("success")).toContain("text-success");
      expect(resolveBadgeVariant("warning")).toContain("text-warning");
      expect(resolveBadgeVariant("destructive")).toContain("bg-destructive");
      expect(resolveBadgeVariant("info")).toContain("text-primary");
      expect(resolveBadgeVariant("secondary")).toContain("bg-secondary");
      expect(resolveBadgeVariant("outline")).toContain("text-foreground");
    });
  });
});
