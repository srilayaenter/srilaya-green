"use client";

import { useState } from "react";

interface Review {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
}

interface Props {
  productId: string;
  reviews: Review[];
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={onChange ? "button" : undefined}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`text-2xl leading-none transition-colors ${
            star <= (hovered || value) ? "text-amber-400" : "text-[#E0E0E0]"
          } ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ productId, reviews: initialReviews }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating."); return; }
    setError("");
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        name: fd.get("name"),
        email: fd.get("email"),
        rating,
        title: fd.get("title") || null,
        body: fd.get("body"),
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
      (e.target as HTMLFormElement).reset();
      setRating(0);
    } else {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mt-12 border-t border-[#E0E0E0] pt-10">
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="text-xl font-black text-[#212121]">Customer Reviews</h2>
        {avg && (
          <span className="text-sm text-[#757575]">
            <span className="text-amber-400 font-bold">★ {avg}</span>
            {" "}({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
          </span>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4 mb-10">
          {reviews.map((r) => (
            <div key={r.id} className="bg-[#F9F9F9] rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} />
                  <span className="font-bold text-sm text-[#212121]">{r.name}</span>
                </div>
                <span className="text-xs text-[#9E9E9E]">
                  {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              {r.title && <p className="text-sm font-semibold text-[#424242] mt-1">{r.title}</p>}
              <p className="text-sm text-[#616161] mt-1">{r.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#9E9E9E] mb-8">No reviews yet. Be the first to review this product.</p>
      )}

      <div className="bg-white border border-[#E0E0E0] rounded-xl p-6">
        <h3 className="text-base font-bold text-[#212121] mb-4">Write a Review</h3>
        {submitted ? (
          <div className="text-center py-4">
            <p className="text-[#006A38] font-bold text-sm">✅ Thank you! Your review has been submitted for moderation.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Your Rating *</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Your Name *</label>
                <input name="name" required className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006A38]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Email *</label>
                <input name="email" type="email" required className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006A38]" />
                <p className="text-[10px] text-[#9E9E9E] mt-1">Not published</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Review Title</label>
              <input name="title" placeholder="e.g. Great product!" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006A38]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Your Review *</label>
              <textarea name="body" required rows={3} placeholder="Tell others about your experience..." className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006A38]" />
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#006A38] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#00522B] transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
