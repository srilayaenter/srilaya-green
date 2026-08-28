/**
 * ORDER VERIFICATION SUITE — /orders/[id] identity verification
 * Covers the fix for the route-protection audit's confirmed issue:
 * /orders/[id] previously exposed full order details (including shipment
 * tracking) to anyone who knew or guessed a valid order ID, with no
 * identity check. This suite verifies the fix's hard requirements:
 * anti-enumeration, no pre-verification tracking exposure, exact field-set
 * parity with /api/track, and rate limiting — plus /track and admin-route
 * regression checks.
 */
import { test, expect, type Page } from "@playwright/test";

const TEST_EMAIL = `orders-verify-${Date.now()}@example.com`;
const TEST_PHONE = "9812345670";

let orderId: string;

test.beforeAll(async ({ browser }) => {
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const context = await browser.newContext({
    extraHTTPHeaders: bypassSecret ? { "x-vercel-protection-bypass": bypassSecret } : undefined,
  });
  const page = await context.newPage();
  orderId = await placeTestOrder(page);
  await context.close();
});

/** Places a real COD order via the checkout UI and returns its order ID. */
async function placeTestOrder(page: Page): Promise<string> {
  await page.goto("/product", { waitUntil: "networkidle" });
  const firstLink = page.locator("a[href^='/product/']").first();
  await firstLink.waitFor({ state: "visible" });
  await firstLink.click();
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /add to cart/i }).click();
  await expect(page.getByText("Added!")).toBeVisible({ timeout: 15000 });

  await page.goto("/checkout", { waitUntil: "networkidle" });

  await page.locator("input[name='name']").fill("Order Verify Test");
  await page.locator("input[name='email']").fill(TEST_EMAIL);
  await page.locator("input[name='phone']").fill(TEST_PHONE);
  await page.locator("[name='address']").fill("123 Verification Street");
  await page.locator("input[name='city']").fill("Bangalore");
  await page.locator("input[name='state']").fill("Karnataka");
  await page.locator("input[name='zipCode']").fill("560001");

  await page.getByRole("radio", { name: /pay on delivery/i }).check();

  const placeOrderBtn = page.getByRole("button", { name: /place order/i });
  await placeOrderBtn.click();
  // Server Action -> client-side navigation doesn't reliably fire a "load"
  // event, so wait on rendered content rather than page.waitForURL.
  await expect(page.getByRole("heading", { name: /order confirmed/i })).toBeVisible({ timeout: 15000 });

  const match = page.url().match(/\/checkout\/confirm\/([^/?]+)/);
  if (!match) throw new Error("Could not extract order ID from confirmation URL: " + page.url());
  return match[1];
}

test("ORD-01 missing identity is rejected", async ({ request }) => {
  const res = await request.post(`/api/orders/${orderId}/verify`, { data: {} });
  const body = await res.json();
  expect(body.id).toBeUndefined();
  expect(body.error).toBeTruthy();
});

test("ORD-02 wrong email is rejected", async ({ request }) => {
  const res = await request.post(`/api/orders/${orderId}/verify`, { data: { email: "wrong@example.com" } });
  const body = await res.json();
  expect(body.id).toBeUndefined();
  expect(body.error).toBeTruthy();
});

test("ORD-03 wrong phone is rejected", async ({ request }) => {
  const res = await request.post(`/api/orders/${orderId}/verify`, { data: { phone: "0000000000" } });
  const body = await res.json();
  expect(body.id).toBeUndefined();
  expect(body.error).toBeTruthy();
});

test("ORD-04 valid email is accepted", async ({ request }) => {
  const res = await request.post(`/api/orders/${orderId}/verify`, { data: { email: TEST_EMAIL } });
  const body = await res.json();
  expect(body.id).toBe(orderId);
});

test("ORD-05 valid phone is accepted", async ({ request }) => {
  const res = await request.post(`/api/orders/${orderId}/verify`, { data: { phone: TEST_PHONE } });
  const body = await res.json();
  expect(body.id).toBe(orderId);
});

test("ORD-06 anti-enumeration: nonexistent order and wrong identity are indistinguishable", async ({ request }) => {
  const wrongIdentityRes = await request.post(`/api/orders/${orderId}/verify`, { data: { email: "nope@example.com" } });
  const nonexistentRes = await request.post(`/api/orders/does-not-exist-12345/verify`, { data: { email: "nope@example.com" } });

  expect(nonexistentRes.status()).toBe(wrongIdentityRes.status());

  const [wrongIdentityBody, nonexistentBody] = await Promise.all([wrongIdentityRes.json(), nonexistentRes.json()]);
  expect(nonexistentBody).toEqual(wrongIdentityBody);
});

test("ORD-07 page renders no tracking/shipment data before verification", async ({ page }) => {
  await page.goto(`/orders/${orderId}`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /verify your order/i })).toBeVisible();
  // Scoped to <main> — the global header has an unrelated "Track Order" nav
  // link on every page, which would otherwise false-positive this check.
  const mainHtml = await page.locator("main").innerHTML();
  expect(mainHtml).not.toContain(TEST_EMAIL);
  expect(mainHtml.toLowerCase()).not.toContain("courier");
  expect(mainHtml.toLowerCase()).not.toContain("shipment");
});

test("ORD-08 verified response contains exactly the approved field set", async ({ request }) => {
  const res = await request.post(`/api/orders/${orderId}/verify`, { data: { email: TEST_EMAIL } });
  const body = await res.json();
  const expectedKeys = [
    "id", "shortId", "customerName", "status", "fulfillmentStatus", "paymentMethod",
    "subtotal", "taxTotal", "shippingFee", "total", "createdAt",
    "address", "city", "state", "zipCode", "items", "shipment",
  ].sort();
  expect(Object.keys(body).sort()).toEqual(expectedKeys);
});

test("ORD-09 repeated failed attempts are rate-limited", async ({ request }) => {
  let sawRateLimit = false;
  for (let i = 0; i < 12; i++) {
    const res = await request.post(`/api/orders/${orderId}/verify`, { data: { email: `attempt-${i}@example.com` } });
    if (res.status() === 429) {
      sawRateLimit = true;
      break;
    }
  }
  expect(sawRateLimit).toBe(true);
});

test("ORD-09b failed attempts never echo the submitted email/phone back in the response", async ({ request }) => {
  // Closest practical proxy for "no raw logging" reachable from Playwright
  // E2E — this suite has no access to server-side log output. The route's
  // console.warn calls (order ID + IP only, never the raw value) were
  // verified by direct code review; this test guards the response contract.
  const attemptedEmail = "should-never-appear@example.com";
  const res = await request.post(`/api/orders/${orderId}/verify`, { data: { email: attemptedEmail } });
  const text = await res.text();
  expect(text).not.toContain(attemptedEmail);
});

test("ORD-10 /track regression — existing lookup flow is unaffected", async ({ page }) => {
  await page.goto("/track", { waitUntil: "networkidle" });
  await expect(page.locator("input").first()).toBeVisible();
});

test("ORD-11 admin-route protection regression — unaffected by this change", async ({ browser }) => {
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const context = await browser.newContext({
    storageState: undefined,
    extraHTTPHeaders: bypassSecret ? { "x-vercel-protection-bypass": bypassSecret } : undefined,
  });
  const page = await context.newPage();
  await page.goto("/admin/products");
  await expect(page).toHaveURL(/\/(admin\/login|api\/auth\/signin)/);
  await context.close();
});
