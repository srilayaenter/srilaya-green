const testimonials = [
  {
    name: "Ramesh K.",
    location: "Bengaluru",
    rating: 5,
    quote:
      "Switched our whole kitchen to the enzyme degreaser — cuts grease without the harsh chemical smell. Never going back.",
  },
  {
    name: "Anita S.",
    location: "Chennai",
    rating: 5,
    quote:
      "The floor cleaner leaves no residue and my kids can crawl around right after mopping. Worth every rupee.",
  },
  {
    name: "Vinod P.",
    location: "Hyderabad",
    rating: 4,
    quote:
      "Compost booster genuinely sped up our home composting. Garden's never looked better.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#F9F9F9] border-y border-[#E0E0E0] py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
            What Customers Say
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#212121] mt-4 tracking-tight">
            Loved by Households Across India
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0]">
              <span className="text-4xl text-emerald-100 font-black leading-none block mb-2">&ldquo;</span>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < t.rating ? "text-amber-400" : "text-[#E0E0E0]"}>
                    ★
                  </span>
                ))}
              </div>
              <p className="text-[#424242] text-sm leading-relaxed mb-5">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#212121]">{t.name}</p>
                  <p className="text-xs text-[#9E9E9E]">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
