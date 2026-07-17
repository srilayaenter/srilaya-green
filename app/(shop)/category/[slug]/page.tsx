import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  return { title: category?.name ?? "Category" };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { active: true, categoryId: category.id },
    include: { category: true, variants: { where: { active: true }, orderBy: { price: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 max-w-7xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-[#212121] tracking-tight">{category.name}</h1>
        {category.description && <p className="text-[#757575] text-sm mt-2 max-w-2xl">{category.description}</p>}
      </div>

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
        <p className="text-center text-[#9E9E9E] py-20">No products in this category yet.</p>
      )}
    </div>
  );
}
