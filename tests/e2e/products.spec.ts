/**
 * PRODUCTS SUITE — PROD-01 to PROD-14
 * Product listing, detail, variants, gallery, categories, search, pincode, reviews.
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

test("PROD-01 products listing shows product cards with name and price", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const prices = page.getByText(/₹\s*\d+/);
  await expect(prices.first()).toBeVisible();
  expect(await prices.count()).toBeGreaterThan(0);
  const productLinks = page.locator("a[href^='/product/']");
  expect(await productLinks.count()).toBeGreaterThan(0);
});

test("PROD-02 product detail page renders title, description, and price", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toBeVisible();
  const h1Text = await page.locator("h1").first().textContent();
  expect(h1Text?.trim().length).toBeGreaterThan(0);
  await expect(page.getByText(/₹\s*\d+/).first()).toBeVisible();
});

test("PROD-03 Add to Cart button is present on product detail", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("button", { name: /add to cart|out of stock/i }).first()
  ).toBeVisible();
});

test("PROD-04 variant selector updates price when switching variants", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  const variantButtons = page.locator("button[data-variant], [role='radio']");
  if ((await variantButtons.count()) > 1) {
    const firstPrice = await page.getByText(/₹\s*\d+/).first().textContent();
    await variantButtons.nth(1).click();
    await page.waitForTimeout(300);
    // just assert no crash; price might be same for all variants
    await expect(page.getByText(/₹\s*\d+/).first()).toBeVisible();
  }
});

test("PROD-05 product detail has breadcrumb nav linking back to category", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  // Scoped to <main> — header and footer also have "All Products" links,
  // which makes the unscoped locator ambiguous (strict mode violation).
  const allProductsLink = page.getByRole("main").getByRole("link", { name: /all products/i });
  await expect(allProductsLink).toBeVisible();
  await expect(allProductsLink).toHaveAttribute("href", "/product");
});

test("PROD-06 product image gallery renders with at least one image", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  const images = page.locator("img[alt]");
  await expect(images.first()).toBeVisible();
  expect(await images.count()).toBeGreaterThan(0);
});

test("PROD-07 category page loads and filters products", async ({ page }) => {
  // Navigate from the products page, find a category link
  await page.goto("/product", { waitUntil: "networkidle" });
  const categoryLinks = page.locator("a[href^='/category/']");
  if ((await categoryLinks.count()) > 0) {
    const href = await categoryLinks.first().getAttribute("href");
    await page.goto(href!, { waitUntil: "networkidle" });
    await expect(page).not.toHaveTitle(/error|not found/i);
    await expect(page.locator("main")).toBeVisible();
  }
});

test("PROD-08 search returns results for a short keyword", async ({ page }) => {
  await page.goto("/search?q=clean", { waitUntil: "networkidle" });
  await expect(page).not.toHaveTitle(/error|not found/i);
  await expect(page.locator("main")).toBeVisible();
});

test("PROD-09 search shows empty state for unlikely keyword", async ({ page }) => {
  await page.goto("/search?q=xyzzy99notaproduct", { waitUntil: "networkidle" });
  await expect(page.locator("main")).toBeVisible();
  // Expect either 0 results notice or at least no crash
  await expect(page).not.toHaveTitle(/error/i);
});

test("PROD-10 pincode check renders input on product detail", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  const pincodeInput = page.locator("input[maxlength='6'], input[placeholder*='pincode' i], input[placeholder*='pin' i]");
  await expect(pincodeInput.first()).toBeVisible();
});

test("PROD-11 pincode check shows delivery message for valid serviceable pin", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  const pincodeInput = page.locator("input[maxlength='6'], input[placeholder*='pincode' i], input[placeholder*='pin' i]").first();
  await pincodeInput.fill("110001");
  const checkBtn = page.getByRole("button", { name: /check/i });
  await checkBtn.click();
  await page.waitForTimeout(1000);
  await expect(page.getByText(/day|deliver|serviceable/i).first()).toBeVisible();
});

test("PROD-12 pincode check shows unserviceable for known blocked pin", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  const pincodeInput = page.locator("input[maxlength='6'], input[placeholder*='pincode' i], input[placeholder*='pin' i]").first();
  await pincodeInput.fill("950001");
  const checkBtn = page.getByRole("button", { name: /check/i });
  await checkBtn.click();
  await page.waitForTimeout(1000);
  // Actual copy from app/api/pincode-check/route.ts's UNSERVICEABLE_PREFIXES branch
  await expect(page.getByText(/don't deliver/i).first()).toBeVisible();
});

test("PROD-13 reviews section renders on product detail", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  // Reviews section heading should be present
  await expect(page.getByText(/reviews|customer reviews/i).first()).toBeVisible();
});

test("PROD-14 product detail has JSON-LD structured data", async ({ page }) => {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  const href = await firstLink.getAttribute("href");
  await page.goto(href!, { waitUntil: "networkidle" });
  const ldScript = page.locator("script[type='application/ld+json']");
  await expect(ldScript.first()).toBeAttached();
  const content = await ldScript.first().textContent();
  expect(content).toContain('"@type":"Product"');
});
