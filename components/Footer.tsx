import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/brand";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#003D20] text-white">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#4CAF50] bg-white flex-shrink-0">
                <Image src={BRAND.logoUrl} alt={`${BRAND.name} Logo`} fill className="object-cover" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">
                SriLaYa <span className="text-[#4CAF50]">Green</span>
              </span>
            </Link>
            <p className="text-green-200 text-sm leading-relaxed mb-4">
              Bioenzyme cleaners and garden care, fermented from natural fruit and plant waste.
            </p>
            <p className="text-sm text-green-300 font-mono">{BRAND.phone}</p>
            <p className="text-sm text-green-300 font-mono mt-1">{BRAND.email}</p>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-green-400 mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm text-green-100">
              <li><Link href="/product" className="hover:text-[#4CAF50] transition-colors">All Products</Link></li>
              <li><Link href="/category/multi-purpose-cleaner" className="hover:text-[#4CAF50] transition-colors">Multi-Purpose Cleaner</Link></li>
              <li><Link href="/category/floor-surface-cleaner" className="hover:text-[#4CAF50] transition-colors">Floor & Surface Cleaner</Link></li>
              <li><Link href="/category/garden-compost-enzyme" className="hover:text-[#4CAF50] transition-colors">Garden & Compost Enzyme</Link></li>
              <li><Link href="/category/pest-repellent-spray" className="hover:text-[#4CAF50] transition-colors">Pest Repellent Spray</Link></li>
              <li><Link href="/cart" className="hover:text-[#4CAF50] transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-green-400 mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-green-100">
              <li><Link href="/about" className="hover:text-[#4CAF50] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#4CAF50] transition-colors">Contact Us</Link></li>
              <li><Link href="/track" className="hover:text-[#4CAF50] transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="hover:text-[#4CAF50] transition-colors">Request a Return</Link></li>
            </ul>
          </div>

          {/* Address & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-green-400 mb-4">Our Location</h4>
            <address className="not-italic text-sm text-green-100 leading-relaxed">
              SriLaYa Green<br />
              White Field Hoskote Main Road,<br />
              Seegehalli, Bengaluru<br />
              Karnataka — 560067
            </address>
            <p className="text-sm text-green-300 mt-3">Mon–Sat: 9:00 AM – 6:00 PM</p>
            {BRAND.gstin && (
              <p className="text-xs text-green-400 mt-2 font-mono">GSTIN: {BRAND.gstin}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-[#002A16]">
        <div className="container mx-auto px-4 max-w-7xl py-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-green-400">
            <Link href="/privacy" className="hover:text-[#4CAF50] transition-colors">Privacy</Link>
            <span className="opacity-40">·</span>
            <Link href="/terms" className="hover:text-[#4CAF50] transition-colors">Terms</Link>
            <span className="opacity-40">·</span>
            <Link href="/shipping-policy" className="hover:text-[#4CAF50] transition-colors">Shipping</Link>
            <span className="opacity-40">·</span>
            <Link href="/returns-policy" className="hover:text-[#4CAF50] transition-colors">Returns</Link>
          </div>
          <p className="text-xs text-green-400 text-center sm:text-right">
            © {currentYear} {BRAND.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
