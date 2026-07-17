import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

async function createProduct(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string).trim().toLowerCase().replace(/\s+/g, "-");
  const description = (formData.get("description") as string) || undefined;
  const sku = formData.get("sku") as string;
  const gstRate = parseFloat(formData.get("gstRate") as string);
  const categoryId = formData.get("categoryId") as string;
  const imageUrl = (formData.get("imageUrl") as string) || `https://placehold.co/600x600/006837/FBB040?text=${encodeURIComponent(title)}`;

  const variantSize = formData.get("variantSize") as string;
  const variantPrice = parseFloat(formData.get("variantPrice") as string);
  const variantStock = parseInt(formData.get("variantStock") as string, 10);
  const variantSku = formData.get("variantSku") as string;
  const variantWeight = parseInt(formData.get("variantWeight") as string, 10) || 500;

  const product = await prisma.product.create({
    data: {
      title,
      slug,
      description,
      sku,
      gstRate,
      categoryId,
      imageUrl,
      variants: {
        create: {
          size: variantSize,
          price: variantPrice,
          stock: variantStock,
          sku: variantSku,
          weightGrams: variantWeight,
        },
      },
    },
  });

  redirect(`/admin/products/${product.id}`);
}

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#212121] mb-6">Add New Product</h1>

      <form action={createProduct} className="bg-white rounded-xl border border-[#E0E0E0] p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Title *</label>
          <input name="title" required className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Slug *</label>
          <input name="slug" required placeholder="e.g. lemongrass-floor-cleaner" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Description</label>
          <textarea name="description" rows={3} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">SKU *</label>
            <input name="sku" required className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">GST Rate (%) *</label>
            <input name="gstRate" type="number" step="0.01" defaultValue={18} required className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Category *</label>
          <select name="categoryId" required className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Image URL</label>
          <input name="imageUrl" placeholder="https://placehold.co/..." className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
        </div>

        <h2 className="text-sm font-bold text-[#212121] pt-2 border-t border-[#F0F0F0]">Initial Variant</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Size *</label>
            <input name="variantSize" required placeholder="500ml" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Variant SKU *</label>
            <input name="variantSku" required className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Price (₹) *</label>
            <input name="variantPrice" type="number" step="0.01" required className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Stock *</label>
            <input name="variantStock" type="number" defaultValue={100} required className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Weight (grams)</label>
            <input name="variantWeight" type="number" defaultValue={500} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <button type="submit" className="w-full bg-[#006A38] text-white py-3 rounded-lg font-bold hover:bg-[#00522B] transition-colors">
          Create Product
        </button>
      </form>
    </div>
  );
}
