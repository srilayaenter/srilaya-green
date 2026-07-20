import { prisma } from "@/lib/db";
import { toNum } from "@/lib/decimal";
import { revalidatePath } from "next/cache";

async function createCoupon(formData: FormData) {
  "use server";
  const code = (formData.get("code") as string).trim().toUpperCase();
  const type = formData.get("type") as string;
  const value = parseFloat(formData.get("value") as string);
  const minOrder = parseFloat(formData.get("minOrder") as string) || null;
  const maxUses = parseInt(formData.get("maxUses") as string, 10) || null;
  const expiresRaw = formData.get("expiresAt") as string;

  await prisma.coupon.create({
    data: {
      code,
      type,
      value,
      minOrder: minOrder ?? undefined,
      maxUses: maxUses ?? undefined,
      expiresAt: expiresRaw ? new Date(expiresRaw) : undefined,
    },
  });
  revalidatePath("/admin/coupons");
}

async function toggleCoupon(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const current = formData.get("active") === "true";
  await prisma.coupon.update({ where: { id }, data: { active: !current } });
  revalidatePath("/admin/coupons");
}

async function deleteCoupon(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-[#212121]">Coupons</h1>

      {/* Create form */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
        <h2 className="text-sm font-bold text-[#212121] mb-4">New Coupon</h2>
        <form action={createCoupon} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Code *</label>
            <input name="code" required placeholder="SAVE10" className="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-sm w-32 uppercase" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Type</label>
            <select name="type" className="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-sm">
              <option value="percent">% Off</option>
              <option value="fixed">₹ Off</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Value *</label>
            <input name="value" type="number" step="0.01" min="0" required placeholder="10" className="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-sm w-24" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Min Order (₹)</label>
            <input name="minOrder" type="number" step="0.01" min="0" placeholder="500" className="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-sm w-28" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Max Uses</label>
            <input name="maxUses" type="number" min="1" placeholder="100" className="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-sm w-24" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Expires</label>
            <input name="expiresAt" type="date" className="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-sm" />
          </div>
          <button type="submit" className="bg-[#006A38] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#00522B] transition-colors">
            + Create
          </button>
        </form>
      </div>

      {/* Coupon list */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F9F9F9] border-b border-[#E0E0E0]">
            <tr>
              {["Code", "Type", "Value", "Min Order", "Uses", "Expires", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#757575] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {coupons.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-[#9E9E9E] text-sm">No coupons yet.</td></tr>
            )}
            {coupons.map((c) => {
              const expired = c.expiresAt && c.expiresAt < new Date();
              const exhausted = c.maxUses !== null && c.usedCount >= c.maxUses;
              const statusLabel = !c.active ? "Inactive" : expired ? "Expired" : exhausted ? "Exhausted" : "Active";
              const statusColor = statusLabel === "Active" ? "text-[#006A38] bg-emerald-50" : "text-[#9E9E9E] bg-[#F5F5F5]";
              return (
                <tr key={c.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3 font-mono font-bold text-[#212121]">{c.code}</td>
                  <td className="px-4 py-3 text-[#616161] capitalize">{c.type}</td>
                  <td className="px-4 py-3 font-bold text-[#212121]">{c.type === "percent" ? `${toNum(c.value)}%` : `₹${toNum(c.value)}`}</td>
                  <td className="px-4 py-3 text-[#757575]">{c.minOrder ? `₹${toNum(c.minOrder)}` : "—"}</td>
                  <td className="px-4 py-3 text-[#757575]">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td className="px-4 py-3 text-[#757575]">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <form action={toggleCoupon}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="active" value={c.active.toString()} />
                        <button className="text-xs font-bold text-[#006A38] hover:underline">{c.active ? "Disable" : "Enable"}</button>
                      </form>
                      <form action={deleteCoupon}>
                        <input type="hidden" name="id" value={c.id} />
                        <button className="text-xs font-bold text-red-500 hover:underline">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
