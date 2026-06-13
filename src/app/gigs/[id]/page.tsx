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
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{gig.title}</h1>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700">
                {gig.freelancer.name[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">{gig.freelancer.name}</p>
                {gig.freelancer.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 stroke-none" />
                    <span className="font-medium">{gig.freelancer.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({gig.freelancer.reviewCount} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gig preview */}
            <div className="aspect-video bg-indigo-50 rounded-2xl flex items-center justify-center text-6xl">
              {gig.images[0] ? (
                <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover rounded-2xl" />
              ) : "🎨"}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About this gig</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{gig.description}</p>
            </div>

            {gig.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {gig.tags.map((tag: string) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}

            {/* About freelancer */}
            {gig.freelancer.bio && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-3">About the seller</h2>
                <p className="text-sm text-gray-600">{gig.freelancer.bio}</p>
                {gig.freelancer.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {gig.freelancer.skills.map((s: string) => (
                      <span key={s} className="bg-white border border-gray-200 text-xs text-gray-600 px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            {gig.reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>
                <div className="space-y-4">
                  {gig.reviews.map((r: { id: string; author: { name: string }; rating: number; comment: string; createdAt: string }) => (
                    <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900">{r.author.name}</span>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? "fill-amber-400 stroke-none text-amber-400" : "text-gray-200 fill-gray-200 stroke-none"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — order card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24 shadow-sm">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${(gig.price / 100).toFixed(0)}
              </div>
              <p className="text-sm text-gray-500 mb-5">{gig.title}</p>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {gig.deliveryDays}-day delivery
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4 text-gray-400" />
                  {gig.orderCount} orders completed
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Secure escrow payment
                </div>
              </div>

              <OrderButton gig={gig} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
