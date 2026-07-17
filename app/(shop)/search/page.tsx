import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search Results" };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() ?? "";

  const products = q
    ? await prisma.product.findMany({
        where: {
          active: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { category: true, variants: { where: { active: true }, orderBy: { price: "asc" } } },
      })
    : [];

  return (
    <div className="container mx-auto px-4 max-w-7xl py-10">
      <h1 className="text-3xl font-black text-[#212121] tracking-tight mb-2">
        Search results for &ldquo;{q}&rdquo;
      </h1>
      <p className="text-[#757575] text-sm mb-8">{products.length} products found</p>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => (
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
        <p className="text-center text-[#9E9E9E] py-20">No products match your search.</p>
      )}
    </div>
  );
}
