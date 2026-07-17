import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductPurchaseSection from "@/components/ProductPurchaseSection";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  return { title: product?.title ?? "Product" };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true, variants: { where: { active: true }, orderBy: { price: "asc" } } },
  });

  if (!product || !product.active) notFound();

  const defaultVariant = product.variants[0];

  return (
    <div className="container mx-auto px-4 max-w-6xl py-10">
      <nav className="text-xs text-[#9E9E9E] font-medium mb-6">
        <Link href="/product" className="hover:text-emerald-700">All Products</Link>
        {" / "}
        <Link href={`/category/${product.category.slug}`} className="hover:text-emerald-700">{product.category.name}</Link>
        {" / "}
        <span className="text-[#424242]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="relative aspect-square bg-[#F9F9F9] rounded-2xl border border-[#E0E0E0] overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} className="max-h-full max-w-full object-contain p-8" />
          ) : (
            <span className="text-8xl opacity-40">🧴</span>
          )}
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-2">
            {product.category.name}
          </span>
          <h1 className="text-3xl font-black text-[#212121] tracking-tight mb-4">{product.title}</h1>
          {product.description && <p className="text-[#616161] leading-relaxed mb-6">{product.description}</p>}

          {defaultVariant ? (
            <ProductPurchaseSection
              variants={product.variants.map((v) => ({ ...v, price: v.price.toString() }))}
            />
          ) : (
            <p className="text-[#9E9E9E]">No sizes currently available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
