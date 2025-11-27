"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen text-white bg-black">
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header matching landing page */}
        <header className="flex flex-wrap items-center justify-between gap-3 pl-4 pr-0 py-4 md:gap-4 md:pl-12 md:pr-0 md:py-10">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 text-[#64ccc5]" />
          </button>

          <div className="hidden md:flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center gap-2 h-16 px-6 rounded-2xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 text-[#64ccc5]" />
              Back
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="relative">
              <div className="inline-flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl border border-white/30 bg-white/5 text-white/90">
                <LogIn className="h-4 w-4 md:h-7 md:w-7 text-[#64ccc5]" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-md">
            {/* Mobile: Hero section matching landing page */}
            <div className="mb-8 md:hidden text-center">
              <div className="inline-flex items-center justify-center p-3 bg-[#64ccc5]/10 rounded-xl mb-4 border border-[#64ccc5]/30">
                <LogIn className="w-8 h-8 text-[#64ccc5]" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-[0.6em] mb-2">
                SIGN IN
              </h1>
              <p className="text-xs uppercase tracking-[0.1em] text-[#64ccc5]">
                Welcome Back
              </p>
            </div>

            {/* Desktop: Hero section */}
            <div className="hidden md:block text-center mb-8">
              <h1 className="text-4xl font-black text-white mb-2">Welcome Back</h1>
              <p className="text-white/60">Sign in to your account</p>
            </div>

            {/* Form card matching game card style */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 p-6 md:p-8">
              <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 md:py-3.5 rounded-xl border border-white/30 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#64ccc5] focus:border-[#64ccc5] transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 md:py-3.5 rounded-xl border border-white/30 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#64ccc5] focus:border-[#64ccc5] transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs md:text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 md:py-4 rounded-xl bg-[#64ccc5] text-slate-950 font-semibold text-sm md:text-base shadow-[0_0_15px_rgba(100,204,197,0.3)] hover:bg-[#56b4ae] focus:outline-none focus:ring-2 focus:ring-[#64ccc5] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs md:text-sm text-white/60">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#64ccc5] hover:text-[#56b4ae] font-medium transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
