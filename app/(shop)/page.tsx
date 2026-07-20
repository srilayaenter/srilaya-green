import { prisma } from "@/lib/db";
import Link from "next/link";
import { toNum } from "@/lib/decimal";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import Testimonials from "@/components/Testimonials";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SriLaYa Green — Bioenzyme Cleaning & Garden Care",
  description:
    "Shop bioenzyme multi-purpose cleaners, floor cleaners, garden enzymes, and pest repellents. Fermented from natural fruit and plant waste, pan-India delivery.",
  openGraph: {
    title: "SriLaYa Green — Bioenzyme Cleaning & Garden Care",
    description:
      "Shop bioenzyme multi-purpose cleaners, floor cleaners, garden enzymes, and pest repellents.",
    url: "/",
    type: "website",
  },
};

const productQuery = {
  include: { variants: { where: { active: true }, orderBy: { price: "asc" as const } } },
};

const FALLBACK_COLORS = [
  "from-emerald-900/80 to-emerald-700/50",
  "from-cyan-900/80 to-cyan-700/50",
  "from-teal-900/80 to-teal-700/50",
  "from-green-900/80 to-green-700/50",
  "from-sky-900/80 to-sky-700/50",
];

const usps = [
  { icon: "🌿", label: "100% Bioenzyme", sub: "Fermented from fruit & plant waste" },
  { icon: "🚫", label: "No Harsh Chemicals", sub: "Safe for homes with kids & pets" },
  { icon: "♻️", label: "Biodegradable", sub: "Breaks down safely after use" },
  { icon: "🚚", label: "Pan-India Delivery", sub: "Delhivery, Blue Dart & more" },
];

const whyUs = [
  {
    icon: "🧪",
    title: "Slow-Fermented Enzymes",
    desc: "Each batch is fermented for weeks from fruit and plant waste to develop effective, natural cleaning enzymes.",
  },
  {
    icon: "🔬",
    title: "Quality Tested",
    desc: "Every batch is checked for pH and enzyme activity before it reaches your doorstep.",
  },
  {
    icon: "🌍",
    title: "Waste-to-Wellness",
    desc: "We upcycle fruit and vegetable waste that would otherwise be discarded — good for your home and the planet.",
  },
];

