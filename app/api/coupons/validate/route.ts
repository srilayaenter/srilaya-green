import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { toNum } from "@/lib/decimal";

export async function POST(req: NextRequest) {
  const { code, orderTotal } = await req.json();

  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: "Invalid or expired coupon code." }, { status: 404 });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "This coupon has expired." }, { status: 410 });
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 410 });
  }

  const minOrder = coupon.minOrder ? toNum(coupon.minOrder) : 0;
  if (orderTotal < minOrder) {
    return NextResponse.json({ error: `Minimum order of ₹${minOrder.toFixed(0)} required.` }, { status: 422 });
  }

  const value = toNum(coupon.value);
  const discount = coupon.type === "percent"
    ? Math.min((orderTotal * value) / 100, orderTotal)
    : Math.min(value, orderTotal);

  return NextResponse.json({
    code: coupon.code,
    type: coupon.type,
    value,
    discount: parseFloat(discount.toFixed(2)),
    message: coupon.type === "percent" ? `${value}% off applied!` : `₹${value} off applied!`,
  });
}
