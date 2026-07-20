import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

async function guard() {
  const session = await getServerSession(authOptions);
  return !!session?.user?.email;
}

export async function GET() {
  if (!await guard()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const returns = await prisma.return.findMany({
    include: {
      order: { select: { id: true, customerName: true, email: true, phone: true, total: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ returns });
}

export async function PATCH(request: Request) {
  if (!await guard()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { returnId, status, adminNote } = await request.json();

  const updated = await prisma.return.update({
    where: { id: returnId },
    data: { status, adminNote: adminNote ?? undefined },
    include: { order: true, items: true },
  });

  // Restock inventory when return is received
  if (status === "received") {
    await Promise.all(
      updated.items.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        })
      )
    );
  }

  // Notify customer by email
  const email = updated.order.email;
  if (email) {
    const label =
      status === "approved" ? "✅ Approved" :
      status === "rejected" ? "❌ Rejected" :
      status === "received" ? "📦 Received" : "💰 Refunded";
    const msg =
      status === "approved"
        ? "Your return has been approved. We will arrange pickup or provide refund instructions shortly."
        : status === "rejected"
        ? `Your return request was not approved. ${adminNote ? `Reason: ${adminNote}` : ""}`
        : status === "received"
        ? "We have received your returned items. Your refund will be processed shortly."
        : "Your refund has been processed. Please allow 5–7 business days for it to reflect.";

    sendEmail({
      to: email,
      subject: `Return ${label} — Order #${updated.order.id.slice(0, 8).toUpperCase()}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;">
        <h2 style="color:#006A38;">Return Request Update</h2>
        <p>Hi ${updated.order.customerName},</p>
        <p>${msg}</p>
        ${adminNote && status !== "rejected" ? `<p><em>${adminNote}</em></p>` : ""}
        <p>Order: <strong>#${updated.order.id.slice(0, 8).toUpperCase()}</strong></p>
        <p style="color:#9E9E9E;font-size:12px;">SriLaYa Green — Bioenzyme Cleaning & Garden Care</p>
      </div>`,
      context: `return_update:${returnId}`,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
