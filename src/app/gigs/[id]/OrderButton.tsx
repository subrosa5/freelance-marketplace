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
      <button onClick={() => router.push("/auth/login")}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
        Sign in to Order
      </button>
    );
  }

  if (user.role === "FREELANCER" || user.id === gig.freelancerId) {
    return (
      <div className="text-center text-sm text-gray-400 py-3">
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
      <button onClick={() => setShowForm(true)}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
        Order Now — ${(gig.price / 100).toFixed(0)}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Describe your requirements</label>
        <textarea
          value={requirements} onChange={e => setRequirements(e.target.value)}
          rows={4} minLength={20}
          placeholder="Explain what you need in detail..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>
      <button onClick={handleOrder} disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
        {loading ? "Placing order..." : `Confirm Order — $${(gig.price / 100).toFixed(0)}`}
      </button>
      <button onClick={() => setShowForm(false)} className="w-full text-sm text-gray-400 hover:text-gray-600">
        Cancel
      </button>
    </div>
  );
}
