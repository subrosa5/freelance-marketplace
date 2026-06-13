import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import { Search, Shield, Zap, Star } from "lucide-react";

async function getStats() {
  try {
    const [gigCount, userCount] = await Promise.all([
      prisma.gig.count({ where: { isPublished: true } }),
      prisma.user.count(),
    ]);
    return { gigCount, userCount };
  } catch {
    return { gigCount: 0, userCount: 0 };
  }
}

export default async function Home() {
  const { gigCount, userCount } = await getStats();

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find the perfect freelance<br />service for your business
            </h1>
            <p className="text-xl text-indigo-200 mb-10">
              Secure escrow payments · Real-time chat · Top-rated freelancers
            </p>
            <div className="flex gap-3 max-w-xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder='Try "website design" or "logo"'
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none"
                />
              </div>
              <Link
                href="/gigs"
                className="bg-white text-indigo-600 font-semibold px-6 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors whitespace-nowrap text-sm"
              >
                Search
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Active Gigs", value: gigCount.toLocaleString() },
              { label: "Members", value: userCount.toLocaleString() },
              { label: "Secure Payments", value: "100%" },
              { label: "Avg. Rating", value: "4.9 ★" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-indigo-600">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { name: "Design", emoji: "🎨", slug: "DESIGN" },
              { name: "Development", emoji: "💻", slug: "DEVELOPMENT" },
              { name: "Writing", emoji: "✍️", slug: "WRITING" },
              { name: "Marketing", emoji: "📢", slug: "MARKETING" },
              { name: "Video", emoji: "🎬", slug: "VIDEO" },
              { name: "Music", emoji: "🎵", slug: "MUSIC" },
              { name: "Business", emoji: "📊", slug: "BUSINESS" },
              { name: "Other", emoji: "⚡", slug: "OTHER" },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/gigs?category=${cat.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
              >
                <div className="text-2xl mb-2">{cat.emoji}</div>
                <div className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">{cat.name}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Why FreelanceHub?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: "Secure Escrow", desc: "Funds are held safely until you approve the delivery. Full refund if something goes wrong." },
                { icon: Zap, title: "Real-time Chat", desc: "Communicate directly with freelancers in real time, right inside each order." },
                { icon: Star, title: "Verified Reviews", desc: "All reviews come from real completed orders. No fake ratings." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-indigo-50 py-16 px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to start?</h2>
          <p className="text-gray-500 mb-8">Join thousands of clients and freelancers today.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Find Talent
            </Link>
            <Link href="/auth/register?role=FREELANCER" className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Offer Services
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 px-4 text-center text-sm text-gray-400">
        © 2025 FreelanceHub. Built with Next.js, Stripe, Pusher.
      </footer>
    </>
  );
}
