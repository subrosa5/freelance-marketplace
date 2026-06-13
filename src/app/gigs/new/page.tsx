"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

const CATEGORIES = ["DESIGN", "DEVELOPMENT", "WRITING", "MARKETING", "VIDEO", "MUSIC", "BUSINESS", "OTHER"];

export default function NewGigPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", category: "DEVELOPMENT",
    price: "", deliveryDays: "", tags: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/gigs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Math.round(Number(form.price) * 100),
        deliveryDays: Number(form.deliveryDays),
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push(`/gigs/${data.id}`);
  }

  const inputClass = "w-full bg-[#0d0d0d] border border-neutral-800 text-white text-sm px-4 py-3 focus:outline-none focus:border-red-600 transition-colors duration-200 placeholder-neutral-800";
  const labelClass = "block text-[10px] text-neutral-600 uppercase tracking-[0.3em] mb-2";

  return (
    <div className="bg-[#080808] min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">

        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-8 h-px bg-red-600" />
            <span className="text-[10px] text-neutral-600 tracking-[0.3em] uppercase">Freelancer</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Post a <span className="text-red-600">Gig</span>
          </h1>
          <p className="text-neutral-600 text-xs mt-2 tracking-wide">Describe your service and start getting orders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-[10px] text-red-500 border border-red-900 bg-red-950/30 px-4 py-3 tracking-wide">{error}</p>
          )}

          <div>
            <label className={labelClass}>Title <span className="text-neutral-800 normal-case tracking-normal">— min 10 chars</span></label>
            <input
              value={form.title} onChange={set("title")} required minLength={10} maxLength={100}
              placeholder="I will design a professional logo for your brand"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description <span className="text-neutral-800 normal-case tracking-normal">— min 50 chars</span></label>
            <textarea
              value={form.description} onChange={set("description")} required minLength={50} rows={7}
              placeholder="Describe what you offer, your process, what's included..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-px bg-neutral-900">
            <div className="bg-[#080808] p-0">
              <label className={`${labelClass} pt-0`}>Category</label>
              <select
                value={form.category} onChange={set("category")}
                className={`${inputClass} cursor-pointer`}
                style={{ background: "#0d0d0d" }}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c} style={{ background: "#0d0d0d" }}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-[#080808]">
              <label className={labelClass}>Price (USD)</label>
              <input
                type="number" value={form.price} onChange={set("price")} required min={5} max={10000}
                placeholder="50"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-neutral-900">
            <div className="bg-[#080808]">
              <label className={labelClass}>Delivery (days)</label>
              <input
                type="number" value={form.deliveryDays} onChange={set("deliveryDays")} required min={1} max={90}
                placeholder="3"
                className={inputClass}
              />
            </div>
            <div className="bg-[#080808]">
              <label className={labelClass}>Tags <span className="text-neutral-800 normal-case tracking-normal">— comma-separated</span></label>
              <input
                value={form.tags} onChange={set("tags")}
                placeholder="logo, branding, design"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-red-600 text-white py-4 text-xs font-semibold tracking-widest uppercase hover:bg-red-500 disabled:opacity-40 transition-colors duration-200 mt-2"
          >
            {loading ? "Publishing..." : "Publish Gig"}
          </button>
        </form>
      </div>
    </div>
  );
}
