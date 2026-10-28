import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAppBaseUrl } from "../app-url";

describe("getAppBaseUrl", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns NEXT_PUBLIC_APP_URL without trailing slash when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://safihub.cd/");
    vi.stubEnv("BETTER_AUTH_URL", "");
    expect(getAppBaseUrl()).toBe("https://safihub.cd");
  });

  it("falls back to BETTER_AUTH_URL when NEXT_PUBLIC_APP_URL is not set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("BETTER_AUTH_URL", "https://auth.safihub.cd/");
    expect(getAppBaseUrl()).toBe("https://auth.safihub.cd");
  });

  it("returns localhost in development/test when no env var is set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("BETTER_AUTH_URL", "");
    vi.stubEnv("NODE_ENV", "test");
    expect(getAppBaseUrl()).toBe("http://localhost:3000");
  });

  it("warns in production when no env var is set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("BETTER_AUTH_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(getAppBaseUrl()).toBe("http://localhost:3000");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[getAppBaseUrl] Warning")
    );

    warnSpy.mockRestore();
  });
});

