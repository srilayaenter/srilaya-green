// Placeholder brand config — swap logo/colors/copy once real branding is ready.
export const BRAND = {
  name: "SriLaYa Green",
  tagline: "Bioenzyme Cleaning & Garden Care",
  domain: "srilaya-green.com",
  gstin: process.env.BRAND_GSTIN || "29XXXXX1234X1ZX",
  address: "Bengaluru, Karnataka, India",
  email: "info@srilaya-green.com",
  phone: "+91 86603 21315",
  logoUrl: "https://placehold.co/96x96/006837/FBB040?text=SG",

  colors: {
    primary: "#006A38",
    primaryDark: "#00522B",
    accent: "#8D6E63",
    text: "#212121",
    bg: "#F5F5F5",
    muted: "#9E9E9E",
  },

  business: {
    gstRate: 18,
    minOrderAmount: 0,
  },
};

export type BrandConfig = typeof BRAND;
