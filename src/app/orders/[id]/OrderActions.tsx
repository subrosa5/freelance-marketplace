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

  const btnPrimary = "w-full py-3 text-xs font-semibold tracking-widest uppercase transition-colors duration-200 disabled:opacity-40 flex items-center justify-center gap-2";

  return (
    <div className="bg-[#0d0d0d] border border-neutral-900 p-5 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-4 h-px bg-red-600" />
        <h3 className="text-[10px] text-neutral-600 uppercase tracking-[0.3em]">Actions</h3>
      </div>

      {/* Freelancer: start */}
      {isFreelancer && status === "OPEN" && (
        <button
          onClick={() => action("deliver")}
          className={`${btnPrimary} bg-yellow-600 text-white hover:bg-yellow-500`}
          disabled={loading}
        >
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
            className="ut-button:bg-neutral-800 ut-button:hover:bg-neutral-700 ut-button:text-xs ut-button:font-medium ut-button:tracking-widest ut-button:uppercase ut-button:text-white"
          />
          {uploadedFiles.length > 0 && (
            <p className="text-[10px] text-red-500 flex items-center gap-1.5 tracking-widest uppercase">
              <Upload className="w-3 h-3" /> {uploadedFiles.length} file(s) ready
            </p>
          )}
          <textarea
            value={note} onChange={e => setNote(e.target.value)} rows={3}
            placeholder="Add a note about your delivery..."
            className="w-full bg-[#080808] border border-neutral-800 text-neutral-400 text-xs px-4 py-3 focus:outline-none focus:border-red-600 transition-colors duration-200 resize-none placeholder-neutral-800"
          />
          <button
            onClick={() => action("deliver", { note, fileUrls: uploadedFiles })}
            disabled={loading}
            className={`${btnPrimary} bg-red-600 text-white hover:bg-red-500`}
          >
            Submit Delivery
          </button>
        </div>
      )}

      {/* Client: accept or dispute */}
      {isClient && status === "DELIVERED" && (
        <div className="space-y-2">
          <button
            onClick={() => action("complete")} disabled={loading}
            className={`${btnPrimary} bg-red-600 text-white hover:bg-red-500`}
          >
            <CheckCircle className="w-3.5 h-3.5" /> Accept & Release Payment
          </button>
          <button
            onClick={() => action("dispute")} disabled={loading}
            className={`${btnPrimary} border border-neutral-800 text-neutral-500 hover:border-red-900 hover:text-red-600`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Open Dispute
          </button>
        </div>
      )}

      {/* Client: review */}
      {isClient && status === "COMPLETED" && !hasReview && (
        <>
          {!showReview ? (
            <button
              onClick={() => setShowReview(true)}
              className={`${btnPrimary} border border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-white`}
            >
              <Star className="w-3.5 h-3.5" /> Leave a Review
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n} onClick={() => setRating(n)}
                    className={`text-2xl transition-all hover:scale-110 ${n <= rating ? "text-red-600" : "text-neutral-800"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment} onChange={e => setComment(e.target.value)} rows={3} minLength={10}
                placeholder="Share your experience..."
                className="w-full bg-[#080808] border border-neutral-800 text-neutral-400 text-xs px-4 py-3 focus:outline-none focus:border-red-600 transition-colors duration-200 resize-none placeholder-neutral-800"
              />
              <button
                onClick={submitReview} disabled={loading || comment.length < 10}
                className={`${btnPrimary} bg-red-600 text-white hover:bg-red-500`}
              >
                Submit Review
              </button>
            </div>
          )}
        </>
      )}

      {status === "COMPLETED" && hasReview && (
        <p className="text-xs text-neutral-600 flex items-center gap-2 tracking-widest uppercase">
          <CheckCircle className="w-3.5 h-3.5 text-red-600" /> Review submitted
        </p>
      )}

      {["CANCELLED", "REFUNDED", "DISPUTED"].includes(status) && (
        <p className="text-xs text-neutral-700 text-center tracking-widest uppercase">
          Order is {status.toLowerCase()}
        </p>
      )}
    </div>
  );
}
