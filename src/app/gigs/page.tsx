import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Star, Clock, ArrowRight } from "lucide-react";

const CATEGORIES = ["DESIGN", "DEVELOPMENT", "WRITING", "MARKETING", "VIDEO", "MUSIC", "BUSINESS", "OTHER"];

type Gig = {
  id: string;
  title: string;
  price: number;
  deliveryDays: number;
  images: string[];
  category: string;
  freelancer: { name: string; avatar: string | null; rating: number };
};

async function getGigs(searchParams: Record<string, string>) {
  const params = new URLSearchParams(searchParams).toString();
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/gigs?${params}`, { cache: "no-store" });
  if (!res.ok) return { gigs: [], total: 0, pages: 0 };
  return res.json();
}

export default async function GigsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { gigs, total, pages } = await getGigs(sp);
  const currentPage = Number(sp.page ?? 1);
  const category = sp.category;

  return (
    <div className="bg-[#080808] min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">

        {/* Header */}
        <div className="mb-8 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-6 h-px bg-red-600" />
            <span className="text-[10px] text-neutral-600 tracking-[0.3em] uppercase">Marketplace</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
            Browse <span className="text-red-600">Gigs</span>
          </h1>
          <p className="text-neutral-600 text-xs mt-2 tracking-wide">{total} services available</p>
        </div>

        {/* Mobile category scroll */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide -mx-4 px-4">
          <Link
            href="/gigs"
            className={`shrink-0 px-4 py-2 text-[10px] tracking-widest uppercase whitespace-nowrap transition-colors ${!category ? "bg-red-600 text-white" : "bg-neutral-900 text-neutral-500"}`}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/gigs?category=${c}`}
              className={`shrink-0 px-4 py-2 text-[10px] tracking-widest uppercase whitespace-nowrap transition-colors ${category === c ? "bg-red-600 text-white" : "bg-neutral-900 text-neutral-500"}`}
            >
              {c.charAt(0) + c.slice(1).toLowerCase()}
            </Link>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-44 shrink-0">
            <p className="text-[10px] text-neutral-700 uppercase tracking-[0.3em] mb-4">Category</p>
            <nav className="space-y-px">
              <Link href="/gigs" className={`block px-4 py-2.5 text-xs tracking-widest uppercase transition-colors ${!category ? "bg-red-600 text-white" : "text-neutral-600 hover:text-white hover:bg-neutral-900"}`}>
                All
              </Link>
              {CATEGORIES.map((c) => (
                <Link key={c} href={`/gigs?category=${c}`}
                  className={`block px-4 py-2.5 text-xs tracking-widest uppercase transition-colors ${category === c ? "bg-red-600 text-white" : "text-neutral-600 hover:text-white hover:bg-neutral-900"}`}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {gigs.length === 0 ? (
              <div className="border border-neutral-900 p-16 text-center">
                <p className="text-neutral-600 text-xs tracking-widest uppercase">No gigs found</p>
                <p className="text-neutral-800 text-xs mt-2">Try a different category or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-900">
                {gigs.map((gig: Gig) => (
                  <Link key={gig.id} href={`/gigs/${gig.id}`}
                    className="group bg-[#0d0d0d] hover:bg-[#111] transition-colors duration-200 flex flex-col">
                    <div className="aspect-video overflow-hidden bg-neutral-950 relative">
                      {gig.images[0] ? (
                        <img src={gig.images[0]} alt={gig.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-800 text-[10px] tracking-widest uppercase">No Preview</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-red-950 flex items-center justify-center text-[10px] font-bold text-red-400 shrink-0">
                            {gig.freelancer.name[0]}
                          </div>
                          <span className="text-[10px] text-neutral-600 truncate">{gig.freelancer.name}</span>
                        </div>
                        {gig.freelancer.rating > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-red-500 font-semibold shrink-0 ml-2">
                            <Star className="w-2.5 h-2.5 fill-red-500 stroke-none" />
                            {gig.freelancer.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-neutral-300 line-clamp-2 group-hover:text-white transition-colors duration-200 leading-relaxed flex-1">
                        {gig.title}
                      </h3>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-900">
                        <div className="flex items-center gap-1 text-[10px] text-neutral-700 tracking-widest uppercase">
                          <Clock className="w-3 h-3" /> {gig.deliveryDays}d
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">${(gig.price / 100).toFixed(0)}</span>
                          <ArrowRight className="w-3 h-3 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center gap-px mt-10 flex-wrap">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <Link key={p} href={`/gigs?${new URLSearchParams({ ...sp, page: String(p) })}`}
                    className={`w-10 h-10 flex items-center justify-center text-xs font-medium tracking-widest transition-colors ${p === currentPage ? "bg-red-600 text-white" : "bg-neutral-900 text-neutral-600 hover:text-white"}`}>
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
