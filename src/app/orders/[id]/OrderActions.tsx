"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { CheckCircle, AlertTriangle, Upload, Star } from "lucide-react";

type Props = {
  orderId: string;
  status: string;
  isClient: boolean;
  isFreelancer: boolean;
  hasReview: boolean;
};

export default function OrderActions({ orderId, status, isClient, isFreelancer, hasReview }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; size: number }[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);

  async function action(endpoint: string, body?: object) {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  async function submitReview() {
    setLoading(true);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, rating, comment }),
    });
    setLoading(false);
    setShowReview(false);
    router.refresh();
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
      <h3 className="font-semibold text-gray-900 text-sm">Order Actions</h3>

      {/* Freelancer: start work */}
      {isFreelancer && status === "OPEN" && (
        <button onClick={() => action("deliver")}
          className="w-full bg-yellow-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50 transition-colors"
          disabled={loading}>
          Start Working
        </button>
      )}

      {/* Freelancer: deliver */}
      {isFreelancer && status === "IN_PROGRESS" && (
        <div className="space-y-3">
          <UploadButton<OurFileRouter, "orderDeliverable">
            endpoint="orderDeliverable"
            onClientUploadComplete={(res) => {
              setUploadedFiles(res.map(f => ({ name: f.name, url: f.ufsUrl, size: f.size })));
            }}
            className="ut-button:bg-indigo-600 ut-button:hover:bg-indigo-700 ut-button:text-sm ut-button:font-medium"
          />
          {uploadedFiles.length > 0 && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Upload className="w-3 h-3" /> {uploadedFiles.length} file(s) ready
            </p>
          )}
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            placeholder="Add a note about your delivery..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          <button onClick={() => action("deliver", { note, fileUrls: uploadedFiles })}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            Submit Delivery
          </button>
        </div>
      )}

      {/* Client: accept or dispute */}
      {isClient && status === "DELIVERED" && (
        <div className="space-y-2">
          <button onClick={() => action("complete")} disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Accept & Release Payment
          </button>
          <button onClick={() => action("dispute")} disabled={loading}
            className="w-full bg-white border border-red-200 text-red-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Open Dispute
          </button>
        </div>
      )}

      {/* Client: leave review */}
      {isClient && status === "COMPLETED" && !hasReview && (
        <>
          {!showReview ? (
            <button onClick={() => setShowReview(true)}
              className="w-full bg-amber-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
              <Star className="w-4 h-4" /> Leave a Review
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRating(n)}
                    className={`text-2xl transition-transform hover:scale-110 ${n <= rating ? "text-amber-400" : "text-gray-200"}`}>
                    ★
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} minLength={10}
                placeholder="Share your experience..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              <button onClick={submitReview} disabled={loading || comment.length < 10}
                className="w-full bg-amber-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors">
                Submit Review
              </button>
            </div>
          )}
        </>
      )}

      {status === "COMPLETED" && hasReview && (
        <p className="text-sm text-green-600 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" /> Review submitted
        </p>
      )}

      {["CANCELLED", "REFUNDED", "DISPUTED"].includes(status) && (
        <p className="text-sm text-gray-500 text-center">This order is {status.toLowerCase()}.</p>
      )}
    </div>
  );
}
