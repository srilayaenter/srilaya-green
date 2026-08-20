import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// How long an online-payment order may sit in "pending" before its reserved
// stock is treated as abandoned and released. 30 minutes gives a genuine
// slow-paying customer room to finish, without holding real stock hostage
// against a Razorpay checkout the customer never returned to.
const STALE_THRESHOLD_MINUTES = 30;

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("[release-stale-pending-orders] CRON_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - STALE_THRESHOLD_MINUTES * 60 * 1000);
  const candidates = await prisma.order.findMany({
    where: { status: "pending", createdAt: { lt: cutoff } },
    select: { id: true },
  });

  let expired = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const { id } of candidates) {
    try {
      const released = await prisma.$transaction(async (tx) => {
        // Guarded update, not a separate read-then-write: the WHERE clause
        // re-checks status="pending" atomically at write time. If this order
        // was already moved off "pending" by a webhook or an overlapping
        // cron run, count is 0 and we skip it — the same order can never be
        // released twice, even under concurrent invocations.
        const result = await tx.order.updateMany({
          where: { id, status: "pending" },
          data: { status: "failed" },
        });
        if (result.count === 0) return false;

        const items = await tx.orderItem.findMany({ where: { orderId: id } });
        for (const item of items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
        return true;
      });

      if (released) expired++;
      else skipped++;
    } catch (err: any) {
      errors.push(`${id}: ${err.message}`);
    }
  }

  const summary = { scanned: candidates.length, expired, skipped, errors };
  console.log("[release-stale-pending-orders]", JSON.stringify(summary));
  return NextResponse.json(summary);
}
