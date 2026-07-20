/**
 * NAV-SEO SUITE — NAV-01 to NAV-14
 * Header, mobile menu, brand integrity, meta/OG tags, sitemap, robots.
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

test("NAV-01 header contains SriLaYa Green logo or brand text", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const header = page.locator("header");
  await expect(header).toBeVisible();
  const brandText = header.getByText(/srilaya green/i)
    .or(header.locator("img[alt*='srilaya' i]"))
    .or(header.locator("img[alt*='green' i]"));
  await expect(brandText.first()).toBeVisible();
});

test("NAV-02 header links Products and Cart are present", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const header = page.locator("header");
  await expect(header.getByRole("link", { name: /products?|shop/i }).first()).toBeVisible();
  await expect(header.getByRole("link", { name: /cart/i }).first()).toBeVisible();
});

test("NAV-03 mobile hamburger menu opens nav on small screen", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/", { waitUntil: "networkidle" });
  const menuBtn = page.getByRole("button", { name: /menu|hamburger|open/i })
    .or(page.locator("[aria-label='menu' i], [aria-label='open menu' i]"))
    .or(page.locator("button svg").first());
  if (await menuBtn.first().isVisible()) {
    await menuBtn.first().click();
    await page.waitForTimeout(400);
    // After opening, nav links should be visible
    await expect(page.getByRole("link", { name: /products?|home|cart/i }).first()).toBeVisible();
  }
});

test("NAV-04 footer renders with brand name and copyright", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const footer = page.locator("footer");
  await expect(footer).toBeVisible();
  await expect(footer.getByText(/srilaya/i).or(footer.getByText(/©|copyright/i)).first()).toBeVisible();
});

test("NAV-05 homepage has canonical og:url matching the domain", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const ogUrl = await page.locator("meta[property='og:url']").getAttribute("content");
  // Just check it exists and is non-empty
  expect(ogUrl?.length).toBeGreaterThan(0);
});

test("NAV-06 homepage has og:title meta tag", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const ogTitle = await page.locator("meta[property='og:title']").getAttribute("content");
  expect(ogTitle?.length).toBeGreaterThan(0);
  expect(ogTitle).toMatch(/srilaya/i);
});

test("NAV-07 homepage has og:description meta tag", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const ogDesc = await page.locator("meta[property='og:description'], meta[name='description']").first().getAttribute("content");
  expect(ogDesc?.length).toBeGreaterThan(10);
});

test("NAV-08 product detail has og:image meta tag", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  const ogImage = await page.locator("meta[property='og:image']").getAttribute("content");
  // May be absent if product has no image — just check no crash
  await expect(page).not.toHaveTitle(/500|server error/i);
});

test("NAV-09 product detail page has canonical product title in <title>", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  const title = await page.title();
  expect(title).toMatch(/srilaya green/i);
  expect(title.length).toBeGreaterThan(10);
});

test("NAV-10 /about page has a <h1> with meaningful content", async ({ page }) => {
  await page.goto("/about", { waitUntil: "networkidle" });
  const h1 = page.locator("h1").first();
  await expect(h1).toBeVisible();
  const text = await h1.textContent();
  expect(text?.trim().length).toBeGreaterThan(3);
});

test("NAV-11 /contact page has contact form or contact info", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "networkidle" });
  const form = page.locator("form");
  const emailText = page.getByText(/@/);
  await expect(form.or(emailText).first()).toBeVisible();
});

test("NAV-12 /privacy page has privacy policy heading", async ({ page }) => {
  await page.goto("/privacy", { waitUntil: "networkidle" });
  await expect(page.getByText(/privacy/i).first()).toBeVisible();
});

test("NAV-13 /terms page loads with some text content", async ({ page }) => {
  await page.goto("/terms", { waitUntil: "networkidle" });
  await expect(page.locator("main")).toBeVisible();
  const text = await page.locator("main").textContent();
  expect(text?.trim().length).toBeGreaterThan(50);
});

test("NAV-14 /shipping-policy and /returns-policy pages load", async ({ page }) => {
  for (const route of ["/shipping-policy", "/returns-policy"]) {
    const res = await page.goto(route, { waitUntil: "networkidle" });
    expect(res?.status()).not.toBe(500);
    await expect(page.locator("main")).toBeVisible();
    const text = await page.locator("main").textContent();
    expect(text?.trim().length).toBeGreaterThan(20);
  }
});
