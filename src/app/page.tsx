import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import { Shield, Zap, Star, ArrowRight } from "lucide-react";

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
    <div className="bg-[#080808] min-h-screen">
      <Navbar />
      <main>
        <HeroSection gigCount={gigCount} userCount={userCount} />

        {/* Categories */}
        <section className="bg-[#080808] px-4 py-24 border-t border-neutral-900">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <span className="w-8 h-px bg-red-600" />
              <h2 className="text-xs text-neutral-500 tracking-[0.3em] uppercase">Browse by Category</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-neutral-900">
              {[
                { name: "Design", icon: "◈", slug: "DESIGN" },
                { name: "Development", icon: "⌨", slug: "DEVELOPMENT" },
                { name: "Writing", icon: "✦", slug: "WRITING" },
                { name: "Marketing", icon: "◎", slug: "MARKETING" },
                { name: "Video", icon: "▶", slug: "VIDEO" },
                { name: "Music", icon: "♩", slug: "MUSIC" },
                { name: "Business", icon: "◆", slug: "BUSINESS" },
                { name: "Other", icon: "⊕", slug: "OTHER" },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/gigs?category=${cat.slug}`}
                  className="group bg-[#0d0d0d] p-8 hover:bg-[#111] transition-all duration-300 flex flex-col gap-3"
                >
                  <span className="text-2xl text-neutral-700 group-hover:text-red-600 transition-colors duration-300 font-mono">
                    {cat.icon}
                  </span>
                  <span className="text-sm font-medium text-neutral-400 group-hover:text-white transition-colors duration-300 tracking-wide">
                    {cat.name}
                  </span>
                  <ArrowRight className="w-3 h-3 text-neutral-800 group-hover:text-red-600 transition-all duration-300 group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-24 border-t border-neutral-900">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <span className="w-8 h-px bg-red-600" />
              <h2 className="text-xs text-neutral-500 tracking-[0.3em] uppercase">Why FreelanceHub</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-px bg-neutral-900">
              {[
                {
                  icon: Shield,
                  title: "Escrow Protection",
                  desc: "Your payment is locked until you approve the delivery. If something goes wrong, you get a full refund.",
                  stat: "100%",
                  statLabel: "Secure",
                },
                {
                  icon: Zap,
                  title: "Real-time Collaboration",
                  desc: "Built-in chat on every order. Share files, updates, and feedback — no email chains.",
                  stat: "<1s",
                  statLabel: "Latency",
                },
                {
                  icon: Star,
                  title: "Verified Reviews",
                  desc: "Every review is tied to a real completed order. No fake ratings, no incentivized reviews.",
                  stat: "4.9",
                  statLabel: "Avg Rating",
                },
              ].map(({ icon: Icon, title, desc, stat, statLabel }) => (
                <div key={title} className="bg-[#0d0d0d] p-10 group">
                  <div className="flex items-start justify-between mb-8">
                    <Icon className="w-5 h-5 text-red-600" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white tabular-nums">{stat}</div>
                      <div className="text-[10px] text-neutral-600 uppercase tracking-widest">{statLabel}</div>
                    </div>
                  </div>
                  <h3 className="text-white font-semibold mb-3 tracking-wide">{title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-32 border-t border-neutral-900 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-[10px] text-neutral-700 tracking-[0.4em] uppercase mb-6">Get Started Today</p>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-none">
              Ready to hire<br />
              <span className="text-red-600">elite talent?</span>
            </h2>
            <p className="text-neutral-600 text-sm mb-12 tracking-wide">
              Join clients and freelancers who trust FreelanceHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-12 py-4 bg-red-600 text-white text-sm font-semibold tracking-widest uppercase hover:bg-red-500 transition-colors duration-200"
              >
                Hire a Freelancer
              </Link>
              <Link
                href="/auth/register?role=FREELANCER"
                className="px-12 py-4 border border-neutral-800 text-neutral-500 text-sm font-semibold tracking-widest uppercase hover:border-neutral-600 hover:text-white transition-colors duration-200"
              >
                Become a Freelancer
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-900 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-neutral-800 text-xs tracking-widest uppercase">
            © 2025 FreelanceHub
          </span>
          <span className="text-neutral-800 text-xs tracking-widest uppercase">
            Next.js · Stripe · Pusher · Neon
          </span>
        </div>
      </footer>
    </div>
  );
}
