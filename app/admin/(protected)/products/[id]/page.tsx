import { prisma } from "@/lib/db";
import { toNum } from "@/lib/decimal";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

async function updateProduct(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.product.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      gstRate: parseFloat(formData.get("gstRate") as string),
      imageUrl: (formData.get("imageUrl") as string) || null,
      categoryId: formData.get("categoryId") as string,
    },
  });
  revalidatePath(`/admin/products/${id}`);
}

async function updateVariant(formData: FormData) {
  "use server";
  const id = formData.get("variantId") as string;
  const productId = formData.get("productId") as string;
  await prisma.productVariant.update({
    where: { id },
    data: {
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string, 10),
    },
  });
  revalidatePath(`/admin/products/${productId}`);
}

async function addVariant(formData: FormData) {
  "use server";
  const productId = formData.get("productId") as string;
  await prisma.productVariant.create({
    data: {
      productId,
      size: formData.get("size") as string,
      sku: formData.get("sku") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string, 10),
      weightGrams: parseInt(formData.get("weightGrams") as string, 10) || 500,
    },
  });
  revalidatePath(`/admin/products/${productId}`);
}

async function deleteVariant(formData: FormData) {
  "use server";
  const id = formData.get("variantId") as string;
  const productId = formData.get("productId") as string;
  await prisma.productVariant.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id }, include: { variants: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-[#212121]">Edit Product</h1>

      <form action={updateProduct} className="bg-white rounded-xl border border-[#E0E0E0] p-6 space-y-4">
        <input type="hidden" name="id" value={product.id} />
        <div>
          <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Title</label>
          <input name="title" defaultValue={product.title} required className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Description</label>
          <textarea name="description" defaultValue={product.description ?? ""} rows={3} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">GST Rate (%)</label>
            <input name="gstRate" type="number" step="0.01" defaultValue={toNum(product.gstRate)} required className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Category</label>
            <select name="categoryId" defaultValue={product.categoryId} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Image URL</label>
          <input name="imageUrl" defaultValue={product.imageUrl ?? ""} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-[#006A38] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#00522B] transition-colors">
          Save Changes
        </button>
      </form>

      <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
        <h2 className="text-sm font-bold text-[#212121] mb-4">Variants</h2>
        <div className="space-y-3">
          {product.variants.map((v) => (
            <form key={v.id} action={updateVariant} className="flex items-center gap-3 border border-[#E0E0E0] rounded-lg p-3">
              <input type="hidden" name="variantId" value={v.id} />
              <input type="hidden" name="productId" value={product.id} />
              <span className="font-mono text-sm text-[#8D6E63] w-16">{v.size}</span>
              <span className="text-xs text-[#9E9E9E]">SKU: {v.sku}</span>
              <label className="text-xs text-[#757575] ml-auto">Price ₹</label>
              <input name="price" type="number" step="0.01" defaultValue={toNum(v.price)} className="w-24 border border-[#E0E0E0] rounded px-2 py-1 text-sm" />
              <label className="text-xs text-[#757575]">Stock</label>
              <input name="stock" type="number" defaultValue={v.stock} className="w-20 border border-[#E0E0E0] rounded px-2 py-1 text-sm" />
              <button type="submit" className="text-[#006A38] font-bold text-xs hover:underline">Save</button>
              <button formAction={deleteVariant} className="text-red-600 font-bold text-xs hover:underline">Delete</button>
            </form>
          ))}
        </div>

        <form action={addVariant} className="flex items-end gap-3 mt-4 pt-4 border-t border-[#F0F0F0] flex-wrap">
          <input type="hidden" name="productId" value={product.id} />
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Size</label>
            <input name="size" required placeholder="1L" className="w-24 border border-[#E0E0E0] rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">SKU</label>
            <input name="sku" required className="w-32 border border-[#E0E0E0] rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Price</label>
            <input name="price" type="number" step="0.01" required className="w-24 border border-[#E0E0E0] rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Stock</label>
            <input name="stock" type="number" required defaultValue={100} className="w-20 border border-[#E0E0E0] rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Weight (g)</label>
            <input name="weightGrams" type="number" defaultValue={500} className="w-24 border border-[#E0E0E0] rounded px-2 py-1.5 text-sm" />
          </div>
          <button type="submit" className="bg-[#F5F5F5] border border-[#E0E0E0] px-4 py-2 rounded-lg text-sm font-bold text-[#424242] hover:bg-emerald-50">
            + Add Variant
          </button>
        </form>
      </div>
    </div>
  );
}
