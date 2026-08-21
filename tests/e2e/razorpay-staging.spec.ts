/**
 * RAZORPAY STAGING LIFECYCLE SUITE
 *
 * Coverage level: server-side real-signature integration coverage with a
 * documented hosted-UI limitation — NOT full browser payment E2E.
 *
 * The order is created for real through the application (browser-driven
 * checkout form → createOrder server action), and the Razorpay order is
 * created for real through the app's own /api/payments/razorpay/order
 * endpoint (a genuine call to Razorpay's test-mode Orders API). From there,
 * completing a payment requires interacting with Razorpay's *hosted* Checkout
 * widget (an iframe served from checkout.razorpay.com, gated behind card/UPI
 * entry and, for cards, an OTP step) — that step is not reliably automatable
 * in a headless CI browser and is not attempted here. Instead, this suite
 * exercises the app's verify/webhook handlers with payloads it signs itself
 * using the *real* configured secrets (RAZORPAY_KEY_SECRET,
 * RAZORPAY_WEBHOOK_SECRET — the same ones the deployed app reads from its own
 * Vercel Preview env), exactly matching the signing scheme
 * app/api/payments/razorpay/verify/route.ts and .../webhook/route.ts expect.
 * No signature check is bypassed or mocked; the payment_id and event payload
 * are synthetic (there is no real captured payment behind them), which is
 * exactly the gap this file documents rather than hides.
 *
 * Fixtures are a dedicated throwaway product/variant per test (see
 * release-stale-orders.spec.ts for the precedent) — never the shared
 * catalog — so this suite can't interfere with parallel tests or pollute
 * "first product" assumptions elsewhere.
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

test.describe.configure({ mode: "serial" });

const prisma = new PrismaClient();
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

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

function verifySignatureFor(razorpayOrderId: string, paymentId: string) {
  return crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(`${razorpayOrderId}|${paymentId}`).digest("hex");
}

function webhookSignatureFor(rawBody: string) {
  return crypto.createHmac("sha256", RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
}

async function makeSyntheticCatalog(stamp: string, stock = 20) {
  const category = await prisma.category.findFirst();
  if (!category) throw new Error("No category exists to attach the test product to");

  const product = await prisma.product.create({
    data: {
      title: `Razorpay Staging Test Product ${stamp}`,
      slug: `razorpay-staging-test-${stamp}`,
      sku: `RZPST-${stamp}`,
      gstRate: "18",
      categoryId: category.id,
      active: true,
    },
  });

  const variant = await prisma.productVariant.create({
    data: { productId: product.id, size: "test", sku: `RZPST-${stamp}-V`, price: "500", stock },
  });

  return { productId: product.id, productSlug: product.slug, variantId: variant.id, startingStock: stock };
}

async function cleanup(orderId: string | undefined, productId: string, eventIds: string[]) {
  if (orderId) await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
  await prisma.product.delete({ where: { id: productId } }).catch(() => {});
  if (eventIds.length) await prisma.webhookEvent.deleteMany({ where: { eventId: { in: eventIds } } }).catch(() => {});
}

/** Drives the real checkout form for a single synthetic product, selecting "Pay Online" (the
 * default), and returns the dbOrderId minted by the real createOrder server action. */
