import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  noStore();

  // The category strip is a nice-to-have — a DB hiccup here shouldn't 500
  // every storefront page, so fall back to an empty nav instead of throwing.
  let categoryLinks: { name: string; href: string }[] = [];
  try {
    const dbCategories = await prisma.category.findMany({
      where: { products: { some: {} } },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    });
    categoryLinks = dbCategories.map((c) => ({ name: c.name, href: `/category/${c.slug}` }));
  } catch (err) {
    console.error("Header: failed to load categories", err);
  }

  return <HeaderClient categoryLinks={categoryLinks} />;
}
