import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://srilaya-green.com"),
  title: {
    default: "SriLaYa Green — Bioenzyme Cleaning & Garden Care",
    template: "%s | SriLaYa Green",
  },
  description:
    "Bioenzyme-based multi-purpose cleaners, floor cleaners, garden enzymes, and pest repellents, fermented from natural fruit and plant waste. Pan-India delivery.",
  keywords: [
    "bioenzyme cleaner", "eco friendly cleaner", "natural floor cleaner",
    "garden enzyme", "compost booster", "pest repellent spray", "SriLaYa Green",
  ],
  authors: [{ name: "SriLaYa Green" }],
  creator: "SriLaYa Green",
  openGraph: {
    siteName: "SriLaYa Green",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SriLaYa Green — Bioenzyme Cleaning & Garden Care",
    description: "Bioenzyme-based cleaners and garden care, delivered pan-India.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white text-black antialiased font-sans">
        <CartProvider>{children}</CartProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
