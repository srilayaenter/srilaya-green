import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  {
    slug: "multi-purpose-cleaner",
    name: "Multi-Purpose Cleaner",
    description: "All-purpose bioenzyme cleaner for floors, counters, and surfaces.",
    image: "https://placehold.co/600x750/006837/FBB040?text=Multi-Purpose+Cleaner",
  },
  {
    slug: "floor-surface-cleaner",
    name: "Floor & Surface Cleaner",
    description: "Concentrated enzyme cleaner formulated for hard floors and tiles.",
    image: "https://placehold.co/600x750/006837/FBB040?text=Floor+Cleaner",
  },
  {
    slug: "garden-compost-enzyme",
    name: "Garden & Compost Enzyme",
    description: "Enzyme booster for compost and soil health.",
    image: "https://placehold.co/600x750/006837/FBB040?text=Garden+Enzyme",
  },
  {
    slug: "pest-repellent-spray",
    name: "Pest Repellent Spray",
    description: "Natural bioenzyme spray to repel household pests.",
    image: "https://placehold.co/600x750/006837/FBB040?text=Pest+Repellent",
  },
  {
    slug: "kitchen-enzyme-concentrate",
    name: "Kitchen Enzyme Concentrate",
    description: "Grease-cutting enzyme concentrate for kitchen use.",
    image: "https://placehold.co/600x750/006837/FBB040?text=Kitchen+Enzyme",
  },
  {
    slug: "bathing-soaps",
    name: "Bathing Soaps",
    description: "Handmade soaps enriched with natural herbs and bioenzyme extracts.",
    image: "https://placehold.co/600x750/006837/FBB040?text=Bathing+Soaps",
  },
  {
    slug: "hair-care",
    name: "Hair Care",
    description: "Herbal shampoos and hair oils formulated with bioenzyme extracts.",
    image: "https://placehold.co/600x750/006837/FBB040?text=Hair+Care",
  },
  {
    slug: "baby-care",
    name: "Baby Care",
    description: "Gentle herbal oils and washes formulated for baby skin.",
    image: "https://placehold.co/600x750/006837/FBB040?text=Baby+Care",
  },
  {
    slug: "pure-bioenzymes",
    name: "Pure Bioenzymes",
    description: "Unblended fermented bioenzyme concentrate for DIY dilution and use.",
    image: "https://placehold.co/600x750/006837/FBB040?text=Pure+Bioenzymes",
  },
];

