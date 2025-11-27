"use client";

import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Trophy, User, LogOut } from "lucide-react";

export function Header() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-black tracking-tighter text-white hover:text-indigo-400 transition-colors"
        >
          ARD ARENA
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/leaderboard">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Leaderboard
            </Button>
          </Link>

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">
                      {user.email?.split("@")[0]}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={signOut}
                    className="text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-gray-300 hover:text-white"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-0">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
