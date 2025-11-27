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
import { playerService } from "@/services/playerService";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerStore } from "@/store/playerStore";
import { Account } from "@/components/layout/Account";
import GameBrowser from "@/components/game/GameBrowser";

const buttonBase =
  "inline-flex items-center justify-center gap-3 h-16 px-8 rounded-2xl text-lg font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0";
const outlineButton = `${buttonBase} border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 focus-visible:ring-white/40`;
const accentButton = `${buttonBase} bg-[#64ccc5] text-slate-950 shadow-[0_0_35px_rgba(100,204,197,0.45)] hover:bg-[#56b4ae] focus-visible:ring-[#64ccc5]`;

const gameCategories = ["Fight", "Race", "Puzzle", "Action", "Battle"];

const Home = () => {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { setCurrentPlayerId } = usePlayerStore();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategoryIndex((prev) => (prev + 1) % gameCategories.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleHostGame = async () => {
    setLoading(true);

    // Clear previous session data
    localStorage.removeItem("playerId");
    localStorage.removeItem("currentRoomCode");
    setCurrentPlayerId(null);

    const hostId = Math.random().toString(36).substring(7);
    localStorage.setItem("hostId", hostId);

    try {
      const room = await roomService.createRoom(hostId);
      if (room) {
        // Join as Host
        const player = await playerService.joinRoom(room.id, "Host");
        if (player) {
          localStorage.setItem("playerId", player.id);
          setCurrentPlayerId(player.id);
          // Host is always ready
          await playerService.toggleReady(player.id, true);
          router.push(`/lobby/${room.code}`);
        } else {
          alert("Failed to join room as host");
        }
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
    <div className="relative min-h-screen text-white portrait-lock">
      <div className="fixed inset-0 -z-10 hidden md:block">
        <Image
          src="/images/fighting-grid.svg"
          alt="Pixelated neon grid with Fighting text"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="fixed inset-0 -z-10 bg-black md:bg-black/75" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:gap-4 md:px-12 md:py-10">
          {/* Mobile: Icon-only button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center h-12 w-12 rounded-2xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
            aria-label="Game Category"
          >
            <Swords className="h-5 w-5 text-[#64ccc5]" />
          </button>

          {/* Desktop: Full button with text and title */}
          <div className="hidden md:flex flex-wrap items-center gap-4 text-left">
            <button
              type="button"
              className={`${outlineButton} h-16 px-6 text-base uppercase tracking-[0.3em]`}
            >
              <Swords className="h-4 w-4 text-[#64ccc5]" />
              <span className="min-w-[4rem] text-center">
                {gameCategories[currentCategoryIndex]}
              </span>
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

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex h-12 md:h-16 items-center gap-2 md:gap-4 rounded-xl md:rounded-2xl border border-white/30 bg-black/60 px-3 md:px-6 backdrop-blur">
              <Coins className="h-5 w-5 md:h-6 md:w-6 text-[#64ccc5]" />
              <div className="flex flex-col leading-none">
                <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/60">
                  Coins
                </p>
                <p className="text-lg md:text-2xl font-bold text-white">100</p>
              </div>
            </div>
            <button
              type="button"
              className={`${outlineButton} hidden md:inline-flex`}
              onClick={() => router.push("/leaderboard")}
            >
              <Trophy className="h-5 w-5 text-[#64ccc5]" />
              Leaderboard
            </button>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                aria-label={user ? "Open profile menu" : "Go to login"}
                className="inline-flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
                onClick={handleProfileAction}
                disabled={authLoading}
              >
                {user ? (
                  <PersonStanding
                    className="h-5 w-5 md:h-7 md:w-7 text-[#64ccc5]"
                    color="#64ccc5"
                    strokeWidth={2}
                  />
                ) : (
                  <LogIn
                    className="h-5 w-5 md:h-7 md:w-7 text-[#64ccc5]"
                    color="#64ccc5"
                    strokeWidth={2}
                  />
                )}
              </button>

              {user && profileMenuOpen && (
                <div className="absolute right-0 mt-3 min-w-[220px] rounded-2xl border border-white/20 bg-black/70 p-4 text-left text-sm shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur z-50">
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

          <Account />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center text-center px-4 py-8 md:py-12">
          {/* Mobile: Show title in hero */}
          <div className="mb-6 md:hidden">
            <p className="text-xs uppercase tracking-[0.6em] text-white/60 mb-2">
              ARD ARENA
            </p>
            <p className="text-2xl font-black text-[#e0fdfb] drop-shadow-[0_0_15px_rgba(100,204,197,0.5)]">
              Digital Battle Lobby
            </p>
          </div>
          
          {/* Desktop: Keep original hero design */}
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-sm uppercase tracking-[0.7em] text-white/60">
              Get Ready
            </p>
          </div>
          
          {/* Mobile: Get Ready text */}
          <p className="md:hidden text-xs uppercase tracking-[0.5em] text-white/60 mb-6">
            Get Ready
          </p>
          
          <button
            type="button"
            className={`${accentButton} h-16 md:h-20 w-full max-w-[18rem] px-8 md:px-14 text-lg md:text-2xl md:mt-8`}
            disabled={loading}
            onClick={handleHostGame}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="hidden md:inline">Building Room...</span>
                <span className="md:hidden">Loading...</span>
              </>
            ) : (
              <>
                <Gamepad2 className="h-5 w-5 md:h-6 md:w-6" />
                Play
              </>
            )}
          </button>
        </main>

        <GameBrowser />

        <footer className="flex flex-wrap items-center justify-center gap-4 px-4 py-8 md:px-12">
          <p className="text-sm text-white/60">
            © 2024 ARD Arena. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
