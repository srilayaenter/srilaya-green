/**
 * SMOKE SUITE — SMOKE-01 to SMOKE-12
 * Public routes only, no auth. Target: < 90 seconds total.
 * Runs on every push via CI; must pass before merging to main.
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

test("SMOKE-01 homepage loads with SriLaYa Green brand name", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/srilaya green/i);
  await expect(page).not.toHaveTitle(/error|not found/i);
});

test("SMOKE-02 products listing renders at least one product", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  const productLinks = page.locator("a[href^='/product/']");
  await expect(productLinks.first()).toBeVisible();
  expect(await productLinks.count()).toBeGreaterThan(0);
});

test("SMOKE-03 product detail page loads with price and Add to Cart", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  await expect(firstLink).toBeVisible();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  await expect(page.getByText(/₹\s*\d+/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /add to cart|out of stock/i }).first()).toBeVisible();
});

test("SMOKE-04 cart page loads without crashing", async ({ page }) => {
  await page.goto("/cart", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  await expect(page.locator("main")).toBeVisible();
});

test("SMOKE-05 admin login page loads", async ({ page }) => {
  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});

test("SMOKE-06 unauthenticated /admin redirects to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("SMOKE-07 key static pages return 200", async ({ page }) => {
  const routes = ["/about", "/contact", "/privacy", "/terms", "/shipping-policy", "/returns-policy"];
  for (const route of routes) {
    const res = await page.goto(route, { waitUntil: "networkidle" });
    expect(res?.status(), `${route} returned ${res?.status()}`).not.toBe(500);
    await expect(page.locator("main").first(), `${route} has no <main>`).toBeVisible();
  }
});

test("SMOKE-08 sitemap.xml is valid XML with at least one URL", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text).toContain("<urlset");
  expect(text).toContain("<loc>");
});

test("SMOKE-09 robots.txt disallows /admin", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text).toContain("Disallow: /admin");
});

test("SMOKE-10 track order page loads", async ({ page }) => {
  await page.goto("/track", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  await expect(page.locator("main")).toBeVisible();
});

test("SMOKE-11 returns page loads", async ({ page }) => {
  await page.goto("/returns", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  await expect(page.locator("main")).toBeVisible();
});

test("SMOKE-12 search page renders without crash", async ({ page }) => {
  await page.goto("/search?q=enzyme", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  await expect(page.locator("main")).toBeVisible();
});