export default async function HomePage() {
  const [products, topSelling, dbCategories] = await Promise.all([
    prisma.product.findMany({
      ...productQuery,
      where: { active: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      ...productQuery,
      where: { active: true },
      take: 4,
      orderBy: { createdAt: "asc" },
    }),
    prisma.category.findMany({
      where: { products: { some: {} } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, description: true, image: true },
    }),
  ]);

  return (
    <div className="bg-white">
      {/* -- HERO ----------------------------------------------- */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-7xl py-24 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 border border-amber-400/30">
              100% Bioenzyme &amp; Natural
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
              Clean Naturally.<br />
              <span className="text-amber-400">Grow Sustainably.</span>
            </h1>
            <p className="text-emerald-100 text-base md:text-lg leading-relaxed mb-10 max-w-xl">
              Bioenzyme cleaners and garden care, fermented from natural fruit and plant waste —
              powerful on grime, gentle on your home and the planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/product"
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-400/30 text-sm tracking-wide"
              >
                Shop Now →
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm tracking-wide"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-white"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
      </section>

      {/* -- PROMO BANNER ---------------------------------------- */}
      <section className="bg-amber-400">
        <div className="container mx-auto px-4 max-w-7xl py-3 flex flex-wrap items-center justify-center gap-2 text-center">
          <span className="text-lg">🚚</span>
          <p className="text-emerald-950 font-black text-sm tracking-wide">
            FREE SHIPPING on orders above ₹999 —{" "}
            <Link href="/product" className="underline underline-offset-2 hover:no-underline">
              Shop Now
            </Link>
          </p>
        </div>
      </section>

      {/* -- TOP SELLING ------------------------------------------ */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
              Customer Favourites
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#212121] mt-4 tracking-tight">Top Selling</h2>
          </div>

          {topSelling.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
              {topSelling.map((product) => {
                const lowestPrice = product.variants.length > 0 ? toNum(product.variants[0].price) : null;
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group text-center"
                  >
                    <div className="relative aspect-square rounded-2xl bg-[#F9F9F9] border border-[#E0E0E0] overflow-hidden mb-3">
                      <Image
                        src={product.imageUrl || "https://placehold.co/400x400/006A38/white?text=SriLaYa+Green"}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-bold text-sm text-[#212121] group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                    {lowestPrice !== null && (
                      <p className="text-sm font-black text-emerald-700 mt-1">₹{lowestPrice.toFixed(2)}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-[#9E9E9E] py-8">No products yet.</p>
          )}
        </div>
      </section>

      {/* -- USP STRIP ------------------------------------------ */}
      <section className="bg-white border-b border-[#E0E0E0]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#F0F0F0]">
            {usps.map((usp) => (
              <div key={usp.label} className="flex items-center gap-3 px-4 md:px-6 py-4 md:py-5">
                <span className="text-2xl flex-shrink-0">{usp.icon}</span>
                <div>
                  <p className="font-bold text-sm text-[#212121]">{usp.label}</p>
                  <p className="text-xs text-[#9E9E9E] font-medium mt-0.5">{usp.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- CATEGORY SHOWCASE ---------------------------------- */}
      <section className="py-12 md:py-20 bg-[#F9F9F9]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
              Browse by Category
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#212121] mt-4 mb-3 tracking-tight">
              What Are You Cleaning Today?
            </h2>
            <p className="text-[#757575] max-w-lg mx-auto text-sm md:text-base">
              From kitchen degreasers to garden enzymes and pest repellents — we have a bioenzyme
              solution for every corner of your home.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
            {dbCategories.map((cat, idx) => {
              const color = FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative aspect-[4/5]">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${color} flex items-center justify-center`}>
                        <span className="text-5xl opacity-60">🌿</span>
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-t ${color} group-hover:opacity-95 transition-opacity duration-300`} />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <h3 className="text-white font-black text-base md:text-lg leading-tight drop-shadow">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-white/80 text-xs mt-1 font-medium">{cat.description}</p>
                    )}
                    <span className="inline-block mt-3 text-xs font-black text-amber-300 group-hover:text-amber-200 group-hover:tracking-wide transition-all duration-200">
                      Shop Now →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* -- FEATURED PRODUCTS ---------------------------------- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                Handpicked for You
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#212121] mt-4 tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              href="/product"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-900 border border-emerald-200 hover:border-emerald-400 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-all"
            >
              View All Products →
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((product) => {
                const lowestPrice = product.variants.length > 0 ? toNum(product.variants[0].price) : null;

                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative h-52 w-full bg-[#F9F9F9] overflow-hidden">
                      <Image
                        src={product.imageUrl || "https://placehold.co/400x400/006A38/white?text=SriLaYa+Green"}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                        {product.variants.length} size{product.variants.length !== 1 ? "s" : ""} available
                      </p>
                      <h3 className="font-bold text-[#212121] text-sm leading-snug mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        {lowestPrice !== null ? (
                          <div>
                            <span className="text-[10px] text-[#9E9E9E] font-medium block">Starting at</span>
                            <span className="text-lg font-black text-[#212121]">₹{lowestPrice.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-[#9E9E9E] text-sm">No variants</span>
                        )}
                        <span className="w-9 h-9 rounded-xl bg-[#F9F9F9] group-hover:bg-[#00522B] text-[#9E9E9E] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm text-sm font-bold border border-[#E0E0E0] group-hover:border-emerald-700">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-[#9E9E9E] py-16">No featured products yet.</p>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link
              href="/product"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 border border-emerald-200 bg-emerald-50 px-6 py-3 rounded-xl"
            >
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* -- WHY CHOOSE US -------------------------------------- */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                Why SriLaYa Green
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-5 mb-4">
                We Don&apos;t Just Sell Cleaners.<br />
                <span className="text-amber-400">We Ferment Solutions.</span>
              </h2>
              <p className="text-emerald-200 text-sm md:text-base leading-relaxed mb-10 max-w-md">
                Bioenzymes have been used for generations to clean naturally. We're bringing that
                tradition back — with the transparency and consistency modern households expect.
              </p>

              <div className="space-y-6">
                {whyUs.map((item) => (
                  <div key={item.title} className="flex gap-4 items-start">
                    <div className="w-11 h-11 rounded-xl bg-emerald-800 flex items-center justify-center text-xl flex-shrink-0 border border-emerald-700">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                      <p className="text-emerald-300 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 mt-10 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-6 py-3 rounded-xl transition-all text-sm"
              >
                Read Our Story →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "5+", label: "Product Lines", icon: "🧴" },
                { value: "100%", label: "Bioenzyme Based", icon: "✅" },
                { value: "0", label: "Harsh Chemicals", icon: "🚫" },
                { value: "3-6wk", label: "Fermentation Time", icon: "⏳" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-emerald-800/50 border border-emerald-700/50 rounded-2xl p-4 md:p-6 flex flex-col items-center text-center hover:bg-[#00522B] transition-colors"
                >
                  <span className="text-3xl mb-2">{stat.icon}</span>
                  <span className="text-3xl font-black text-amber-400 leading-none">{stat.value}</span>
                  <span className="text-emerald-300 text-xs font-medium mt-2 leading-snug">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* -- TESTIMONIALS --------------------------------------- */}
      <Testimonials />

      {/* -- CONTACT CTA ----------------------------------------- */}
      <section className="py-16 bg-amber-50 border-t border-amber-100">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="text-3xl block mb-4">💬</span>
          <h2 className="text-2xl md:text-3xl font-black text-[#212121] mb-3 tracking-tight">
            Questions? We&apos;re Here to Help.
          </h2>
          <p className="text-[#757575] mb-8 max-w-lg mx-auto text-sm md:text-base">
            Reach out for bulk orders, wholesale enquiries, or any product questions. Our team
            responds within the hour on working days.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-[#00522B] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-md text-sm"
            >
              Contact Us
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 border border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 text-[#424242] font-bold px-7 py-3.5 rounded-xl transition-all text-sm"
            >
              Track My Order
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
