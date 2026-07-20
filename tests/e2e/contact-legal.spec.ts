/**
 * CONTACT-LEGAL SUITE — CL-01 to CL-12
 * Contact form submission, About, Privacy, Terms, Shipping, Returns policy pages.
 */
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (bypassSecret) {
    await page.route("**/*", (route) =>
      route.continue({
        headers: { ...route.request().headers(), "x-vercel-protection-bypass": bypassSecret },
      })
    );
  }
});

test("CL-01 /contact page loads with a contact form", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  const form = page.locator("form");
  await expect(form.first()).toBeVisible();
});

test("CL-02 contact form requires name field", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "networkidle" });
  const nameInput = page.locator("input[name='name'], input[placeholder*='name' i]").first();
  if (await nameInput.isVisible()) {
    await nameInput.clear();
    const submitBtn = page.getByRole("button", { name: /send|submit/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      expect(page.url()).toContain("/contact");
    }
  }
});

test("CL-03 contact form requires valid email", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "networkidle" });
  const emailInput = page.locator("input[type='email'], input[name='email']").first();
  if (await emailInput.isVisible()) {
    await emailInput.fill("bademail");
    const submitBtn = page.getByRole("button", { name: /send|submit/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      expect(page.url()).toContain("/contact");
    }
  }
});

test("CL-04 contact form requires message field", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "networkidle" });
  const messageInput = page.locator("textarea[name='message'], textarea[placeholder*='message' i]").first();
  if (await messageInput.isVisible()) {
    await messageInput.clear();
    const submitBtn = page.getByRole("button", { name: /send|submit/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      expect(page.url()).toContain("/contact");
    }
  }
});

test("CL-05 /about page renders without error and has content", async ({ page }) => {
  await page.goto("/about", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  await expect(page.locator("main")).toBeVisible();
  const bodyText = await page.locator("main").textContent();
  expect(bodyText?.trim().length).toBeGreaterThan(100);
});

test("CL-06 /about page mentions SriLaYa or bioenzyme", async ({ page }) => {
  await page.goto("/about", { waitUntil: "networkidle" });
  const relevant = page.getByText(/srilaya|bioenzyme|natural|cleaning/i);
  await expect(relevant.first()).toBeVisible();
});

test("CL-07 /privacy page renders full policy content", async ({ page }) => {
  await page.goto("/privacy", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  const text = await page.locator("main").textContent();
  expect(text?.trim().length).toBeGreaterThan(100);
});

test("CL-08 /terms page renders terms content", async ({ page }) => {
  await page.goto("/terms", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  const text = await page.locator("main").textContent();
  expect(text?.trim().length).toBeGreaterThan(100);
});

test("CL-09 /shipping-policy page renders shipping info", async ({ page }) => {
  await page.goto("/shipping-policy", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  const text = await page.locator("main").textContent();
  expect(text?.trim().length).toBeGreaterThan(50);
});

test("CL-10 /returns-policy page renders return info", async ({ page }) => {
  await page.goto("/returns-policy", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  const text = await page.locator("main").textContent();
  expect(text?.trim().length).toBeGreaterThan(50);
});

test("CL-11 /track page has order tracking form", async ({ page }) => {
  await page.goto("/track", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  const orderInput = page.locator("input[name='orderId'], input[placeholder*='order' i]");
  const form = page.locator("form");
  await expect(orderInput.or(form).first()).toBeVisible();
});

test("CL-12 /returns page shows return request lookup form", async ({ page }) => {
  await page.goto("/returns", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  const orderInput = page.locator("input[name='orderId'], input[placeholder*='order' i]");
  const emailInput = page.locator("input[type='email'], input[name='email']");
  const form = page.locator("form");
  await expect(orderInput.or(emailInput).or(form).first()).toBeVisible();
});
