import Image from "next/image";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "About Us" };

const team = [
  {
    name: "[Founder Name]",
    title: "Co-Founder",
    bio: "Placeholder bio — replace with a short intro about this founder's background and role at the company.",
    photo: "https://placehold.co/300x300/006837/FBB040?text=Founder+1",
  },
  {
    name: "[Co-Founder Name]",
    title: "Co-Founder",
    bio: "Placeholder bio — replace with a short intro about this founder's background and role at the company.",
    photo: "https://placehold.co/300x300/006837/FBB040?text=Founder+2",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white text-[#212121]">
      <section className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white py-16 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            Our Story
          </span>
          <h1 className="text-4xl font-black mt-4 mb-3 tracking-tight">About {BRAND.name}</h1>
          <p className="text-sm md:text-base text-emerald-100 max-w-xl mx-auto">
            Bioenzyme cleaning and personal care, fermented from natural fruit and plant waste.
          </p>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4 max-w-3xl">
        <p className="text-[#424242] leading-relaxed mb-4">
          {BRAND.name} makes bioenzyme-based cleaning, garden care, and personal care products,
          fermented from natural fruit and plant waste. Our products are designed to be effective
          on grease, grime, and pests, while being gentler on your home and the environment than
          conventional chemical alternatives.
        </p>
        <p className="text-[#424242] leading-relaxed">
          This page uses placeholder copy — replace it with your real brand story before launch.
        </p>
      </section>

      <section className="py-16 bg-[#F9F9F9] border-y border-[#E0E0E0]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
              Our Team
            </span>
            <h2 className="text-3xl font-black text-[#212121] mt-4 tracking-tight">Meet the People Behind {BRAND.name}</h2>
            <p className="text-[#757575] text-sm mt-2 max-w-md mx-auto">
              Placeholder team profiles — swap in real names, photos, and bios.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm p-6 text-center">
                <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-emerald-100 mb-4">
                  <Image src={member.photo} alt={member.name} fill className="object-cover" />
                </div>
                <h3 className="font-bold text-[#212121]">{member.name}</h3>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mt-0.5 mb-3">{member.title}</p>
                <p className="text-xs text-[#757575] leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
