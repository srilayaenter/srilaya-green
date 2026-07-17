import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { toNum } from "@/lib/decimal";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "All Products" };

export default async function ProductListingPage({
  searchParams,
}: {
  searchParams: { sort?: string; category?: string };
}) {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        ...(searchParams.category ? { category: { slug: searchParams.category } } : {}),
      },
      include: { category: true, variants: { where: { active: true }, orderBy: { price: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ where: { products: { some: {} } }, orderBy: { name: "asc" } }),
  ]);

  const sorted = [...products].sort((a, b) => {
    const priceA = a.variants[0] ? toNum(a.variants[0].price) : 0;
    const priceB = b.variants[0] ? toNum(b.variants[0].price) : 0;
    if (searchParams.sort === "price_asc") return priceA - priceB;
    if (searchParams.sort === "price_desc") return priceB - priceA;
    return 0;
  });

  return (
    <div className="container mx-auto px-4 max-w-7xl py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#212121] tracking-tight">All Products</h1>
          <p className="text-[#757575] text-sm mt-1">{sorted.length} products</p>
        </div>

        <form className="flex gap-3">
          <select
            name="sort"
            defaultValue={searchParams.sort ?? ""}
            className="appearance-none bg-white border border-[#E0E0E0] rounded-xl px-3 py-2 text-sm font-medium text-[#424242]"
          >
            <option value="">Sort: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
          <button
            type="submit"
            className="bg-emerald-700 hover:bg-[#00522B] text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-[#E0E0E0] pb-4">
        <Link
          href={searchParams.sort ? `/product?sort=${searchParams.sort}` : "/product"}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
            !searchParams.category
              ? "bg-emerald-700 text-white"
              : "bg-[#F5F5F5] text-[#424242] hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          All Products
        </Link>
        {categories.map((c) => {
          const href = searchParams.sort
            ? `/product?category=${c.slug}&sort=${searchParams.sort}`
            : `/product?category=${c.slug}`;
          const active = searchParams.category === c.slug;
          return (
            <Link
              key={c.id}
              href={href}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
                active ? "bg-emerald-700 text-white" : "bg-[#F5F5F5] text-[#424242] hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sorted.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                title: product.title,
                slug: product.slug,
                imageUrl: product.imageUrl,
                category: { name: product.category.name },
                variants: product.variants.map((v) => ({ id: v.id, size: v.size, price: v.price.toString(), stock: v.stock })),
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-[#9E9E9E] py-20">No products found.</p>
      )}
    </div>
  );
}
