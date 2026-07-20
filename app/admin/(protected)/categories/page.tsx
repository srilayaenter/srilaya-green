import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function createCategory(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const slug = name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  const image = formData.get("imageUrl") as string;
  await prisma.category.create({ data: { name, slug, image: image || null } });
  redirect("/admin/categories");
}

async function updateCategory(formData: FormData) {
  "use server";
  const id = formData.get("categoryId") as string;
  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  const image = formData.get("imageUrl") as string;
  await prisma.category.update({ where: { id }, data: { name, slug, image: image || null } });
  redirect("/admin/categories");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = formData.get("categoryId") as string;
  await prisma.category.delete({ where: { id } });
  redirect("/admin/categories");
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  const editingCategory = edit ? categories.find((c) => c.id === edit) : null;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Categories</h1>
        <p className="text-sm text-[#9E9E9E] mt-1">Organise your product catalog into categories.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E0E0E0]">
            <h2 className="font-bold text-[#212121]">Existing Categories</h2>
          </div>
          <div className="divide-y divide-[#F5F5F5]">
            {categories.length === 0 && (
              <p className="px-6 py-8 text-sm text-[#9E9E9E]">No categories yet.</p>
            )}
            {categories.map((cat) => {
              const badSlug = /[^a-z0-9-]/.test(cat.slug);
              return (
                <div key={cat.id} className="px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0 text-lg">🌿</div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-[#212121] truncate">{cat.name}</p>
                        <p className="text-xs font-mono text-[#9E9E9E] flex items-center gap-1">
                          /{cat.slug}
                          {badSlug && <span className="text-red-500 font-bold">⚠</span>}
                        </p>
                        <p className="text-xs text-[#BDBDBD]">{cat._count.products} products</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <a
                        href={`?edit=${cat.id}`}
                        className="text-xs font-bold text-[#006A38] hover:underline"
                      >
                        Edit
                      </a>
                      <form action={deleteCategory}>
                        <input type="hidden" name="categoryId" value={cat.id} />
                        <button
                          type="submit"
                          disabled={cat._count.products > 0}
                          className="text-xs font-bold text-red-500 hover:text-red-700 disabled:text-[#BDBDBD] disabled:cursor-not-allowed"
                          title={cat._count.products > 0 ? "Remove all products first" : "Delete"}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>

                  {edit === cat.id && editingCategory && (
                    <form action={updateCategory} className="space-y-3 pt-2 border-t border-[#F5F5F5]">
                      <input type="hidden" name="categoryId" value={cat.id} />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-[#616161] block mb-1">Name</label>
                          <input
                            type="text"
                            name="name"
                            defaultValue={cat.name}
                            required
                            className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006A38]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#616161] block mb-1">Slug</label>
                          <input
                            type="text"
                            name="slug"
                            defaultValue={cat.slug}
                            required
                            className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#006A38]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#616161] block mb-1">Image URL</label>
                        <input
                          type="url"
                          name="imageUrl"
                          defaultValue={cat.image ?? ""}
                          className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006A38]"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-[#006A38] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00522B] transition-colors"
                        >
                          Save
                        </button>
                        <a
                          href="/admin/categories"
                          className="px-4 py-2 rounded-lg text-sm font-semibold text-[#616161] hover:bg-[#F5F5F5] transition-colors"
                        >
                          Cancel
                        </a>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add new */}
        <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden self-start">
          <div className="px-6 py-4 border-b border-[#E0E0E0]">
            <h2 className="font-bold text-[#212121]">Add New Category</h2>
          </div>
          <form action={createCategory} className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#616161] block mb-1">Name *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006A38]"
                placeholder="Floor Cleaners"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#616161] block mb-1">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006A38]"
                placeholder="https://..."
              />
            </div>
            <p className="text-xs text-[#9E9E9E]">Slug is auto-generated from the name.</p>
            <button
              type="submit"
              className="w-full bg-[#006A38] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#00522B] transition-colors"
            >
              Add Category
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
