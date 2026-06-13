"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "FREELANCER" ? "FREELANCER" : "CLIENT";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "FREELANCER">(defaultRole as "CLIENT" | "FREELANCER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setUser(data);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-red-600 font-black text-sm tracking-[0.2em] uppercase">
            FreelanceHub
          </Link>
          <h1 className="text-2xl font-black text-white mt-6 tracking-tight">Create Account</h1>
          <p className="text-neutral-600 text-xs mt-2 tracking-widest uppercase">Join the marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-xs text-red-500 bg-red-950/40 border border-red-900 px-4 py-3 tracking-wide">
              {error}
            </p>
          )}

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-px bg-neutral-900">
            {(["CLIENT", "FREELANCER"] as const).map((r) => (
              <button
                key={r} type="button" onClick={() => setRole(r)}
                className={`py-3 text-[10px] font-semibold tracking-widest uppercase transition-colors duration-200 ${
                  role === r
                    ? "bg-red-600 text-white"
                    : "bg-[#0d0d0d] text-neutral-600 hover:text-white"
                }`}
              >
                {r === "CLIENT" ? "I'm Hiring" : "I'm a Freelancer"}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Full Name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} required minLength={2}
              className="w-full bg-[#0d0d0d] border border-neutral-800 text-white text-sm px-4 py-3 focus:outline-none focus:border-red-600 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-[#0d0d0d] border border-neutral-800 text-white text-sm px-4 py-3 focus:outline-none focus:border-red-600 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full bg-[#0d0d0d] border border-neutral-800 text-white text-sm px-4 py-3 focus:outline-none focus:border-red-600 transition-colors duration-200"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-red-600 text-white py-3 text-xs font-semibold tracking-widest uppercase hover:bg-red-500 disabled:opacity-40 transition-colors duration-200 mt-2"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-neutral-900" />
            <span className="text-[10px] text-neutral-700 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-neutral-900" />
          </div>

          <a
            href="/api/auth/github"
            className="w-full flex items-center justify-center gap-2.5 border border-neutral-800 py-3 text-xs text-neutral-500 font-medium tracking-widest uppercase hover:border-neutral-700 hover:text-white transition-colors duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </a>
        </form>

        <p className="text-center text-xs text-neutral-700 mt-8 tracking-widest uppercase">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-red-600 hover:text-red-500 transition-colors">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