async function createRealOnlineOrder(page: import("@playwright/test").Page, productSlug: string) {
  await page.goto(`/product/${productSlug}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /add to cart/i }).click();
  await expect(page.getByText("Added!")).toBeVisible({ timeout: 15000 });

  await page.goto("/checkout", { waitUntil: "networkidle" });

  const stamp = Date.now();
  await page.locator("input[name='name'], input[placeholder*='name' i]").first().fill(`RZP Test ${stamp}`);
  await page.locator("input[type='email'], input[name='email']").first().fill(`rzp-staging-test-${stamp}@example.invalid`);
  await page.locator("input[type='tel'], input[name='phone']").first().fill("9999999999");
  await page.locator("input[name='address'], textarea[name='address'], input[placeholder*='address' i]").first().fill("123 Staging Test Street");
  await page.locator("input[name='city'], input[placeholder*='city' i]").first().fill("Bangalore");
  await page.locator("input[name='pincode'], input[placeholder*='pincode' i]").first().fill("560001");
  const stateInput = page.locator("input[name='state'], select[name='state'], input[placeholder*='state' i]").first();
  if (await stateInput.isVisible()) {
    const tag = await stateInput.evaluate((el) => el.tagName.toLowerCase());
    if (tag === "select") await stateInput.selectOption({ index: 1 });
    else await stateInput.fill("Karnataka");
  }

  // "Pay Online" is the form's default selection — no radio click needed.
  const continueBtn = page.getByRole("button", { name: /continue to payment|pay/i });
  await continueBtn.click();
  await page.waitForURL(/\/checkout\/pay\//, { timeout: 15000 });

  const match = page.url().match(/\/checkout\/pay\/([^/?#]+)/);
  if (!match) throw new Error(`Expected to land on /checkout/pay/<id>, got ${page.url()}`);
  return match[1];
}

test("RZP-01 real order + real Razorpay order creation + genuinely signed verify reaches paid, stock decremented exactly once", async ({ page }) => {
  test.skip(!RAZORPAY_KEY_SECRET || !RAZORPAY_WEBHOOK_SECRET, "RAZORPAY_KEY_SECRET/RAZORPAY_WEBHOOK_SECRET not available to the test runner");

  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { productId, productSlug, variantId, startingStock } = await makeSyntheticCatalog(stamp);
  let orderId: string | undefined;
  const eventIds: string[] = [];

  try {
    orderId = await createRealOnlineOrder(page, productSlug);

    const dbOrderAfterCreate = await prisma.order.findUnique({ where: { id: orderId } });
    expect(dbOrderAfterCreate?.status).toBe("pending");
    const variantAfterCreate = await prisma.productVariant.findUnique({ where: { id: variantId } });
    expect(variantAfterCreate?.stock).toBe(startingStock - 1); // decremented at order-creation time

    // Real call to the app's own endpoint — this genuinely hits Razorpay's test-mode Orders API.
    const orderRes = await page.request.post("/api/payments/razorpay/order", { data: { dbOrderId: orderId } });
    expect(orderRes.status()).toBe(200);
    const orderData = await orderRes.json();
    expect(orderData.success).toBe(true);
    expect(typeof orderData.orderId).toBe("string");
    expect(orderData.orderId.startsWith("order_")).toBe(true); // genuine Razorpay order id format

    // --- Unautomated step: the hosted Razorpay Checkout widget (card/UPI entry + OTP) is not
    // driven here. See file header. From this point the payment_id is synthetic.
    const syntheticPaymentId = `pay_staging_test_${stamp}`;
    const signature = verifySignatureFor(orderData.orderId, syntheticPaymentId);

    const verifyRes = await page.request.post("/api/payments/razorpay/verify", {
      data: {
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: syntheticPaymentId,
        razorpay_signature: signature,
        dbOrderId: orderId,
      },
    });
    expect(verifyRes.status()).toBe(200);
    const verifyData = await verifyRes.json();
    expect(verifyData.success).toBe(true);

    const paidOrder = await prisma.order.findUnique({ where: { id: orderId } });
    expect(paidOrder?.status).toBe("paid");
    expect(paidOrder?.paymentId).toBe(syntheticPaymentId);

    // Genuinely signed webhook, using the real webhook secret — captured event.
    const eventId = `evt_staging_test_${stamp}`;
    eventIds.push(eventId);
    const webhookBody = JSON.stringify({
      id: eventId,
      event: "payment.captured",
      payload: { payment: { entity: { id: syntheticPaymentId, order_id: orderData.orderId } } },
    });
    const webhookSig = webhookSignatureFor(webhookBody);

    const webhookRes = await page.request.post("/api/payments/razorpay/webhook", {
      headers: { "content-type": "application/json", "x-razorpay-signature": webhookSig },
      data: webhookBody,
    });
    expect(webhookRes.status()).toBe(200);

    // Duplicate delivery — must be idempotent (no double effect, no error).
    const dupRes = await page.request.post("/api/payments/razorpay/webhook", {
      headers: { "content-type": "application/json", "x-razorpay-signature": webhookSig },
      data: webhookBody,
    });
    expect(dupRes.status()).toBe(200);
    const dupBody = await dupRes.json();
    expect(dupBody.message).toBe("Already processed");

    const webhookEventRows = await prisma.webhookEvent.findMany({ where: { eventId } });
    expect(webhookEventRows.length).toBe(1); // idempotency key stored exactly once

    const finalOrder = await prisma.order.findUnique({ where: { id: orderId } });
    expect(finalOrder?.status).toBe("paid"); // captured webhook doesn't disturb the already-paid state

    const finalVariant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    expect(finalVariant?.stock).toBe(startingStock - 1); // never decremented again by verify or webhook

    // Cart clearing: the app clears cart at order-creation time (not deferred to payment success,
    // unlike the sibling Naturals project) — confirm that already-established behavior held.
    const cartRes = await page.request.get("/api/cart");
    expect(cartRes.ok()).toBe(true);
    const cart = await cartRes.json();
    const items = cart.items ?? cart.cartItems ?? [];
    expect(Array.isArray(items) ? items.length : 0).toBe(0);
  } finally {
    await cleanup(orderId, productId, eventIds);
  }
});

test("RZP-02 payment dismissal/abandonment leaves order pending and stock reserved, untouched by verify/webhook", async ({ page }) => {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { productId, productSlug, variantId, startingStock } = await makeSyntheticCatalog(stamp);
  let orderId: string | undefined;

  try {
    orderId = await createRealOnlineOrder(page, productSlug);
    // Simulates the user closing the Razorpay modal (PayButton's ondismiss handler) — no
    // verify/webhook call is ever made. The order should sit exactly where REL-01/REL-02
    // (release-stale-orders) expect a genuinely abandoned online order to sit.
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.status).toBe("pending");
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    expect(variant?.stock).toBe(startingStock - 1); // reserved, recoverable by the release-stock cron
  } finally {
    await cleanup(orderId, productId, []);
  }
});

test("RZP-03 payment.failed webhook marks order failed and restores stock exactly once, even on duplicate delivery", async ({ page }) => {
  test.skip(!RAZORPAY_WEBHOOK_SECRET, "RAZORPAY_WEBHOOK_SECRET not available to the test runner");

  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { productId, productSlug, variantId, startingStock } = await makeSyntheticCatalog(stamp);
  let orderId: string | undefined;
  const eventIds: string[] = [];

  try {
    orderId = await createRealOnlineOrder(page, productSlug);

    const razorpayOrderId = `order_staging_test_${stamp}`;
    await prisma.order.update({ where: { id: orderId }, data: { paymentId: razorpayOrderId } });

    const paymentId = `pay_staging_failed_${stamp}`;
    const eventId = `evt_staging_failed_${stamp}`;
    eventIds.push(eventId);
    const webhookBody = JSON.stringify({
      id: eventId,
      event: "payment.failed",
      payload: {
        payment: { entity: { id: paymentId, order_id: razorpayOrderId, error_reason: "staging_test_synthetic_failure" } },
      },
    });
    const webhookSig = webhookSignatureFor(webhookBody);

    const webhookRes = await page.request.post("/api/payments/razorpay/webhook", {
      headers: { "content-type": "application/json", "x-razorpay-signature": webhookSig },
      data: webhookBody,
    });
    expect(webhookRes.status()).toBe(200);

    const failedOrder = await prisma.order.findUnique({ where: { id: orderId } });
    expect(failedOrder?.status).toBe("failed");
    const restoredVariant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    expect(restoredVariant?.stock).toBe(startingStock); // fully restored — released exactly once

    // Duplicate delivery of the same failure event must not release stock a second time.
    const dupRes = await page.request.post("/api/payments/razorpay/webhook", {
      headers: { "content-type": "application/json", "x-razorpay-signature": webhookSig },
      data: webhookBody,
    });
    expect(dupRes.status()).toBe(200);

    const finalVariant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    expect(finalVariant?.stock).toBe(startingStock); // unchanged by the duplicate
  } finally {
    await cleanup(orderId, productId, eventIds);
  }
});

test("RZP-04 invalid verification signature is rejected and the order is not marked paid", async ({ page }) => {
  test.skip(!RAZORPAY_KEY_SECRET, "RAZORPAY_KEY_SECRET not available to the test runner");

  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { productId, productSlug, variantId, startingStock } = await makeSyntheticCatalog(stamp);
  let orderId: string | undefined;

  try {
    orderId = await createRealOnlineOrder(page, productSlug);

    const orderRes = await page.request.post("/api/payments/razorpay/order", { data: { dbOrderId: orderId } });
    expect(orderRes.status()).toBe(200);
    const orderData = await orderRes.json();

    const verifyRes = await page.request.post("/api/payments/razorpay/verify", {
      data: {
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: `pay_staging_invalid_${stamp}`,
        razorpay_signature: "0".repeat(64), // well-formed hex, deliberately wrong
        dbOrderId: orderId,
      },
    });
    expect(verifyRes.status()).toBe(400);
    const body = await verifyRes.json();
    expect(body.error).toMatch(/invalid.*signature/i);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.status).toBe("pending"); // rejected — never flipped to paid
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    expect(variant?.stock).toBe(startingStock - 1); // unchanged by the rejected attempt
  } finally {
    await cleanup(orderId, productId, []);
  }
});
