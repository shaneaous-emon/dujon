import { expect, test } from "@playwright/test";

test.describe("Language (FR-I18N-001–003)", () => {
  test("TC-012 Bangla is the default even when the browser prefers English", async ({ browser }) => {
    const context = await browser.newContext({
      locale: "en-US",
      extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("সহজে খুঁজুন আপনার মনের মতো জীবনসঙ্গী");
    await context.close();
  });

  test("TC-013 switcher keeps the current path and query", async ({ page }) => {
    await page.goto("/?ref=test");
    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\?ref=test$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Find someone who feels right");
  });

  test("TC-014 an explicit English choice is remembered on the next visit", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en$/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    // Switching back to Bangla is remembered too.
    await page.getByRole("link", { name: "বাংলা" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  });

  test("visiting /bn redirects to the unprefixed Bangla URL", async ({ page }) => {
    await page.goto("/bn");
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("Errors and basics", () => {
  test("TC-011 localized 404 pages", async ({ page }) => {
    const bn = await page.goto("/does-not-exist");
    expect(bn?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("পৃষ্ঠাটি খুঁজে পাওয়া যায়নি");

    const en = await page.goto("/en/does-not-exist");
    expect(en?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  });

  test("skip link is the first focusable element (NFR-A11Y-002)", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "মূল অংশে যান" })).toBeFocused();
  });

  test("TC-114 security headers are present", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("TC-104 non-production responses are noindex", async ({ request }) => {
    const response = await request.get("/");
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
  });
});
