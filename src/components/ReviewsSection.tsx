"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Star, MessageSquare, User, CheckCircle2 } from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
  student: {
    name: string;
    email: string;
  };
}

export default function ReviewsSection({
  propertyId,
  initialReviews,
  averageRating
}: {
  propertyId: string;
  initialReviews: ReviewItem[];
  averageRating: number;
}) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [avgRating, setAvgRating] = useState<number>(averageRating);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const isStudent = (session?.user as any)?.role === "STUDENT";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg("Please write a comment for your review.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          rating,
          comment: comment.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setReviews([data.review, ...reviews]);
      if (data.newAverageRating) {
        setAvgRating(data.newAverageRating);
      }
      setComment("");
      setRating(5);
      setSuccessMsg("Thank you! Your review has been published.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-8 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <MessageSquare className="text-teal-600 dark:text-teal-400" /> Student Reviews & Ratings
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real feedback from verified students who stayed or visited this PG.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 px-5 py-3 rounded-2xl border border-amber-200/50 dark:border-amber-700/30">
          <div className="flex items-center text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={star <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}
              />
            ))}
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{avgRating || "0.0"}</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold ml-1">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
          </div>
        </div>
      </div>

      {/* Review Submission Form */}
      {isStudent ? (
        <form onSubmit={handleSubmit} className="my-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/70 dark:border-slate-700">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Write a Review</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Share your experience to help fellow students find safe and comfortable accommodation.
          </p>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Your Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={26}
                    className={
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-600"
                    }
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">
                {hoverRating || rating} / 5 Stars
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Your Review / Experience
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How were the rooms, food, Wi-Fi, hygiene, security, and owner behavior? Be honest..."
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
            />
          </div>

          {errorMsg && (
            <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-3">{errorMsg}</p>
          )}

          {successMsg && (
            <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-3 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-md disabled:opacity-50"
          >
            {submitting ? "Submitting Review..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="my-6 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>Log in as a student to share your review for this property.</span>
        </div>
      )}

      {/* List of Reviews */}
      <div className="space-y-4 mt-6">
        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              No reviews have been written for this property yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">Be the first student to review!</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-sm">
                    {r.student?.name?.[0]?.toUpperCase() || <User size={16} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {r.student?.name || "Student"}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}
                    />
                  ))}
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 text-sm mt-3 leading-relaxed whitespace-pre-line">
                {r.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
