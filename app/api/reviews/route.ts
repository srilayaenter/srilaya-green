import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { productId, name, email, rating, title, body } = await req.json();

  if (!productId || !name || !email || !rating || !body) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  await prisma.review.create({
    data: { productId, name: name.trim(), email: email.trim().toLowerCase(), rating, title: title?.trim() || null, body: body.trim() },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
