import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Star, Clock } from "lucide-react";

const CATEGORIES = ["DESIGN", "DEVELOPMENT", "WRITING", "MARKETING", "VIDEO", "MUSIC", "BUSINESS", "OTHER"];

type Gig = {
  id: string;
  title: string;
  price: number;
  deliveryDays: number;
  images: string[];
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
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="w-full md:w-48 shrink-0">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Category</h3>
            <nav className="space-y-1">
              <Link href="/gigs" className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!category ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                All
              </Link>
              {CATEGORIES.map((c) => (
                <Link key={c} href={`/gigs?category=${c}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${category === c ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Gig grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">{total} gigs found</p>
            </div>

            {gigs.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-medium">No gigs found</p>
                <p className="text-sm mt-2">Try a different category or check back later.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {gigs.map((gig: Gig) => (
                  <Link key={gig.id} href={`/gigs/${gig.id}`} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group">
                    <div className="aspect-video bg-indigo-50 flex items-center justify-center text-4xl">
                      {gig.images[0] ? (
                        <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover" />
                      ) : "🎨"}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-semibold text-indigo-700">
                          {gig.freelancer.name[0]}
                        </div>
                        <span className="text-xs text-gray-500">{gig.freelancer.name}</span>
                        {gig.freelancer.rating > 0 && (
                          <span className="ml-auto flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                            <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                            {gig.freelancer.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {gig.title}
                      </h3>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" /> {gig.deliveryDays}d
                        </div>
                        <span className="font-bold text-gray-900">From ${(gig.price / 100).toFixed(0)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <Link key={p} href={`/gigs?${new URLSearchParams({ ...sp, page: String(p) })}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === currentPage ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
