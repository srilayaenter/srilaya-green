import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-black text-[#212121] mb-3">Page not found</h1>
      <p className="text-[#424242] mb-6">The page you're looking for doesn't exist.</p>
      <Link href="/" className="bg-[#006A38] hover:bg-[#005A30] text-white font-bold px-6 py-3 rounded-xl transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
