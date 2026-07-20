import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function retryEmail(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const failed = await prisma.failedEmail.findUnique({ where: { id } });
  if (!failed) redirect("/admin/failed-emails");

  const result = await sendEmail({ to: failed.to, subject: failed.subject, html: failed.html, context: failed.context ?? undefined });

  await prisma.failedEmail.update({
    where: { id },
    data: { retriedAt: new Date(), ...(result.success ? { resolved: true } : {}) },
  });

  redirect("/admin/failed-emails");
}

export default async function FailedEmailsPage() {
  const emails = await prisma.failedEmail.findMany({
    where: { resolved: false },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#212121]">Failed Emails</h1>
        <span className="text-sm text-[#9E9E9E]">{emails.length} unresolved</span>
      </div>

      {emails.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-10 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-[#616161] font-medium">No failed emails. All good.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <div key={email.id} className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-[#212121] truncate">{email.subject}</p>
                  <p className="text-sm text-[#616161] mt-0.5">To: {email.to}</p>
                  {email.context && <p className="text-sm text-[#9E9E9E] mt-0.5">Context: {email.context}</p>}
                  <p className="text-sm text-red-600 mt-1.5">Error: {email.errorMessage}</p>
                  <p className="text-xs text-[#9E9E9E] mt-1">
                    Failed {new Date(email.createdAt).toLocaleString("en-IN")}
                    {email.retriedAt && ` · Last retry ${new Date(email.retriedAt).toLocaleString("en-IN")}`}
                  </p>
                </div>
                <form action={retryEmail} className="flex-shrink-0">
                  <input type="hidden" name="id" value={email.id} />
                  <button
                    type="submit"
                    className="bg-[#006A38] text-white px-4 py-2 rounded-lg hover:bg-[#00522B] text-sm font-bold transition-colors"
                  >
                    Retry
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
