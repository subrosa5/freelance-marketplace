import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import { PlusCircle, Package, Star, Clock } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  DELIVERED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  DISPUTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
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
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name}</p>
          </div>
          {isFreelancer && (
            <Link href="/gigs/new"
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
              <PlusCircle className="w-4 h-4" /> New Gig
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Orders", value: stats.totalOrders, icon: Package },
            { label: "Completed", value: stats.completed, icon: Star },
            { label: isFreelancer ? "Total Earned" : "Total Spent", value: `$${(stats.earnings / 100).toFixed(0)}`, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-sm text-gray-500">{label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Orders */}
          <div className={isFreelancer ? "lg:col-span-2" : "lg:col-span-3"}>
            <h2 className="font-semibold text-gray-900 mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <p className="text-gray-400 text-sm">No orders yet.</p>
                {!isFreelancer && (
                  <Link href="/gigs" className="mt-3 inline-block text-indigo-600 text-sm font-medium hover:underline">
                    Browse gigs →
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`}
                    className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-200 hover:shadow-sm transition-all">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{order.gig.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {isFreelancer ? `Client: ${order.client.name}` : `Freelancer: ${order.freelancer.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.status.replace("_", " ")}
                      </span>
                      <span className="font-bold text-sm text-gray-900">${(order.price / 100).toFixed(0)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Freelancer's gigs */}
          {isFreelancer && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-4">Your Gigs</h2>
              {gigs.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                  <p className="text-gray-400 text-sm mb-3">No gigs yet.</p>
                  <Link href="/gigs/new" className="text-indigo-600 text-sm font-medium hover:underline">
                    Create your first gig →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {gigs.map((gig) => (
                    <Link key={gig.id} href={`/gigs/${gig.id}`}
                      className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-200 transition-all">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{gig.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{gig.orderCount} orders</p>
                      </div>
                      <span className="font-bold text-sm text-gray-900 shrink-0 ml-3">
                        ${(gig.price / 100).toFixed(0)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
