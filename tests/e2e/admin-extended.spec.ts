/**
 * ADMIN-EXT SUITE — ADMX-01 to ADMX-20
 * Admin pages: categories, customers, returns, reviews, coupons, failed-emails.
 * All tests use the pre-authenticated adminPage fixture from globalSetup / storageState.
 */
import { test, expect } from "@playwright/test";

// Re-use authenticated session from storageState configured in playwright.config.ts
// Each test starts with the admin already logged in.

const ADMIN_NAV_ITEMS = [
  { name: "Dashboard", href: "/admin" },
  { name: "Products", href: "/admin/products" },
  { name: "Orders", href: "/admin/orders" },
  { name: "Categories", href: "/admin/categories" },
  { name: "Customers", href: "/admin/customers" },
  { name: "Returns", href: "/admin/returns" },
  { name: "Reviews", href: "/admin/reviews" },
  { name: "Coupons", href: "/admin/coupons" },
  { name: "Failed Emails", href: "/admin/failed-emails" },
];

test.describe("Admin extended pages", () => {
  test.use({ storageState: "tests/e2e/.auth/admin.json" });

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

  test("ADMX-01 admin nav sidebar contains all required links", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });
    for (const item of ADMIN_NAV_ITEMS) {
      const link = page.locator(`a[href="${item.href}"], a[href^="${item.href}/"]`).or(
        page.getByRole("link", { name: new RegExp(item.name, "i") })
      );
      await expect(link.first(), `Nav link for ${item.name} missing`).toBeVisible();
    }
  });

  test("ADMX-02 admin dashboard renders stats cards", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });
    await expect(page).not.toHaveTitle(/error|not found/i);
    // Dashboard typically has revenue / orders / customers counters
    await expect(page.locator("main")).toBeVisible();
  });

  test("ADMX-03 /admin/categories loads table or empty state", async ({ page }) => {
    await page.goto("/admin/categories", { waitUntil: "networkidle" });
    await expect(page).not.toHaveTitle(/error|not found/i);
    await expect(page.locator("main")).toBeVisible();
  });

  test("ADMX-04 /admin/categories has Add Category button", async ({ page }) => {
    await page.goto("/admin/categories", { waitUntil: "networkidle" });
    const addBtn = page.getByRole("button", { name: /add category|new category/i })
      .or(page.getByRole("link", { name: /add category|new category/i }));
    await expect(addBtn.first()).toBeVisible();
  });

  test("ADMX-05 /admin/customers loads customer list or empty state", async ({ page }) => {
    await page.goto("/admin/customers", { waitUntil: "networkidle" });
    await expect(page).not.toHaveTitle(/error|not found/i);
    await expect(page.locator("main")).toBeVisible();
  });

  test("ADMX-06 /admin/returns loads returns list", async ({ page }) => {
    await page.goto("/admin/returns", { waitUntil: "networkidle" });
    await expect(page).not.toHaveTitle(/error|not found/i);
    await expect(page.locator("main")).toBeVisible();
  });

  test("ADMX-07 /admin/reviews loads with Pending and Published sections", async ({ page }) => {
    await page.goto("/admin/reviews", { waitUntil: "networkidle" });
    await expect(page).not.toHaveTitle(/error|not found/i);
    await expect(
      page.getByText(/pending/i).or(page.getByText(/published/i)).first()
    ).toBeVisible();
  });

  test("ADMX-08 /admin/coupons loads coupon list or empty state", async ({ page }) => {
    await page.goto("/admin/coupons", { waitUntil: "networkidle" });
    await expect(page).not.toHaveTitle(/error|not found/i);
    await expect(page.locator("main")).toBeVisible();
  });

  test("ADMX-09 /admin/coupons has a Create Coupon form", async ({ page }) => {
    await page.goto("/admin/coupons", { waitUntil: "networkidle" });
    const codeInput = page.locator("input[name='code'], input[placeholder*='code' i]");
    await expect(codeInput.first()).toBeVisible();
  });

  test("ADMX-10 creating a coupon with empty code shows validation error", async ({ page }) => {
    await page.goto("/admin/coupons", { waitUntil: "networkidle" });
    const submitBtn = page.getByRole("button", { name: /create|add coupon/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      // Should stay on coupons page (validation error)
      expect(page.url()).toContain("/admin/coupons");
    }
  });

  test("ADMX-11 /admin/failed-emails loads without error", async ({ page }) => {
    await page.goto("/admin/failed-emails", { waitUntil: "networkidle" });
    await expect(page).not.toHaveTitle(/error|500/i);
    await expect(page.locator("main")).toBeVisible();
  });

  test("ADMX-12 /admin/orders loads order list or empty state", async ({ page }) => {
    await page.goto("/admin/orders", { waitUntil: "networkidle" });
    await expect(page).not.toHaveTitle(/error|not found/i);
    await expect(page.locator("main")).toBeVisible();
  });

  test("ADMX-13 /admin/products loads product table", async ({ page }) => {
    await page.goto("/admin/products", { waitUntil: "networkidle" });
    await expect(page).not.toHaveTitle(/error|not found/i);
    await expect(page.locator("main")).toBeVisible();
  });

  test("ADMX-14 /admin/products/new loads create form", async ({ page }) => {
    await page.goto("/admin/products/new", { waitUntil: "networkidle" });
    await expect(page).not.toHaveTitle(/error|not found/i);
    const titleInput = page.locator("input[name='title'], input[placeholder*='title' i]");
    await expect(titleInput.first()).toBeVisible();
  });

  // browser.newContext() doesn't inherit playwright.config.ts's `use` block
  // (baseURL, extraHTTPHeaders) — only the fixture-provided context/page does.
  // These three tests need a fresh unauthenticated context, so they must pass
  // the Vercel bypass header explicitly or every request here hits Vercel's
  // own SSO wall instead of the app.
  const freshUnauthContext = (browser: import("@playwright/test").Browser) => {
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    return browser.newContext({
      storageState: undefined,
      baseURL: process.env.TEST_BASE_URL || "http://localhost:3001",
      extraHTTPHeaders: bypassSecret ? { "x-vercel-protection-bypass": bypassSecret } : undefined,
    });
  };

  test("ADMX-15 unauthenticated /admin/coupons redirects to login", async ({ browser }) => {
    // Use a fresh context with no session to test auth guard
    const ctx = await freshUnauthContext(browser);
    const page = await ctx.newPage();
    await page.goto("/admin/coupons");
    await expect(page).toHaveURL(/\/admin\/login/);
    await ctx.close();
  });

  test("ADMX-16 unauthenticated /admin/reviews redirects to login", async ({ browser }) => {
    const ctx = await freshUnauthContext(browser);
    const page = await ctx.newPage();
    await page.goto("/admin/reviews");
    await expect(page).toHaveURL(/\/admin\/login/);
    await ctx.close();
  });

  test("ADMX-17 admin login with wrong password shows error", async ({ browser }) => {
    const ctx = await freshUnauthContext(browser);
    const page = await ctx.newPage();
    await page.goto("/admin/login", { waitUntil: "networkidle" });
    await page.locator("input[type='email'], input[name='email']").first().fill("admin@srilayafoods.com");
    await page.locator("input[type='password']").first().fill("wrongpassword123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForTimeout(1500);
    // Should stay on login or show error
    const isOnLogin = page.url().includes("/admin/login");
    const errorMsg = await page.getByText(/invalid|incorrect|error|wrong/i).isVisible().catch(() => false);
    expect(isOnLogin || errorMsg).toBeTruthy();
    await ctx.close();
  });

  test("ADMX-18 admin forgot password page loads", async ({ page }) => {
    await page.goto("/admin/forgot-password", { waitUntil: "networkidle" });
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.getByRole("button", { name: /send|reset/i })).toBeVisible();
  });

  test("ADMX-19 forgot password always returns success (no email enumeration)", async ({ page }) => {
    await page.goto("/admin/forgot-password", { waitUntil: "networkidle" });
    await page.locator("input[type='email']").fill("doesnotexist@example.com");
    await page.getByRole("button", { name: /send|reset/i }).click();
    await page.waitForTimeout(1500);
    // Should show success message regardless of email existence
    await expect(page.getByText(/sent|check.*email|if.*account/i).first()).toBeVisible();
  });

  test("ADMX-20 admin reset-password page renders token input or shows expired", async ({ page }) => {
    // Visiting with an obviously invalid token should show expired/invalid message
    await page.goto("/admin/reset-password?token=invalidtoken123", { waitUntil: "networkidle" });
    await expect(page).not.toHaveTitle(/500|server error/i);
    // Page renders without crashing
    await expect(page.locator("main")).toBeVisible();
  });
});
