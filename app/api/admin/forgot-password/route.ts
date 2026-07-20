import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://srilaya-green.com";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always return 200 to avoid leaking which emails are registered
  if (!user) return NextResponse.json({ ok: true });

  // Invalidate old tokens
  await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { email: user.email, token, expiresAt },
  });

  const resetUrl = `${BASE_URL}/admin/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "SriLaYa Green — Admin Password Reset",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#006A38;margin-bottom:16px">Password Reset</h2>
        <p style="color:#424242">You requested a password reset for your SriLaYa Green admin account.</p>
        <p style="margin:24px 0">
          <a href="${resetUrl}" style="background:#006A38;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
            Reset Password
          </a>
        </p>
        <p style="color:#757575;font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        <p style="color:#9E9E9E;font-size:12px;margin-top:24px">Or copy this URL: ${resetUrl}</p>
      </div>
    `,
    context: "admin_password_reset",
  });

  return NextResponse.json({ ok: true });
}
