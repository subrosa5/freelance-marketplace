"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { LogOut, LayoutDashboard, PlusCircle, User, Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!user) {
      fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(data => {
        if (data) setUser(data);
      });
    }
  }, [user, setUser]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/90 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-red-600 font-black text-sm tracking-[0.15em] uppercase shrink-0">
            FreelanceHub
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs text-neutral-600 tracking-widest uppercase">
            <Link href="/gigs" className="hover:text-white transition-colors duration-200">Browse</Link>
            {user?.role === "FREELANCER" && (
              <Link href="/gigs/new" className="hover:text-white transition-colors duration-200 flex items-center gap-1.5">
                <PlusCircle className="w-3 h-3" /> Post Gig
              </Link>
            )}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-5">
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-white transition-colors duration-200 uppercase tracking-widest">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/profile" className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-white transition-colors duration-200 uppercase tracking-widest">
                  <User className="w-3.5 h-3.5" />
                  <span>{user.name.split(" ")[0]}</span>
                </Link>
                <button onClick={handleLogout} className="text-neutral-700 hover:text-red-600 transition-colors duration-200">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-xs text-neutral-600 hover:text-white transition-colors duration-200 uppercase tracking-widest">
                  Sign In
                </Link>
                <Link href="/auth/register" className="text-xs bg-red-600 text-white px-5 py-2 uppercase tracking-widest hover:bg-red-500 transition-colors duration-200">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-neutral-500 hover:text-white transition-colors p-1"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[#080808] pt-14 flex flex-col">
          <nav className="flex flex-col px-6 py-8 gap-0 flex-1">
            <Link href="/gigs" className="py-5 text-sm text-neutral-400 hover:text-white transition-colors border-b border-neutral-900 tracking-widest uppercase">
              Browse Gigs
            </Link>
            {user?.role === "FREELANCER" && (
              <Link href="/gigs/new" className="py-5 text-sm text-neutral-400 hover:text-white transition-colors border-b border-neutral-900 tracking-widest uppercase flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Post Gig
              </Link>
            )}
            {user ? (
              <>
                <Link href="/dashboard" className="py-5 text-sm text-neutral-400 hover:text-white transition-colors border-b border-neutral-900 tracking-widest uppercase flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link href="/profile" className="py-5 text-sm text-neutral-400 hover:text-white transition-colors border-b border-neutral-900 tracking-widest uppercase flex items-center gap-2">
                  <User className="w-4 h-4" /> {user.name.split(" ")[0]}
                </Link>
                <button onClick={handleLogout} className="py-5 text-sm text-red-600 hover:text-red-500 transition-colors text-left tracking-widest uppercase flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="py-5 text-sm text-neutral-400 hover:text-white transition-colors border-b border-neutral-900 tracking-widest uppercase">
                  Sign In
                </Link>
                <Link href="/auth/register" className="mt-6 bg-red-600 text-white text-center py-4 text-sm font-semibold tracking-widest uppercase hover:bg-red-500 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
