import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import OrderChat from "./OrderChat";
import OrderActions from "./OrderActions";
import { Clock, CheckCircle, Package, MessageCircle, Paperclip } from "lucide-react";

const STATUS_STYLES: Record<string, { label: string; dot: string; text: string }> = {
  OPEN:        { label: "Open",        dot: "bg-blue-500",    text: "text-blue-400" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-yellow-500",  text: "text-yellow-400" },
  DELIVERED:   { label: "Delivered",   dot: "bg-purple-500",  text: "text-purple-400" },
  COMPLETED:   { label: "Completed",   dot: "bg-red-500",     text: "text-red-400" },
  DISPUTED:    { label: "Disputed",    dot: "bg-orange-500",  text: "text-orange-400" },
  REFUNDED:    { label: "Refunded",    dot: "bg-neutral-600", text: "text-neutral-500" },
  CANCELLED:   { label: "Cancelled",   dot: "bg-neutral-600", text: "text-neutral-500" },
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
  const steps = ["OPEN", "IN_PROGRESS", "DELIVERED", "COMPLETED"];
  const currentIdx = steps.indexOf(order.status);

  return (
    <div className="bg-[#080808] min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-16">

        {/* Header */}
        <div className="bg-[#0d0d0d] border border-neutral-900 p-4 md:p-6 mb-4 mt-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-[9px] md:text-[10px] text-neutral-700 tracking-[0.3em] uppercase mb-1.5">
                Order #{order.id.slice(-8).toUpperCase()}
              </p>
              <h1 className="text-base md:text-xl font-black text-white tracking-tight leading-tight">{order.gig.title}</h1>
              <p className="text-xs text-neutral-600 mt-1 tracking-wide">
                {isClient ? `Freelancer: ${order.freelancer.name}` : `Client: ${order.client.name}`}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                <span className={`text-[9px] md:text-xs tracking-widest uppercase font-semibold ${status.text}`}>{status.label}</span>
              </div>
              <span className="text-xl md:text-2xl font-black text-white tabular-nums">${(order.price / 100).toFixed(0)}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center mt-5 overflow-x-auto pb-1">
            {[
              { step: "OPEN", label: "Ordered", icon: Package },
              { step: "IN_PROGRESS", label: "Working", icon: Clock },
              { step: "DELIVERED", label: "Delivered", icon: MessageCircle },
              { step: "COMPLETED", label: "Done", icon: CheckCircle },
            ].map(({ step, label, icon: Icon }, i, arr) => {
              const stepIdx = steps.indexOf(step);
              const done = currentIdx >= stepIdx;
              const active = currentIdx === stepIdx;
              return (
                <div key={step} className="flex items-center flex-1 min-w-0">
                  <div className={`flex flex-col items-center gap-1 shrink-0 ${done ? "opacity-100" : "opacity-25"}`}>
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full border transition-colors ${active ? "border-red-600 bg-red-600" : done ? "border-neutral-600 bg-neutral-800" : "border-neutral-800"}`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className={`text-[8px] md:text-[9px] tracking-widest uppercase whitespace-nowrap ${done ? "text-neutral-500" : "text-neutral-800"}`}>{label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`flex-1 h-px mx-1 md:mx-2 mb-4 ${currentIdx > stepIdx ? "bg-neutral-700" : "bg-neutral-900"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Actions first, then chat */}
        <div className="lg:hidden space-y-4 mb-4">
          <OrderActions orderId={order.id} status={order.status} isClient={isClient} isFreelancer={isFreelancer} hasReview={!!order.review} />

          {order.files.length > 0 && (
            <div className="bg-[#0d0d0d] border border-neutral-900 p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-4 h-px bg-red-600" />
                <h3 className="text-[10px] text-neutral-600 uppercase tracking-[0.3em]">Deliverables</h3>
              </div>
              <div className="space-y-2">
                {order.files.map((f) => (
                  <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-red-600 hover:text-red-500 transition-colors">
                    <Paperclip className="w-3 h-3 shrink-0" /><span className="truncate">{f.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#0d0d0d] border border-neutral-900 p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-4 h-px bg-red-600" />
              <h3 className="text-[10px] text-neutral-600 uppercase tracking-[0.3em]">Requirements</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">{order.requirements}</p>
          </div>
        </div>

        {/* Desktop: 5-col grid */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-[#0d0d0d] border border-neutral-900 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-neutral-900 flex items-center gap-3">
                <span className="w-4 h-px bg-red-600" />
                <h2 className="text-[10px] text-neutral-600 uppercase tracking-[0.3em]">Messages</h2>
              </div>
              <OrderChat orderId={order.id} currentUserId={user.id} />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <OrderActions orderId={order.id} status={order.status} isClient={isClient} isFreelancer={isFreelancer} hasReview={!!order.review} />
            {order.files.length > 0 && (
              <div className="bg-[#0d0d0d] border border-neutral-900 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-4 h-px bg-red-600" />
                  <h3 className="text-[10px] text-neutral-600 uppercase tracking-[0.3em]">Deliverables</h3>
                </div>
                <div className="space-y-2">
                  {order.files.map((f) => (
                    <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-red-600 hover:text-red-500 transition-colors">
                      <Paperclip className="w-3 h-3 shrink-0" /> {f.name}
                    </a>
                  ))}
                </div>
                {order.deliverableNote && (
                  <p className="text-xs text-neutral-600 mt-4 pt-4 border-t border-neutral-900 leading-relaxed">{order.deliverableNote}</p>
                )}
              </div>
            )}
            <div className="bg-[#0d0d0d] border border-neutral-900 p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-4 h-px bg-red-600" />
                <h3 className="text-[10px] text-neutral-600 uppercase tracking-[0.3em]">Requirements</h3>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">{order.requirements}</p>
            </div>
          </div>
        </div>

        {/* Mobile: Chat below */}
        <div className="lg:hidden">
          <div className="bg-[#0d0d0d] border border-neutral-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-900 flex items-center gap-3">
              <span className="w-4 h-px bg-red-600" />
              <h2 className="text-[10px] text-neutral-600 uppercase tracking-[0.3em]">Messages</h2>
            </div>
            <OrderChat orderId={order.id} currentUserId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
