export const metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 max-w-3xl py-16">
      <h1 className="text-4xl font-black text-[#212121] mb-6">Shipping Policy</h1>
      <p className="text-[#424242] leading-relaxed">
        Orders are shipped within 2–3 business days. Free shipping on orders over ₹999;
        otherwise a shipping fee is calculated at checkout based on order weight. Placeholder
        copy — replace with your finalized policy before launch.
      </p>
    </div>
  );
}
