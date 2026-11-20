import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import mysql from "mysql2/promise";

/** Full member journey against the local DB and the file mail driver (dev data only). */
test.describe.configure({ mode: "serial" });

const stamp = Date.now();
const email = `e2e+${stamp}@example.invalid`;
const PASSWORD = "Correct-horse-2026";

function mailUrl(to: string, template: string): string {
  const dir = join(process.cwd(), ".data", "mail");
  const files = readdirSync(dir).sort().reverse();
  for (const f of files) {
    const m = JSON.parse(readFileSync(join(dir, f), "utf8")) as { to: string; template: string; url: string | null };
    if (m.to === to && m.template === template && m.url) return m.url;
  }
  throw new Error(`no ${template} mail for ${to}`);
}

async function waitMail(to: string, template: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    try {
      return mailUrl(to, template);
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  throw new Error("mail timeout");
}

async function db() {
  return mysql.createConnection({
    host: process.env.DB_HOST ?? "127.0.0.1",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

async function login(page: Page, e: string, pw: string) {
  await page.goto("/en/login");
  await page.getByLabel("Email").fill(e);
  await page.locator(`input[name="password"]`).fill(pw);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/en\/dashboard/);
}

test.beforeAll(async () => {
  // dev database only: reset rate limits and remove users left by earlier runs of this test
  const conn = await db();
  await conn.query("DELETE FROM rate_limits");
  await conn.end();
});

let targetPublicId = "";
let targetEmail = "";

test("register, onboard and publish", async ({ page }) => {
  await page.goto("/en/register");
  await page.getByLabel("Full name").fill("E2E Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mobile number").fill("01712345678");
  await page.getByLabel("Password", { exact: false }).first().fill(PASSWORD);
  await page.getByText("Male", { exact: true }).click();
  await page.getByLabel("Day").selectOption("10");
  await page.getByLabel("Month").selectOption("5");
  await page.getByLabel("Year").selectOption("1996");
  await page.getByLabel(/I confirm I am 18/).check();
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/en\/onboarding\/about/);

  await page.getByLabel("Display name").fill("E2E Groom");
  await page.getByLabel("Marital status").selectOption("never_married");
  await page.getByLabel(/^Education/).selectOption("bachelors");
  await page.getByLabel("Occupation").fill("Engineer");
  await page.getByLabel("About me").fill("I like books, travel and quiet evenings with family and friends.");
  await page.getByRole("button", { name: "Save and continue" }).click();

  await expect(page).toHaveURL(/\/en\/onboarding\/location/);
  await page.getByLabel("Division").selectOption({ label: "Dhaka" });
  await page.getByLabel("District").selectOption({ label: "Dhaka" });
  await page.getByRole("button", { name: "Save and continue" }).click();

  await expect(page).toHaveURL(/\/en\/onboarding\/photo/);
  await page.getByRole("button", { name: "Skip for now" }).click();

  await expect(page).toHaveURL(/\/en\/onboarding\/preferences/);
  await page.getByRole("button", { name: "Save and continue" }).click();

  await expect(page).toHaveURL(/\/en\/onboarding\/review/);
  await page.getByRole("button", { name: "Publish profile" }).click();
  await expect(page).toHaveURL(/\/en\/search\?welcome=1/);
  await expect(page.getByText("Your profile is published")).toBeVisible();
});

test("search shows only the opposite gender and respects filters", async ({ page }) => {
  await login(page, email, PASSWORD);
  await page.goto("/en/search?age_min=18&age_max=70");
  const cards = page.locator("article");
  await expect(cards.first()).toBeVisible();
  // demo seed: women are named from the female list
  const names = await cards.locator("h3").allInnerTexts();
  expect(names.length).toBeGreaterThan(0);
  for (const n of names) expect(n).not.toMatch(/Arif|Tanvir|Rafi|Sabbir|Nayeem|Imran|Shuvo|Mahir/);
  await page.goto("/en/search?age_min=60&age_max=70");
  await expect(page.getByText("No profiles match these filters yet")).toBeVisible();
});

test("email must be confirmed before expressing interest; then interest, accept, contact reveal", async ({ page, browser }) => {
  await login(page, email, PASSWORD);
  await page.goto("/en/search?age_min=18&age_max=70");
  await page.locator("article a").first().click();
  await expect(page).toHaveURL(/\/en\/profiles\//);
  targetPublicId = page.url().split("/").pop()!.split("?")[0]!;
  await expect(page.getByRole("button", { name: "Express interest" })).toBeDisabled();

  const verifyUrl = await waitMail(email, "verify-email");
  await page.goto(new URL(verifyUrl).pathname + new URL(verifyUrl).search);
  await expect(page.getByText(/Your email is confirmed/)).toBeVisible();

  await page.goto(`/en/profiles/${targetPublicId}`);
  await expect(page.getByText("Contact details")).toHaveCount(0);
  await page.getByRole("button", { name: "Express interest" }).click();
  await page.getByRole("button", { name: "Send interest" }).click();
  await expect(page.getByText("Interest sent")).toBeVisible();

  const conn = await db();
  const [r] = (await conn.query("SELECT u.email FROM users u JOIN profiles p ON p.user_id=u.id WHERE p.public_id=?", [targetPublicId])) as [{ email: string }[], unknown];
  targetEmail = r[0]!.email;
  await conn.end();

  const ctx = await browser.newContext();
  const other = await ctx.newPage();
  await login(other, targetEmail, "Demo-pass-2026");
  await other.goto("/en/dashboard/interests");
  await expect(other.getByText("E2E Groom is interested in you").first()).toBeVisible();
  await other.getByRole("button", { name: "Accept" }).first().click();
  await other.goto("/en/dashboard/interests?tab=connections");
  await expect(other.getByRole("link", { name: /E2E Groom/ }).first()).toBeVisible();
  await ctx.close();

  await page.goto(`/en/profiles/${targetPublicId}`);
  await expect(page.getByRole("heading", { name: "Contact details" })).toBeVisible();
  await expect(page.getByText(targetEmail)).toBeVisible();
});

test("block hides the profile from both sides", async ({ page }) => {
  await login(page, email, PASSWORD);
  await page.goto(`/en/profiles/${targetPublicId}`);
  await page.getByRole("button", { name: "Block" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Block" }).click();
  await expect(page).toHaveURL(/\/en\/search/);
  const res = await page.goto(`/en/profiles/${targetPublicId}`);
  expect(res?.status()).toBe(404);
});

test("account deletion hides the account and logs out", async ({ page }) => {
  await login(page, email, PASSWORD);
  await page.goto("/en/dashboard/delete-account");
  await page.locator(`input[name="password"]`).fill(PASSWORD);
  await page.getByLabel(/type: DELETE/).fill("DELETE");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page).toHaveURL(/account-deleted/);
  await page.goto("/en/dashboard");
  await expect(page).toHaveURL(/\/en\/login/);
});
