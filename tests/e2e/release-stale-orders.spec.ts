/**
 * RELEASE-STALE-ORDERS SUITE — /api/cron/release-stale-pending-orders
 * Covers the fix for the confirmed launch-critical bug: Razorpay-pending
 * orders that are abandoned never released their reserved stock, because no
 * cleanup mechanism existed. Fixtures are a dedicated throwaway
 * product/variant per test — never the shared catalog — to avoid the
 * cross-test pollution this project hit earlier with shared "first product"
 * assumptions.
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// The endpoint under test intentionally scans ALL stale pending orders, not
// just one fixture's — so under the default fullyParallel config, one test's
// authorized cron call can legitimately sweep up another test's freshly
// created stale order before it gets to assert. Serial mode avoids that
// cross-test race; it is not masking a bug in the endpoint itself.
test.describe.configure({ mode: "serial" });

const prisma = new PrismaClient();
const CRON_SECRET = process.env.CRON_SECRET || "";
const CRON_PATH = "/api/cron/release-stale-pending-orders";

async function makeTestOrder(opts: { status: string; ageMinutes: number; stock?: number }) {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const category = await prisma.category.findFirst();
  if (!category) throw new Error("No category exists to attach the test product to");

  const product = await prisma.product.create({
    data: {
      title: `Release-Stock Test Product ${stamp}`,
      slug: `release-stock-test-${stamp}`,
      sku: `RST-${stamp}`,
      gstRate: "18",
      categoryId: category.id,
      active: true,
    },
  });

  const startingStock = opts.stock ?? 10;
  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      size: "test",
      sku: `RST-${stamp}-V`,
      price: "100",
      stock: startingStock,
    },
  });

  const createdAt = new Date(Date.now() - opts.ageMinutes * 60 * 1000);
  const order = await prisma.order.create({
    data: {
      subtotal: "100",
      taxTotal: "18",
      shippingFee: "0",
      total: "118",
      status: opts.status,
      paymentMethod: "razorpay",
      createdAt,
    },
  });
  await prisma.orderItem.create({
    data: { orderId: order.id, variantId: variant.id, quantity: 1, price: "100", gstRate: "18" },
  });

  return { orderId: order.id, variantId: variant.id, productId: product.id, startingStock };
}

async function cleanup(orderId: string, productId: string) {
  await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
  await prisma.product.delete({ where: { id: productId } }).catch(() => {});
}

test("REL-01 stale pending order is released and stock is restored", async ({ request }) => {
  const { orderId, variantId, productId, startingStock } = await makeTestOrder({ status: "pending", ageMinutes: 60 });
  try {
    const res = await request.get(CRON_PATH, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.expired).toBeGreaterThanOrEqual(1);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.status).toBe("failed");
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    expect(variant?.stock).toBe(startingStock + 1);
  } finally {
    await cleanup(orderId, productId);
  }
});

test("REL-02 fresh pending order is left untouched", async ({ request }) => {
  const { orderId, variantId, productId, startingStock } = await makeTestOrder({ status: "pending", ageMinutes: 1 });
  try {
    const res = await request.get(CRON_PATH, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
    expect(res.status()).toBe(200);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.status).toBe("pending");
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    expect(variant?.stock).toBe(startingStock);
  } finally {
    await cleanup(orderId, productId);
  }
});

test("REL-03 stale non-pending order is left untouched", async ({ request }) => {
  const { orderId, variantId, productId, startingStock } = await makeTestOrder({ status: "paid", ageMinutes: 60 });
  try {
    const res = await request.get(CRON_PATH, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
    expect(res.status()).toBe(200);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.status).toBe("paid");
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    expect(variant?.stock).toBe(startingStock);
  } finally {
    await cleanup(orderId, productId);
  }
});

test("REL-04 a second cleanup pass never double-releases the same order", async ({ request }) => {
  const { orderId, variantId, productId, startingStock } = await makeTestOrder({ status: "pending", ageMinutes: 60 });
  try {
    const first = await request.get(CRON_PATH, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
    expect(first.status()).toBe(200);
    const afterFirst = await prisma.productVariant.findUnique({ where: { id: variantId } });
    expect(afterFirst?.stock).toBe(startingStock + 1);

    const second = await request.get(CRON_PATH, { headers: { Authorization: `Bearer ${CRON_SECRET}` } });
    expect(second.status()).toBe(200);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.status).toBe("failed");
    const afterSecond = await prisma.productVariant.findUnique({ where: { id: variantId } });
    expect(afterSecond?.stock).toBe(startingStock + 1);
  } finally {
    await cleanup(orderId, productId);
  }
});

test("REL-05 request without a valid secret is rejected and nothing changes", async ({ request }) => {
  const { orderId, variantId, productId, startingStock } = await makeTestOrder({ status: "pending", ageMinutes: 60 });
  try {
    const noAuth = await request.get(CRON_PATH);
    expect(noAuth.status()).toBe(401);

    const wrongAuth = await request.get(CRON_PATH, { headers: { Authorization: "Bearer wrong-secret" } });
    expect(wrongAuth.status()).toBe(401);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.status).toBe("pending");
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    expect(variant?.stock).toBe(startingStock);
  } finally {
    await cleanup(orderId, productId);
  }
});
