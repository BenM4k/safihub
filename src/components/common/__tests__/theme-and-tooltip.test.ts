import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Tooltip Responsive & Overflow Safeguards", () => {
  const tooltipPath = path.resolve(process.cwd(), "src/components/ui/tooltip.tsx");

  it("ensures TooltipContent enforces mobile screen constraints and collision padding", () => {
    const content = fs.readFileSync(tooltipPath, "utf-8");
    
    // Checks that collisionPadding is configured
    expect(content).toContain("collisionPadding = 12");
    
    // Checks that max-width is constrained to viewport on mobile to prevent overflow
    expect(content).toContain("max-w-[calc(100vw-2rem)]");
    
    // Checks that break-words is present so long text doesn't overflow
    expect(content).toContain("break-words");
    
    // Checks that sideOffset is set
    expect(content).toContain("sideOffset = 4");
  });
});

describe("ClientShellAddons Preferences Widget Mobile Positioning & Enter Animation", () => {
  const widgetPath = path.resolve(process.cwd(), "src/components/common/preferences-widget/index.tsx");

  it("verifies mobile downward positioning and smooth enter animation without exit delay", () => {
    const content = fs.readFileSync(widgetPath, "utf-8");
    // Enter animation: fade-in, zoom-in, slide-in from bottom, ease-out
    expect(content).toContain("origin-bottom-right duration-300 ease-out animate-in fade-in-0 zoom-in-90 slide-in-from-bottom-4");
    // No exit animation
    expect(content).not.toContain("animate-out");
    // Downward positioning on mobile
    expect(content).toContain('hasBottomNav ? "bottom-[4.25rem]" : "bottom-5"');
  });
});

describe("Theme Provider & Theme Switching Setup", () => {
  const layoutPath = path.resolve(process.cwd(), "src/app/layout.tsx");
  const themeProviderPath = path.resolve(process.cwd(), "src/components/theme-provider.tsx");
  const usePreferencesPath = path.resolve(process.cwd(), "src/components/common/preferences-widget/use-preferences.ts");

  it("verifies ThemeProvider exists and is wired in RootLayout with next-themes", () => {
    expect(fs.existsSync(themeProviderPath)).toBe(true);
    const themeProviderContent = fs.readFileSync(themeProviderPath, "utf-8");
    expect(themeProviderContent).toContain("from \"next-themes\"");
    expect(themeProviderContent).toContain("NextThemesProvider");

    const layoutContent = fs.readFileSync(layoutPath, "utf-8");
    expect(layoutContent).toContain("ThemeProvider");
    expect(layoutContent).toContain("attribute=\"class\"");
    expect(layoutContent).toContain("defaultTheme=\"system\"");
    expect(layoutContent).toContain("enableSystem");
    expect(layoutContent).toContain("storageKey=\"safihub_theme\"");
  });

  it("verifies usePreferences utilizes useTheme from next-themes for theme switching", () => {
    const preferencesContent = fs.readFileSync(usePreferencesPath, "utf-8");
    expect(preferencesContent).toContain("useTheme");
    expect(preferencesContent).toContain("from \"next-themes\"");
    expect(preferencesContent).toContain("setNextTheme(theme)");
  });
});

describe("Partner Apply Page Dark Mode Compatibility & Alignment", () => {
  const applyPagePath = path.resolve(process.cwd(), "src/app/partners/apply/page.tsx");
  const formPath = path.resolve(process.cwd(), "src/components/partner/partner-application-form.tsx");
  const fieldsPath = path.resolve(process.cwd(), "src/components/partner/partner-application-fields.tsx");
  const benefitsPath = path.resolve(process.cwd(), "src/components/partner/partner-benefits.tsx");
  const skeletonPath = path.resolve(process.cwd(), "src/components/partner/partner-apply-skeleton.tsx");

  it("verifies partner apply page includes dark mode backgrounds and sticky alignment", () => {
    const pageContent = fs.readFileSync(applyPagePath, "utf-8");
    expect(pageContent).toContain("dark:bg-background");
    expect(pageContent).toContain("dark:text-muted-foreground");
    expect(pageContent).toContain("lg:sticky lg:top-28");
  });

  it("verifies partner application form has aligned inputs, dark mode classes, and select height parity", () => {
    const formContent = fs.readFileSync(formPath, "utf-8");
    const fieldsContent = fs.readFileSync(fieldsPath, "utf-8");
    expect(formContent).toContain("dark:bg-card");
    expect(formContent).toContain("dark:text-muted-foreground");
    // Parity of select with Input: min-h-12 and rounded-xl
    expect(fieldsContent).toContain("min-h-12 appearance-none rounded-xl border border-border-strong bg-card");
  });

  it("verifies partner benefits card is styled with matching dark mode card tokens", () => {
    const benefitsContent = fs.readFileSync(benefitsPath, "utf-8");
    expect(benefitsContent).toContain("bg-white dark:bg-card");
    expect(benefitsContent).toContain("border border-border");
    expect(benefitsContent).toContain("dark:text-muted-foreground");
  });

  it("verifies partner apply skeleton matches dark mode and 2-column input grid", () => {
    const skeletonContent = fs.readFileSync(skeletonPath, "utf-8");
    expect(skeletonContent).toContain("dark:bg-white/10");
    expect(skeletonContent).toContain("dark:bg-card");
    expect(skeletonContent).toContain("grid grid-cols-1 sm:grid-cols-2 gap-5");
  });
});

