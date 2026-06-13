"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Briefcase, LogOut, User, LayoutDashboard, PlusCircle } from "lucide-react";

export default function Navbar() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Briefcase className="w-6 h-6" />
          FreelanceHub
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/gigs" className="hover:text-gray-900 transition-colors">Browse Gigs</Link>
          {user?.role === "FREELANCER" && (
            <Link href="/gigs/new" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              <PlusCircle className="w-4 h-4" /> Post Gig
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link href="/profile" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
