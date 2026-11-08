import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("SafiHub Official Brand Logo & Favicon Assets", () => {
  const publicDir = path.resolve(process.cwd(), "public");

  it("ensures transparent high-resolution logo PNGs exist", () => {
    const logoPng = path.join(publicDir, "logo.png");
    const logoLightPng = path.join(publicDir, "logo-light.png");
    const logoDarkPng = path.join(publicDir, "logo-dark.png");

    expect(fs.existsSync(logoPng)).toBe(true);
    expect(fs.existsSync(logoLightPng)).toBe(true);
    expect(fs.existsSync(logoDarkPng)).toBe(true);

    expect(fs.statSync(logoPng).size).toBeGreaterThan(1000);
    expect(fs.statSync(logoLightPng).size).toBeGreaterThan(1000);
    expect(fs.statSync(logoDarkPng).size).toBeGreaterThan(1000);
  });

  it("ensures light mode and dark mode favicon assets exist", () => {
    const favLight = path.join(publicDir, "favicon-light.png");
    const favDark = path.join(publicDir, "favicon-dark.png");
    const favIco = path.join(publicDir, "favicon.ico");
    const appleIcon = path.join(publicDir, "apple-icon.png");

    expect(fs.existsSync(favLight)).toBe(true);
    expect(fs.existsSync(favDark)).toBe(true);
    expect(fs.existsSync(favIco)).toBe(true);
    expect(fs.existsSync(appleIcon)).toBe(true);

    expect(fs.statSync(favLight).size).toBeGreaterThan(200);
    expect(fs.statSync(favDark).size).toBeGreaterThan(200);
    expect(fs.statSync(favIco).size).toBeGreaterThan(500);
    expect(fs.statSync(appleIcon).size).toBeGreaterThan(500);
  });

  it("ensures SVG vector logo and adaptive favicon exist", () => {
    const logoSvg = path.join(publicDir, "logo.svg");
    const logoDarkSvg = path.join(publicDir, "logo-dark.svg");
    const favSvg = path.join(publicDir, "favicon.svg");

    expect(fs.existsSync(logoSvg)).toBe(true);
    expect(fs.existsSync(logoDarkSvg)).toBe(true);
    expect(fs.existsSync(favSvg)).toBe(true);

    const favSvgContent = fs.readFileSync(favSvg, "utf-8");
    expect(favSvgContent).toContain("prefers-color-scheme: dark");
  });

  it("exports BrandLogo and BrandLogoMark components", async () => {
    const mod = await import("../brand-logo");
    expect(mod.BrandLogo).toBeDefined();
    expect(mod.BrandLogoMark).toBeDefined();
  });
});

