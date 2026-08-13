import { PrismaClient } from "@prisma/client";

// Best-effort test-data cleanup for admin tests that create real rows
// (ADM-08 creates a product, ADM-11 adds a variant). Without this, repeated
// local runs accumulate stray products/variants that pollute "first product"
// assumptions in customer-facing tests (e.g. CART-02).
//
// PrismaClient's constructor auto-loads .env from cwd as a side effect —
// process.env.DATABASE_URL isn't populated until *after* instantiation, so
// this must instantiate unconditionally rather than gate on it upfront.
// DATABASE_URL isn't set in the CI job's "Run E2E tests" step today, so
// queries just fail (caught below) and no-op there rather than failing
// the test — cleanup is a nice-to-have, not a correctness requirement.
const prisma = new PrismaClient();

export async function deleteTestProduct(slug: string) {
  try {
    await prisma.product.delete({ where: { slug } });
  } catch {
    // already gone, or DB unreachable — fine either way for a cleanup step
  }
}

export async function deleteTestVariant(sku: string) {
  try {
    await prisma.productVariant.delete({ where: { sku } });
  } catch {
    // already gone, or DB unreachable — fine either way for a cleanup step
  }
}
