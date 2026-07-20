import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Providers from "@/app/providers";
import SignOutButton from "./SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <Providers>
      <div className="min-h-screen bg-[#F5F5F5] font-sans">
        <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/admin" className="font-black text-lg text-[#212121]">
              SriLaYa <span className="text-[#006A38]">Green</span> Admin
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#424242]">
              <Link href="/admin" className="hover:text-[#006A38]">Dashboard</Link>
              <Link href="/admin/products" className="hover:text-[#006A38]">Products</Link>
              <Link href="/admin/orders" className="hover:text-[#006A38]">Orders</Link>
              <Link href="/admin/categories" className="hover:text-[#006A38]">Categories</Link>
              <Link href="/admin/customers" className="hover:text-[#006A38]">Customers</Link>
              <Link href="/admin/returns" className="hover:text-[#006A38]">Returns</Link>
              <Link href="/admin/reviews" className="hover:text-[#006A38]">Reviews</Link>
              <Link href="/admin/failed-emails" className="hover:text-[#006A38]">Emails</Link>
            </nav>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#9E9E9E] hidden sm:inline">{session?.user?.email}</span>
              <SignOutButton />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </div>
    </Providers>
  );
}
