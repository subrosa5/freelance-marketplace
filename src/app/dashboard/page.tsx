import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import { PlusCircle, Package, Star, DollarSign, ArrowRight } from "lucide-react";

const STATUS_STYLES: Record<string, { label: string; dot: string; text: string }> = {
  OPEN:        { label: "Open",        dot: "bg-blue-500",    text: "text-blue-400" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-yellow-500",  text: "text-yellow-400" },
  DELIVERED:   { label: "Delivered",   dot: "bg-purple-500",  text: "text-purple-400" },
  COMPLETED:   { label: "Completed",   dot: "bg-red-500",     text: "text-red-400" },
  DISPUTED:    { label: "Disputed",    dot: "bg-orange-500",  text: "text-orange-400" },
  CANCELLED:   { label: "Cancelled",   dot: "bg-neutral-600", text: "text-neutral-500" },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const isFreelancer = user.role === "FREELANCER";

  const [orders, gigs] = await Promise.all([
    prisma.order.findMany({
      where: isFreelancer ? { freelancerId: user.id } : { clientId: user.id },
      include: {
        gig: { select: { title: true } },
        client: { select: { name: true } },
        freelancer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    isFreelancer
      ? prisma.gig.findMany({ where: { freelancerId: user.id }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
  ]);

  const stats = {
    totalOrders: orders.length,
    completed: orders.filter(o => o.status === "COMPLETED").length,
    earnings: isFreelancer
      ? orders.filter(o => o.status === "COMPLETED").reduce((s, o) => s + o.price, 0)
      : orders.reduce((s, o) => s + o.price, 0),
  };

  return (
    <div className="bg-[#080808] min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 pt-4 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-px bg-red-600" />
              <span className="text-[10px] text-neutral-600 tracking-[0.3em] uppercase">{user.role}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">Dashboard</h1>
            <p className="text-neutral-600 text-xs md:text-sm mt-1 tracking-wide">Welcome back, {user.name}</p>
          </div>
          {isFreelancer && (
            <Link
              href="/gigs/new"
              className="shrink-0 flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 text-[10px] font-semibold tracking-widest uppercase hover:bg-red-500 transition-colors duration-200"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Gig</span>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-neutral-900 mb-8">
          {[
            { label: "Orders", value: stats.totalOrders, icon: Package },
            { label: "Done", value: stats.completed, icon: Star },
            { label: isFreelancer ? "Earned" : "Spent", value: `$${(stats.earnings / 100).toFixed(0)}`, icon: DollarSign },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[#0d0d0d] p-4 md:p-8">
              <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600 mb-3" />
              <div className="text-xl md:text-3xl font-black text-white tabular-nums">{value}</div>
              <div className="text-[9px] md:text-[10px] text-neutral-600 uppercase tracking-widest mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Orders */}
          <div className={isFreelancer ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-5 h-px bg-red-600" />
              <h2 className="text-[10px] text-neutral-600 uppercase tracking-[0.3em]">Recent Orders</h2>
            </div>

            {orders.length === 0 ? (
              <div className="border border-neutral-900 p-10 text-center">
                <p className="text-neutral-700 text-xs tracking-widest uppercase mb-4">No orders yet</p>
                {!isFreelancer && (
                  <Link href="/gigs" className="inline-flex items-center gap-2 text-red-600 text-xs tracking-widest uppercase hover:text-red-500 transition-colors">
                    Browse gigs <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-px">
                {orders.map((order) => {
                  const s = STATUS_STYLES[order.status] ?? STATUS_STYLES.OPEN;
                  return (
                    <Link key={order.id} href={`/orders/${order.id}`}
                      className="group bg-[#0d0d0d] hover:bg-[#111] transition-colors p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-medium text-neutral-300 group-hover:text-white transition-colors truncate">
                          {order.gig.title}
                        </p>
                        <p className="text-[10px] text-neutral-700 mt-0.5 truncate">
                          {isFreelancer ? order.client.name : order.freelancer.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <div className="hidden sm:flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                          <span className={`text-[9px] tracking-widest uppercase ${s.text}`}>{s.label}</span>
                        </div>
                        <div className="sm:hidden">
                          <span className={`w-2 h-2 rounded-full block ${s.dot}`} />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-white tabular-nums">${(order.price / 100).toFixed(0)}</span>
                        <ArrowRight className="w-3 h-3 text-neutral-800 group-hover:text-red-600 transition-colors hidden sm:block" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gigs */}
          {isFreelancer && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-5 h-px bg-red-600" />
                <h2 className="text-[10px] text-neutral-600 uppercase tracking-[0.3em]">Your Gigs</h2>
              </div>

              {gigs.length === 0 ? (
                <div className="border border-neutral-900 p-8 text-center">
                  <p className="text-neutral-700 text-xs tracking-widest uppercase mb-4">No gigs yet</p>
                  <Link href="/gigs/new" className="inline-flex items-center gap-2 text-red-600 text-xs tracking-widest uppercase hover:text-red-500 transition-colors">
                    Create gig <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-px">
                  {gigs.map((gig) => (
                    <Link key={gig.id} href={`/gigs/${gig.id}`}
                      className="group bg-[#0d0d0d] hover:bg-[#111] transition-colors p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-neutral-400 group-hover:text-white transition-colors truncate">{gig.title}</p>
                        <p className="text-[10px] text-neutral-700 mt-0.5">{gig.orderCount} orders</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-white tabular-nums">${(gig.price / 100).toFixed(0)}</span>
                        <ArrowRight className="w-3 h-3 text-neutral-800 group-hover:text-red-600 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
