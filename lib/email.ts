import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.log(`[email skipped — no RESEND_API_KEY] to=${opts.to} subject=${opts.subject}`);
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (err) {
    // v1 has no FailedEmail retry table — log and move on so checkout never blocks on email delivery.
    console.error("Failed to send email", { to: opts.to, subject: opts.subject, err });
  }
}
