"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Gamepad2,
  Coins,
  Trophy,
  Swords,
  LogIn,
  PersonStanding,
} from "lucide-react";
import { roomService } from "@/services/roomService";
import { useAuth } from "@/hooks/useAuth";

const buttonBase =
  "inline-flex items-center justify-center gap-3 h-16 px-8 rounded-2xl text-lg font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0";
const outlineButton = `${buttonBase} border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 focus-visible:ring-white/40`;
const accentButton = `${buttonBase} bg-[#64ccc5] text-slate-950 shadow-[0_0_35px_rgba(100,204,197,0.45)] hover:bg-[#56b4ae] focus-visible:ring-[#64ccc5]`;

const Home = () => {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) {
      setProfileMenuOpen(false);
    }
  }, [user]);

  const handleHostGame = async () => {
    setLoading(true);
    const hostId = Math.random().toString(36).substring(7);
    localStorage.setItem("hostId", hostId);

    try {
      const room = await roomService.createRoom(hostId);
      if (room) {
        router.push(`/lobby/${room.code}`);
      } else {
        alert("Failed to create room");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating room");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileAction = () => {
    if (authLoading) return;
    if (user) {
      setProfileMenuOpen((prev) => !prev);
    } else {
      router.push("/login");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setProfileMenuOpen(false);
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <Image
        src="/images/fighting-grid.svg"
        alt="Pixelated neon grid with Fighting text"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 flex min-h-screen flex-col justify-between gap-8 px-4 py-6 md:px-12 md:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-left">
            <button
              type="button"
              className={`${outlineButton} h-16 px-6 text-base uppercase tracking-[0.3em]`}
            >
              <Swords className="h-4 w-4 text-[#64ccc5]" />
              Fight Game
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-white/60">
                ARD ARENA
              </p>
              <p className="text-3xl font-black text-[#e0fdfb] drop-shadow-[0_0_15px_rgba(100,204,197,0.5)]">
                Digital Battle Lobby
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 items-center gap-4 rounded-2xl border border-white/30 bg-black/60 px-6 backdrop-blur">
              <Coins className="h-6 w-6 text-[#64ccc5]" />
              <div className="flex flex-col leading-none">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  Coins
                </p>
                <p className="text-2xl font-bold text-white">100</p>
              </div>
            </div>
            <button
              type="button"
              className={outlineButton}
              onClick={() => router.push("/leaderboard")}
            >
              <Trophy className="h-5 w-5 text-[#64ccc5]" />
              Leaderboard
            </button>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                aria-label={user ? "Open profile menu" : "Go to login"}
                className={`${outlineButton} h-16 w-16 px-0`}
                onClick={handleProfileAction}
                disabled={authLoading}
              >
                {user ? (
                  <PersonStanding
                    className="h-7 w-7 text-[#64ccc5]"
                    color="#64ccc5"
                    strokeWidth={2}
                  />
                ) : (
                  <LogIn
                    className="h-7 w-7 text-[#64ccc5]"
                    color="#64ccc5"
                    strokeWidth={2}
                  />
                )}
              </button>

              {user && profileMenuOpen && (
                <div className="absolute right-0 mt-3 min-w-[220px] rounded-2xl border border-white/20 bg-black/70 p-4 text-left text-sm shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                    Signed in
                  </p>
                  <p className="mt-1 truncate text-base font-semibold">
                    {user.email}
                  </p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm uppercase tracking-[0.7em] text-white/60">
            Get Ready
          </p>
        </main>

        <footer className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            className={`${accentButton} h-20 min-w-[18rem] px-14 text-2xl`}
            disabled={loading}
            onClick={handleHostGame}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Building Room...
              </>
            ) : (
              <>
                <Gamepad2 className="h-6 w-6" />
                Play
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Home;
