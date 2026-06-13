"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

type Gig = { id: string; title: string; price: number; freelancerId: string };

export default function OrderButton({ gig }: { gig: Gig }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [requirements, setRequirements] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <button
        onClick={() => router.push("/auth/login")}
        className="w-full bg-red-600 text-white py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-red-500 transition-colors duration-200"
      >
        Sign in to Order
      </button>
    );
  }

  if (user.role === "FREELANCER" || user.id === gig.freelancerId) {
    return (
      <div className="text-center text-xs text-neutral-700 py-3 tracking-widest uppercase">
        {user.id === gig.freelancerId ? "This is your gig" : "Freelancers cannot place orders"}
      </div>
    );
  }

  async function handleOrder() {
    if (!requirements.trim()) { setError("Please describe your requirements"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gigId: gig.id, requirements }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push(`/orders/${data.order.id}`);
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-red-600 text-white py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-red-500 transition-colors duration-200"
      >
        Order Now — ${(gig.price / 100).toFixed(0)}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-[10px] text-red-500 border border-red-900 bg-red-950/30 px-3 py-2 tracking-wide">{error}</p>
      )}
      <div>
        <label className="block text-[10px] text-neutral-600 uppercase tracking-[0.3em] mb-2">
          Describe your requirements
        </label>
        <textarea
          value={requirements}
          onChange={e => setRequirements(e.target.value)}
          rows={4}
          minLength={20}
          placeholder="Explain what you need in detail..."
          className="w-full bg-[#080808] border border-neutral-800 text-neutral-300 text-xs px-4 py-3 focus:outline-none focus:border-red-600 transition-colors duration-200 resize-none placeholder-neutral-800"
        />
      </div>
      <button
        onClick={handleOrder}
        disabled={loading}
        className="w-full bg-red-600 text-white py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-red-500 disabled:opacity-40 transition-colors duration-200"
      >
        {loading ? "Placing order..." : `Confirm — $${(gig.price / 100).toFixed(0)}`}
      </button>
      <button
        onClick={() => setShowForm(false)}
        className="w-full text-[10px] text-neutral-700 hover:text-neutral-500 tracking-widest uppercase transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
