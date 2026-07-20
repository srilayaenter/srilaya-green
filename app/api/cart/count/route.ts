import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET() {
  const cartId = (await cookies()).get("cartId")?.value;
  if (!cartId) return NextResponse.json({ count: 0 });

  const items = await prisma.cartItem.findMany({ where: { cartId }, select: { quantity: true } });
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return NextResponse.json({ count });
}
