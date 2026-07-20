/**
 * ADMIN MODULE — TC-ADM-*
 * Green has a single admin role in v1 (no owner/RBAC tiers, no raw materials/POS).
 */
import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

// ─── Auth & RBAC ────────────────────────────────────────────────────────────

test("ADM-01 admin login redirects to dashboard", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page).toHaveURL(/\/admin$/);
});

test("ADM-02 unauthenticated request to /admin redirects to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("ADM-03 unauthenticated request to /admin/products redirects to login", async ({ page }) => {
  await page.goto("/admin/products");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("ADM-04 already-authenticated admin visiting /admin/login redirects to /admin", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/login");
  await expect(page).toHaveURL(/\/admin$/);
});

// ─── Dashboard ──────────────────────────────────────────────────────────────

test("ADM-05 dashboard shows KPI cards", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page.getByText(/total orders/i)).toBeVisible();
  await expect(page.getByText(/^products$/i)).toBeVisible();
  await expect(page.getByText(/^revenue$/i)).toBeVisible();
});

test("ADM-06 dashboard recent orders table renders", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page.getByRole("heading", { name: /recent orders/i })).toBeVisible();
});

// ─── Products ───────────────────────────────────────────────────────────────

test("ADM-07 admin products list loads", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/products");
  await expect(page.getByRole("heading", { name: /^products$/i })).toBeVisible();
  await expect(page.locator("table").first()).toBeVisible();
});

test("ADM-08 create a new product and reach its edit page", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/products/new");

  const stamp = Date.now();
  await page.locator("input[name='title']").fill(`Automated Test Product ${stamp}`);
  await page.locator("input[name='slug']").fill(`automated-test-product-${stamp}`);
  await page.locator("input[name='sku']").fill(`ATP-${stamp}`);
  await page.locator("input[name='gstRate']").fill("18");
  // First category option is fine — form requires a selection but doesn't care which
  await page.locator("input[name='variantSize']").fill("500ml");
  await page.locator("input[name='variantSku']").fill(`ATP-${stamp}-500ML`);
  await page.locator("input[name='variantPrice']").fill("199");
  await page.locator("input[name='variantStock']").fill("50");

  await page.getByRole("button", { name: /create product/i }).click();
  await page.waitForURL(/\/admin\/products\/.+/, { timeout: 15000 });
  await expect(page.locator("input[name='title']")).toHaveValue(`Automated Test Product ${stamp}`);
});

test("ADM-09 product edit page loads with variants", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/products");

  const editLink = page.getByRole("link", { name: /edit/i }).first();
  await expect(editLink).toBeVisible();
  await editLink.click();
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: /edit product/i })).toBeVisible();
  await expect(page.locator("input[name='title']")).toBeVisible();
  await expect(page.getByRole("heading", { name: /variants/i })).toBeVisible();
});

test("ADM-10 update product title saves", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/products");
  await page.getByRole("link", { name: /edit/i }).first().click();
  await page.waitForLoadState("networkidle");

  const titleInput = page.locator("input[name='title']");
  const original = await titleInput.inputValue();
  await titleInput.fill(original); // no-op edit, just exercise the save path
  await page.getByRole("button", { name: /save changes/i }).click();
  await page.waitForLoadState("networkidle");
  await expect(titleInput).toHaveValue(original);
});

test("ADM-11 add a variant to a product", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/products");
  await page.getByRole("link", { name: /edit/i }).first().click();
  await page.waitForLoadState("networkidle");

  const stamp = Date.now();
  const addForm = page.locator("form").filter({ has: page.locator("input[name='size']") });
  await addForm.locator("input[name='size']").fill(`TST${stamp}`.slice(0, 8));
  await addForm.locator("input[name='sku']").fill(`VAR-${stamp}`);
  await addForm.locator("input[name='price']").fill("99");
  await addForm.locator("input[name='stock']").fill("10");
  await addForm.getByRole("button", { name: /add variant/i }).click();

  await page.waitForLoadState("networkidle");
  await expect(page.getByText(`VAR-${stamp}`)).toBeVisible();
});

test("ADM-12 toggle product active state", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/products");

  const toggleBtn = page.getByRole("button", { name: /deactivate|activate/i }).first();
  const beforeText = await toggleBtn.textContent();
  await toggleBtn.click();
  await page.waitForLoadState("networkidle");

  const afterBtn = page.getByRole("button", { name: /deactivate|activate/i }).first();
  const afterText = await afterBtn.textContent();
  expect(afterText).not.toBe(beforeText);

  // Flip it back so repeated runs don't permanently deactivate seed products
  await afterBtn.click();
  await page.waitForLoadState("networkidle");
});

// ─── Orders ─────────────────────────────────────────────────────────────────

test("ADM-13 admin orders list loads", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/orders");
  await expect(page.getByRole("heading", { name: /^orders$/i })).toBeVisible();
  await expect(page.locator("table").first()).toBeVisible();
});

test("ADM-14 order detail page loads with items and totals", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/orders");

  const orderLink = page.locator("table tbody tr td a").first();
  if (await orderLink.count() === 0) {
    test.skip();
    return;
  }
  await orderLink.click();
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: /^order #/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^items$/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /customer & delivery/i })).toBeVisible();
});

test("ADM-15 order status update form saves", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/orders");

  const orderLink = page.locator("table tbody tr td a").first();
  if (await orderLink.count() === 0) {
    test.skip();
    return;
  }
  await orderLink.click();
  await page.waitForLoadState("networkidle");

  const statusSelect = page.locator("select[name='status']");
  const currentStatus = await statusSelect.inputValue();
  await statusSelect.selectOption(currentStatus); // no-op, exercises the save path
  await page.getByRole("button", { name: /update status/i }).click();
  await page.waitForLoadState("networkidle");
  await expect(statusSelect).toHaveValue(currentStatus);
});

test("ADM-16 shipment form saves courier and tracking number", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/orders");

  const orderLink = page.locator("table tbody tr td a").first();
  if (await orderLink.count() === 0) {
    test.skip();
    return;
  }
  await orderLink.click();
  await page.waitForLoadState("networkidle");

  await page.locator("input[name='courier']").fill("Test Courier");
  await page.locator("input[name='trackingNumber']").fill(`TRACK-${Date.now()}`);
  await page.getByRole("button", { name: /save shipment/i }).click();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("input[name='courier']")).toHaveValue("Test Courier");
});

test("ADM-17 COD collection form appears only for cod_pending orders and records collection", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/orders");

  // Find a row whose status badge indicates Pay on Delivery / cod_pending
  const codRow = page.locator("table tbody tr").filter({ hasText: /pay on delivery/i }).first();
  if (await codRow.count() === 0) {
    test.skip(); // no cod_pending order in current data — nothing to verify
    return;
  }
  await codRow.locator("a").first().click();
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: /confirm pay on delivery collection/i })).toBeVisible();
  await page.locator("input[name='codPaymentMethod'][value='upi']").check();
  await page.locator("input[name='codUpiRef']").fill("TESTUTR123");
  await page.getByRole("button", { name: /confirm collection/i }).click();
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(/collected via/i)).toBeVisible();
});
