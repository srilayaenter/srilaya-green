import ReturnRequestForm from "@/components/ReturnRequestForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Return | SriLaYa Green",
  description: "Request a return or exchange for your SriLaYa Green order.",
};

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 max-w-2xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#212121] tracking-tight">Return Request</h1>
        <p className="text-[#757575] text-sm mt-2">
          Returns are accepted within 7 days of delivery for unopened or defective items.
        </p>
      </div>
      <ReturnRequestForm />
    </div>
  );
}
