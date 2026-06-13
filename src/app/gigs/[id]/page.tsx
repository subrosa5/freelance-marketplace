import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import OrderButton from "./OrderButton";
import { Star, Clock, Package, CheckCircle } from "lucide-react";

async function getGig(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/gigs/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function GigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gig = await getGig(id);
  if (!gig) notFound();

  return (
    <div className="bg-[#080808] min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 pt-4">

          {/* Left */}
          <div className="lg:col-span-2 space-y-6">

            {/* Freelancer */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-950 border border-red-900 flex items-center justify-center font-bold text-red-400 text-sm shrink-0">
                {gig.freelancer.name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{gig.freelancer.name}</p>
                {gig.freelancer.rating > 0 && (
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`w-3 h-3 ${n <= Math.round(gig.freelancer.rating) ? "fill-red-600 stroke-none" : "fill-neutral-800 stroke-none"}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-500">{gig.freelancer.rating.toFixed(1)} ({gig.freelancer.reviewCount})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight">{gig.title}</h1>

            {/* Image */}
            <div className="aspect-video bg-neutral-950 overflow-hidden border border-neutral-900">
              {gig.images[0] ? (
                <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-800 text-[10px] tracking-widest uppercase">No Preview</div>
              )}
            </div>

            {/* Order card on mobile — shows here, before description */}
            <div className="lg:hidden bg-[#0d0d0d] border border-neutral-900 p-5">
              <div className="text-3xl font-black text-white mb-1">${(gig.price / 100).toFixed(0)}</div>
              <p className="text-xs text-neutral-600 mb-5 leading-relaxed line-clamp-2">{gig.title}</p>
              <div className="space-y-2 mb-5 pb-5 border-b border-neutral-900">
                <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                  <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" /> {gig.deliveryDays}-day delivery
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                  <Package className="w-3.5 h-3.5 text-red-600 shrink-0" /> {gig.orderCount} orders completed
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                  <CheckCircle className="w-3.5 h-3.5 text-red-600 shrink-0" /> Secure escrow payment
                </div>
              </div>
              <OrderButton gig={gig} />
            </div>

            {/* Description */}
            <div className="border-l-2 border-red-600 pl-5">
              <h2 className="text-[10px] text-neutral-600 uppercase tracking-[0.3em] mb-3">About this gig</h2>
              <p className="text-neutral-400 leading-relaxed text-sm whitespace-pre-line">{gig.description}</p>
            </div>

            {/* Tags */}
            {gig.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {gig.tags.map((tag: string) => (
                  <span key={tag} className="border border-neutral-800 text-neutral-600 text-[10px] px-3 py-1 tracking-widest uppercase">{tag}</span>
                ))}
              </div>
            )}

            {/* About seller */}
            {gig.freelancer.bio && (
              <div className="bg-[#0d0d0d] border border-neutral-900 p-5">
                <h2 className="text-[10px] text-neutral-600 uppercase tracking-[0.3em] mb-3">About the seller</h2>
                <p className="text-sm text-neutral-500 leading-relaxed">{gig.freelancer.bio}</p>
                {gig.freelancer.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {gig.freelancer.skills.map((s: string) => (
                      <span key={s} className="border border-neutral-800 text-neutral-600 text-[10px] px-3 py-1 tracking-widest uppercase">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            {gig.reviews.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <span className="w-6 h-px bg-red-600" />
                  <h2 className="text-[10px] text-neutral-600 uppercase tracking-[0.3em]">Reviews</h2>
                </div>
                <div className="space-y-px">
                  {gig.reviews.map((r: { id: string; author: { name: string }; rating: number; comment: string }) => (
                    <div key={r.id} className="bg-[#0d0d0d] border-l-2 border-neutral-900 p-5">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="text-xs text-white font-medium tracking-wide truncate">{r.author.name}</span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} className={`w-3 h-3 ${n <= r.rating ? "fill-red-600 stroke-none" : "fill-neutral-800 stroke-none"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — desktop only sticky card */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-[#0d0d0d] border border-neutral-900 p-6 sticky top-20">
              <div className="text-4xl font-black text-white mb-1">${(gig.price / 100).toFixed(0)}</div>
              <p className="text-xs text-neutral-600 mb-6 leading-relaxed line-clamp-2">{gig.title}</p>
              <div className="space-y-3 mb-6 pb-6 border-b border-neutral-900">
                <div className="flex items-center gap-3 text-xs text-neutral-600">
                  <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" /> {gig.deliveryDays}-day delivery
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-600">
                  <Package className="w-3.5 h-3.5 text-red-600 shrink-0" /> {gig.orderCount} orders completed
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-600">
                  <CheckCircle className="w-3.5 h-3.5 text-red-600 shrink-0" /> Secure escrow payment
                </div>
              </div>
              <OrderButton gig={gig} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