const products: {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  sku: string;
  gstRate: number;
  variants: { size: string; price: number; weightGrams: number; sku: string; stock: number }[];
}[] = [
  {
    slug: "citrus-multi-purpose-enzyme-cleaner",
    title: "Citrus Multi-Purpose Enzyme Cleaner",
    description:
      "A concentrated bioenzyme cleaner made from fermented citrus peels. Cuts grease, removes stains, and leaves a fresh citrus scent — safe for daily household use.",
    categorySlug: "multi-purpose-cleaner",
    sku: "SG-MPC-001",
    gstRate: 18,
    variants: [
      { size: "500ml", price: 199, weightGrams: 550, sku: "SG-MPC-001-500", stock: 100 },
      { size: "1L", price: 349, weightGrams: 1050, sku: "SG-MPC-001-1L", stock: 80 },
      { size: "5L", price: 1499, weightGrams: 5200, sku: "SG-MPC-001-5L", stock: 30 },
    ],
  },
  {
    slug: "lemongrass-floor-cleaner",
    title: "Lemongrass Bioenzyme Floor Cleaner",
    description:
      "Fermented lemongrass enzyme cleaner designed for tile, marble, and vinyl floors. Removes grime without leaving harsh chemical residue.",
    categorySlug: "floor-surface-cleaner",
    sku: "SG-FLR-001",
    gstRate: 18,
    variants: [
      { size: "500ml", price: 179, weightGrams: 550, sku: "SG-FLR-001-500", stock: 100 },
      { size: "1L", price: 319, weightGrams: 1050, sku: "SG-FLR-001-1L", stock: 70 },
      { size: "5L", price: 1399, weightGrams: 5200, sku: "SG-FLR-001-5L", stock: 25 },
    ],
  },
  {
    slug: "compost-booster-enzyme",
    title: "Compost Booster Bioenzyme",
    description:
      "Speeds up composting and enriches soil with beneficial microbes. Dilute and apply to kitchen waste or garden beds.",
    categorySlug: "garden-compost-enzyme",
    sku: "SG-GDN-001",
    gstRate: 18,
    variants: [
      { size: "500ml", price: 229, weightGrams: 560, sku: "SG-GDN-001-500", stock: 90 },
      { size: "1L", price: 399, weightGrams: 1080, sku: "SG-GDN-001-1L", stock: 60 },
    ],
  },
  {
    slug: "neem-pest-repellent-spray",
    title: "Neem & Enzyme Pest Repellent Spray",
    description:
      "Fermented neem-based bioenzyme spray that naturally repels ants, mosquitoes, and household pests.",
    categorySlug: "pest-repellent-spray",
    sku: "SG-PST-001",
    gstRate: 18,
    variants: [
      { size: "250ml", price: 149, weightGrams: 280, sku: "SG-PST-001-250", stock: 120 },
      { size: "500ml", price: 259, weightGrams: 550, sku: "SG-PST-001-500", stock: 80 },
    ],
  },
  {
    slug: "orange-peel-kitchen-degreaser",
    title: "Orange Peel Kitchen Degreaser Concentrate",
    description:
      "High-strength enzyme concentrate that cuts through kitchen grease and grime. Dilute before use.",
    categorySlug: "kitchen-enzyme-concentrate",
    sku: "SG-KIT-001",
    gstRate: 18,
    variants: [
      { size: "500ml", price: 219, weightGrams: 560, sku: "SG-KIT-001-500", stock: 100 },
      { size: "1L", price: 389, weightGrams: 1080, sku: "SG-KIT-001-1L", stock: 65 },
      { size: "5L", price: 1699, weightGrams: 5250, sku: "SG-KIT-001-5L", stock: 20 },
    ],
  },
  {
    slug: "neem-turmeric-handmade-soap",
    title: "Neem & Turmeric Handmade Soap",
    description:
      "Cold-processed handmade soap enriched with neem and turmeric extracts. Gentle daily cleansing with no synthetic fragrance.",
    categorySlug: "bathing-soaps",
    sku: "SG-SOAP-001",
    gstRate: 18,
    variants: [
      { size: "100g", price: 99, weightGrams: 110, sku: "SG-SOAP-001-100", stock: 150 },
      { size: "3-Pack (300g)", price: 269, weightGrams: 330, sku: "SG-SOAP-001-3PK", stock: 60 },
    ],
  },
  {
    slug: "herbal-bioenzyme-shampoo",
    title: "Herbal Bioenzyme Shampoo",
    description:
      "Sulfate-free shampoo formulated with fermented herbal bioenzyme extract for a gentle, natural clean.",
    categorySlug: "hair-care",
    sku: "SG-HAIR-001",
    gstRate: 18,
    variants: [
      { size: "200ml", price: 249, weightGrams: 230, sku: "SG-HAIR-001-200", stock: 90 },
      { size: "500ml", price: 499, weightGrams: 550, sku: "SG-HAIR-001-500", stock: 50 },
    ],
  },
  {
    slug: "natural-herbal-hair-oil",
    title: "Natural Herbal Hair Oil",
    description:
      "Cold-pressed herbal hair oil blended with bioenzyme extract to nourish scalp and strengthen hair.",
    categorySlug: "hair-care",
    sku: "SG-HAIR-002",
    gstRate: 18,
    variants: [{ size: "100ml", price: 199, weightGrams: 120, sku: "SG-HAIR-002-100", stock: 80 }],
  },
  {
    slug: "herbal-baby-massage-oil",
    title: "Herbal Baby Massage Oil",
    description:
      "Mild, fragrance-free herbal massage oil formulated for delicate baby skin.",
    categorySlug: "baby-care",
    sku: "SG-BABY-001",
    gstRate: 18,
    variants: [{ size: "100ml", price: 229, weightGrams: 130, sku: "SG-BABY-001-100", stock: 70 }],
  },
  {
    slug: "herbal-baby-wash",
    title: "Herbal Baby Wash",
    description:
      "Tear-free herbal baby wash with a gentle bioenzyme-based cleansing base.",
    categorySlug: "baby-care",
    sku: "SG-BABY-002",
    gstRate: 18,
    variants: [{ size: "200ml", price: 199, weightGrams: 220, sku: "SG-BABY-002-200", stock: 70 }],
  },
  {
    slug: "pure-bioenzyme-concentrate",
    title: "Pure Bioenzyme Concentrate",
    description:
      "Unblended fermented bioenzyme concentrate (1:3:10 jaggery-waste-water ratio) — dilute to make your own cleaners at home.",
    categorySlug: "pure-bioenzymes",
    sku: "SG-PURE-001",
    gstRate: 18,
    variants: [
      { size: "500ml", price: 149, weightGrams: 560, sku: "SG-PURE-001-500", stock: 100 },
      { size: "1L", price: 259, weightGrams: 1080, sku: "SG-PURE-001-1L", stock: 70 },
      { size: "5L", price: 1099, weightGrams: 5250, sku: "SG-PURE-001-5L", stock: 25 },
    ],
  },
  {
    slug: "lavender-multi-purpose-enzyme-cleaner",
    title: "Lavender Multi-Purpose Enzyme Cleaner",
    description:
      "A calming lavender-scented bioenzyme cleaner, fermented the same way as our citrus variant. Cuts grease and grime on floors, counters, and surfaces.",
    categorySlug: "multi-purpose-cleaner",
    sku: "SG-MPC-002",
    gstRate: 18,
    variants: [
      { size: "500ml", price: 209, weightGrams: 550, sku: "SG-MPC-002-500", stock: 90 },
      { size: "1L", price: 369, weightGrams: 1050, sku: "SG-MPC-002-1L", stock: 60 },
    ],
  },
  {
    slug: "natural-plant-growth-concentrate",
    title: "Natural Plant Growth Concentrate",
    description:
      "A fermented bioenzyme concentrate formulated to encourage root and leaf growth. Dilute and water into soil every 2–3 weeks.",
    categorySlug: "garden-compost-enzyme",
    sku: "SG-GDN-002",
    gstRate: 18,
    variants: [
      { size: "500ml", price: 249, weightGrams: 560, sku: "SG-GDN-002-500", stock: 70 },
      { size: "1L", price: 429, weightGrams: 1080, sku: "SG-GDN-002-1L", stock: 45 },
    ],
  },
  {
    slug: "lavender-aloe-vera-handmade-soap",
    title: "Lavender & Aloe Vera Handmade Soap",
    description:
      "Cold-processed handmade soap with lavender oil and aloe vera gel. Gentle daily cleansing with no synthetic fragrance.",
    categorySlug: "bathing-soaps",
    sku: "SG-SOAP-002",
    gstRate: 18,
    variants: [
      { size: "100g", price: 99, weightGrams: 110, sku: "SG-SOAP-002-100", stock: 150 },
      { size: "3-Pack (300g)", price: 269, weightGrams: 330, sku: "SG-SOAP-002-3PK", stock: 60 },
    ],
  },
  {
    slug: "herbal-shikakai-hair-powder",
    title: "Herbal Shikakai Hair Powder",
    description:
      "Sun-dried shikakai pods ground into a fine powder, blended with a light bioenzyme extract. A traditional chemical-free alternative to shampoo.",
    categorySlug: "hair-care",
    sku: "SG-HAIR-003",
    gstRate: 18,
    variants: [
      { size: "500g", price: 179, weightGrams: 520, sku: "SG-HAIR-003-500", stock: 60 },
      { size: "1kg", price: 329, weightGrams: 1040, sku: "SG-HAIR-003-1KG", stock: 35 },
    ],
  },
  {
    slug: "herbal-baby-shampoo",
    title: "Herbal Baby Shampoo",
    description:
      "Tear-free herbal shampoo formulated with a mild bioenzyme base and shikakai extract for delicate baby hair and scalp.",
    categorySlug: "baby-care",
    sku: "SG-BABY-003",
    gstRate: 18,
    variants: [{ size: "200ml", price: 219, weightGrams: 220, sku: "SG-BABY-003-200", stock: 65 }],
  },
];

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@srilaya-green.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const hashed = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, password: hashed, role: "admin" },
  });
  console.log(`Admin user ready: ${adminEmail} (password from SEED_ADMIN_PASSWORD or default)`);

  const categoryIdBySlug = new Map<string, string>();
  for (const c of categories) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, image: c.image },
      create: c,
    });
    categoryIdBySlug.set(c.slug, category.id);
  }

  for (const p of products) {
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Unknown category slug: ${p.categorySlug}`);

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        description: p.description,
        gstRate: p.gstRate,
        categoryId,
        imageUrl: `https://placehold.co/600x600/006837/FBB040?text=${encodeURIComponent(p.title)}`,
      },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        sku: p.sku,
        gstRate: p.gstRate,
        categoryId,
        imageUrl: `https://placehold.co/600x600/006837/FBB040?text=${encodeURIComponent(p.title)}`,
      },
    });

    for (const v of p.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: { price: v.price, weightGrams: v.weightGrams, stock: v.stock },
        create: {
          productId: product.id,
          size: v.size,
          price: v.price,
          weightGrams: v.weightGrams,
          sku: v.sku,
          stock: v.stock,
        },
      });
    }
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
