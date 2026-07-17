import { prisma } from "@/lib/db";
import { toNum } from "@/lib/decimal";
import Link from "next/link";
import { revalidatePath } from "next/cache";

async function toggleActive(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const product = await prisma.product.findUnique({ where: { id }, select: { active: true } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { active: !product.active } });
  revalidatePath("/admin/products");
}

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Products</h1>
          <p className="text-sm text-[#8D6E63] mt-1">Manage your bioenzyme product catalog and stock levels.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#006A38] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00522B] transition-colors"
        >
          + Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
            <tr className="text-[11px] font-bold uppercase text-[#9E9E9E] tracking-wider">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Variants</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F5]">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <div className="font-bold text-[#212121]">{product.title}</div>
                  <div className={`text-[10px] uppercase font-bold mt-1 ${product.active ? "text-[#4CAF50]" : "text-[#F44336]"}`}>
                    {product.active ? "● Active" : "● Inactive"}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#424242]">{product.category?.name || "—"}</td>
                <td className="px-6 py-4">
                  {product.variants.map((v) => (
                    <div key={v.id} className="flex items-center gap-4 text-xs py-1">
                      <span className="font-mono text-[#8D6E63] w-14">{v.size}</span>
                      <span className="font-bold text-[#006A38] w-16">₹{toNum(v.price).toFixed(2)}</span>
                      <span className="px-2 py-0.5 rounded border bg-[#F5F5F5] text-[#424242] border-[#E0E0E0]">{v.stock} in stock</span>
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                  <Link href={`/admin/products/${product.id}`} className="text-[#006A38] font-bold hover:underline text-sm">
                    Edit
                  </Link>
                  <form action={toggleActive} className="inline">
                    <input type="hidden" name="id" value={product.id} />
                    <button type="submit" className="text-[#616161] font-bold hover:underline text-sm">
                      {product.active ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[#9E9E9E]">No products yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
