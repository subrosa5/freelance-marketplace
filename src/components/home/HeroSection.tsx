"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection({ gigCount, userCount }: { gigCount: number; userCount: number }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen bg-[#080808] flex flex-col items-center justify-center overflow-hidden px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 40% at 50% 45%, rgba(220,38,38,0.07) 0%, transparent 70%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div className="relative z-10 text-center w-full max-w-5xl">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 mb-8 md:mb-10 opacity-0"
          style={ready ? { animation: "fade-up 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) forwards" } : {}}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
          <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-500 font-light">Freelance Marketplace</span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
        </div>

        {/* Title */}
        <h1
          className="text-[clamp(2.8rem,14vw,9rem)] font-black leading-none tracking-tighter text-red-600 uppercase opacity-0 select-none break-words"
          style={ready ? { animation: "emerge 1.8s 0.2s cubic-bezier(0.16,1,0.3,1) forwards" } : {}}
        >
          FreelanceHub
        </h1>

        {/* Divider */}
        <div className="my-6 md:my-8 flex justify-center">
          <div
            className="h-px w-16 md:w-24 bg-red-600 origin-left opacity-0"
            style={ready ? { animation: "line-grow 1s 1.2s cubic-bezier(0.16,1,0.3,1) forwards, fade-up 0.1s 1.2s forwards" } : {}}
          />
        </div>

        {/* Tagline */}
        <p
          className="text-neutral-400 text-base md:text-xl font-light tracking-wide mb-1 md:mb-2 opacity-0 px-2"
          style={ready ? { animation: "fade-up 0.8s 1.4s cubic-bezier(0.16,1,0.3,1) forwards" } : {}}
        >
          Elite freelancers. Secure payments. Zero compromise.
        </p>
        <p
          className="text-neutral-600 text-[10px] md:text-xs tracking-widest uppercase mb-10 md:mb-12 opacity-0"
          style={ready ? { animation: "fade-up 0.8s 1.55s cubic-bezier(0.16,1,0.3,1) forwards" } : {}}
        >
          Funds held in escrow · Released only on approval
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4 opacity-0"
          style={ready ? { animation: "fade-up 0.8s 1.7s cubic-bezier(0.16,1,0.3,1) forwards" } : {}}
        >
          <Link
            href="/gigs"
            className="w-full sm:w-auto px-8 md:px-10 py-4 bg-red-600 text-white text-xs font-semibold tracking-widest uppercase hover:bg-red-500 transition-colors duration-200 text-center"
          >
            Browse Gigs
          </Link>
          <Link
            href="/auth/register?role=FREELANCER"
            className="w-full sm:w-auto px-8 md:px-10 py-4 border border-neutral-700 text-neutral-400 text-xs font-semibold tracking-widest uppercase hover:border-red-600 hover:text-white transition-colors duration-200 text-center"
          >
            Offer Services
          </Link>
        </div>

        {/* Stats */}
        <div
          className="mt-16 md:mt-20 grid grid-cols-3 gap-4 md:gap-8 max-w-sm md:max-w-lg mx-auto opacity-0"
          style={ready ? { animation: "fade-up 0.8s 1.9s cubic-bezier(0.16,1,0.3,1) forwards" } : {}}
        >
          {[
            { value: gigCount || "14", label: "Active Gigs" },
            { value: userCount || "7", label: "Members" },
            { value: "4.9", label: "Avg Rating" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-xl md:text-2xl font-bold text-white tabular-nums">{s.value}</div>
              <div className="text-[9px] md:text-xs text-neutral-600 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />

      <div
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
        style={ready ? { animation: "fade-up 0.8s 2.2s cubic-bezier(0.16,1,0.3,1) forwards" } : {}}
      >
        <span className="text-[9px] text-neutral-700 tracking-widest uppercase">Scroll</span>
        <div className="w-px h-6 md:h-8 bg-gradient-to-b from-neutral-700 to-transparent" />
      </div>
    </section>
  );
}
