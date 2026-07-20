import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductPurchaseSection from "@/components/ProductPurchaseSection";
import ProductGallery from "@/components/ProductGallery";
import ReviewsSection from "@/components/ReviewsSection";
import Link from "next/link";
import type { Metadata } from "next";
import { toNum } from "@/lib/decimal";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://srilayagreen.com";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: { where: { active: true }, orderBy: { price: "asc" }, take: 1 } },
  });
  if (!product) return { title: "Product Not Found" };

  const lowestPrice = product.variants[0] ? toNum(product.variants[0].price) : null;
  const description = product.description ?? `Buy ${product.title} — bioenzyme cleaning products from SriLaYa Green. Pan-India delivery.`;

  return {
    title: `${product.title} | SriLaYa Green`,
    description,
    openGraph: {
      title: product.title,
      description,
      url: `${BASE_URL}/product/${product.slug}`,
      type: "website",
      images: product.imageUrl ? [{ url: product.imageUrl, alt: product.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
    ...(lowestPrice !== null && {
      other: { "product:price:amount": lowestPrice.toFixed(2), "product:price:currency": "INR" },
    }),
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, variants: { where: { active: true }, orderBy: { price: "asc" } }, images: { orderBy: { position: "asc" } }, reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } } },
  });

  if (!product || !product.active) notFound();

  const defaultVariant = product.variants[0];
  const lowestPrice = defaultVariant ? toNum(defaultVariant.price) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: product.imageUrl ?? undefined,
    url: `${BASE_URL}/product/${product.slug}`,
    brand: { "@type": "Brand", name: "SriLaYa Green" },
    ...(lowestPrice !== null && {
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: lowestPrice.toFixed(2),
        availability: "https://schema.org/InStock",
        url: `${BASE_URL}/product/${product.slug}`,
      },
    }),
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-[#9E9E9E] font-medium mb-6">
        <Link href="/product" className="hover:text-emerald-700">All Products</Link>
        {" / "}
        <Link href={`/category/${product.category.slug}`} className="hover:text-emerald-700">{product.category.name}</Link>
        {" / "}
        <span className="text-[#424242]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ProductGallery
          images={product.images}
          fallback={product.imageUrl}
          title={product.title}
        />

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

      <ReviewsSection
        productId={product.id}
        reviews={product.reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
      />
    </div>
  );
}
