import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function approveReview(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.review.update({ where: { id }, data: { approved: true } });
  revalidatePath("/admin/reviews");
}

async function rejectReview(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
}

export default async function AdminReviewsPage() {
  const [pending, approved] = await Promise.all([
    prisma.review.findMany({ where: { approved: false }, include: { product: { select: { title: true, slug: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.review.findMany({ where: { approved: true }, include: { product: { select: { title: true, slug: true } } }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  function Stars({ rating }: { rating: number }) {
    return <span className="text-amber-400 text-sm">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>;
  }

  function ReviewRow({ r, showActions }: { r: (typeof pending)[0]; showActions: boolean }) {
    return (
      <div className="flex items-start gap-4 py-4 border-b border-[#F0F0F0] last:border-0">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Stars rating={r.rating} />
            <span className="font-bold text-sm text-[#212121]">{r.name}</span>
            <span className="text-xs text-[#9E9E9E]">{r.email}</span>
            <span className="text-xs text-[#BDBDBD]">·</span>
            <span className="text-xs text-[#9E9E9E]">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mb-1">{r.product.title}</p>
          {r.title && <p className="text-sm font-semibold text-[#424242]">{r.title}</p>}
          <p className="text-sm text-[#616161]">{r.body}</p>
        </div>
        {showActions && (
          <div className="flex gap-2 shrink-0">
            <form action={approveReview}>
              <input type="hidden" name="id" value={r.id} />
              <button className="bg-[#006A38] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#00522B] transition-colors">Approve</button>
            </form>
            <form action={rejectReview}>
              <input type="hidden" name="id" value={r.id} />
              <button className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">Delete</button>
            </form>
          </div>
        )}
        {!showActions && (
          <form action={rejectReview}>
            <input type="hidden" name="id" value={r.id} />
            <button className="text-red-500 text-xs font-bold hover:underline shrink-0">Delete</button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-[#212121]">Reviews</h1>

      <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
        <h2 className="text-sm font-bold text-[#212121] mb-1">
          Pending Approval
          {pending.length > 0 && (
            <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-[#9E9E9E] mt-3">No reviews pending.</p>
        ) : (
          <div className="mt-3">
            {pending.map((r) => <ReviewRow key={r.id} r={r} showActions={true} />)}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
        <h2 className="text-sm font-bold text-[#212121] mb-3">Published Reviews (last 50)</h2>
        {approved.length === 0 ? (
          <p className="text-sm text-[#9E9E9E]">No published reviews yet.</p>
        ) : (
          <div>
            {approved.map((r) => <ReviewRow key={r.id} r={r} showActions={false} />)}
          </div>
        )}
      </div>
    </div>
  );
}
