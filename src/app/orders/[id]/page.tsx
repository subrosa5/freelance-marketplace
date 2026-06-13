import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import OrderChat from "./OrderChat";
import OrderActions from "./OrderActions";
import { Clock, CheckCircle, AlertCircle, Package, MessageCircle } from "lucide-react";

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-700" },
  DELIVERED: { label: "Delivered", color: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700" },
  DISPUTED: { label: "Disputed", color: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Refunded", color: "bg-gray-100 text-gray-600" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600" },
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      gig: { select: { id: true, title: true, images: true } },
      client: { select: { id: true, name: true } },
      freelancer: { select: { id: true, name: true } },
      files: true,
      review: true,
    },
  });

  if (!order || (order.clientId !== user.id && order.freelancerId !== user.id)) notFound();

  const isClient = order.clientId === user.id;
  const isFreelancer = order.freelancerId === user.id;
  const status = STATUS_STYLES[order.status] ?? STATUS_STYLES.OPEN;

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 mb-1">Order #{order.id.slice(-8).toUpperCase()}</p>
              <h1 className="text-xl font-bold text-gray-900">{order.gig.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {isClient ? `Freelancer: ${order.freelancer.name}` : `Client: ${order.client.name}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                {status.label}
              </span>
              <span className="text-2xl font-bold text-gray-900">${(order.price / 100).toFixed(0)}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-2 mt-5 flex-wrap">
            {[
              { step: "OPEN", label: "Ordered", icon: Package },
              { step: "IN_PROGRESS", label: "In Progress", icon: Clock },
              { step: "DELIVERED", label: "Delivered", icon: MessageCircle },
              { step: "COMPLETED", label: "Completed", icon: CheckCircle },
            ].map(({ step, label, icon: Icon }, i, arr) => {
              const steps = ["OPEN", "IN_PROGRESS", "DELIVERED", "COMPLETED"];
              const currentIdx = steps.indexOf(order.status);
              const stepIdx = steps.indexOf(step);
              const done = currentIdx >= stepIdx;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${done ? "text-indigo-600" : "text-gray-300"}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                  {i < arr.length - 1 && <div className={`w-8 h-px ${done && currentIdx > stepIdx ? "bg-indigo-300" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Chat */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm">Messages</h2>
              </div>
              <OrderChat orderId={order.id} currentUserId={user.id} />
            </div>
          </div>

          {/* Actions + files */}
          <div className="lg:col-span-2 space-y-5">
            <OrderActions
              orderId={order.id}
              status={order.status}
              isClient={isClient}
              isFreelancer={isFreelancer}
              hasReview={!!order.review}
            />

            {/* Deliverable files */}
            {order.files.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-indigo-500" /> Deliverables
                </h3>
                <div className="space-y-2">
                  {order.files.map((f) => (
                    <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                      📎 {f.name}
                    </a>
                  ))}
                </div>
                {order.deliverableNote && (
                  <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">{order.deliverableNote}</p>
                )}
              </div>
            )}

            {/* Requirements */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Requirements</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{order.requirements}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
