import { Resend } from "resend";
import { prisma } from "@/lib/db";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  context?: string;
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function attemptSend(params: SendEmailParams) {
  if (!resend) throw new Error("RESEND_API_KEY not configured");
  return resend.emails.send({
    from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

export async function sendEmail(params: SendEmailParams) {
  if (!resend) {
    console.error("[email skipped — no RESEND_API_KEY]", params.subject);
    await logFailure(params, "RESEND_API_KEY not configured");
    return { success: false };
  }

  const MAX = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX; attempt++) {
    try {
      await attemptSend(params);
      return { success: true };
    } catch (err: any) {
      lastError = err;
      console.error(`Email send attempt ${attempt}/${MAX} failed:`, err.message);
      if (attempt < MAX) await new Promise(r => setTimeout(r, attempt * 1500));
    }
  }

  await logFailure(params, lastError?.message ?? "Unknown error");
  return { success: false };
}

async function logFailure(params: SendEmailParams, errorMessage: string) {
  try {
    await prisma.failedEmail.create({
      data: { to: params.to, subject: params.subject, html: params.html, context: params.context ?? null, errorMessage },
    });
  } catch (err) {
    console.error("Failed to log email failure:", err);
  }
}
