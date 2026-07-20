import { Page } from "@playwright/test";

// Green has a single admin role in v1 — no owner/RBAC tiers.
export const ADMIN_USER = {
  email: process.env.TEST_ADMIN_EMAIL || "",
  password: process.env.TEST_ADMIN_PASSWORD || "",
};

export async function loginAsAdmin(page: Page) {
  if (!ADMIN_USER.email || !ADMIN_USER.password) {
    throw new Error("TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD are not set — see .env.test");
  }
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(ADMIN_USER.email);
  await page.getByLabel(/password/i).fill(ADMIN_USER.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes("/login"), { timeout: 25000 });
}
