"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { roomService } from "@/services/roomService";
import { playerService } from "@/services/playerService";
import { usePlayerStore } from "@/store/playerStore";
import { Loader2, ArrowLeft, Smartphone, Gamepad2 } from "lucide-react";

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { setCurrentPlayerId } = usePlayerStore();

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    setLoading(true);

    try {
      // 1. Find room
      const room = await roomService.getRoomByCode(code);

      if (!room) {
        alert("Room not found");
        setLoading(false);
        return;
      }

      if (room.status !== "waiting") {
        alert("Game already started");
        setLoading(false);
        return;
      }

      // 2. Join room
      const player = await playerService.joinRoom(room.id, name);

      if (player) {
        setCurrentPlayerId(player.id);
        localStorage.setItem("playerId", player.id);
        router.push(`/lobby/${code}`);
      } else {
        alert("Failed to join room");
        setLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error joining room");
      setLoading(false);
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
                <Gamepad2 className="h-4 w-4 md:h-7 md:w-7 text-[#64ccc5]" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-md">
            {/* Mobile: Hero section matching landing page */}
            <div className="mb-8 md:hidden text-center">
              <div className="inline-flex items-center justify-center p-3 bg-[#64ccc5]/10 rounded-xl mb-4 border border-[#64ccc5]/30">
                <Smartphone className="w-8 h-8 text-[#64ccc5]" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-[0.6em] mb-2">
                JOIN GAME
              </h1>
              <p className="text-xs uppercase tracking-[0.1em] text-[#64ccc5]">
                Enter the Arena
              </p>
            </div>

            {/* Desktop: Hero section */}
            <div className="hidden md:block text-center mb-8">
              <h1 className="text-4xl font-black text-white mb-2">Join Game</h1>
              <p className="text-white/60">Enter your name and the room code</p>
            </div>

            {/* Form card matching game card style */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 p-6 md:p-8">
              <form onSubmit={handleJoin} className="space-y-5 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Room Code
                  </label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="1234"
                    maxLength={4}
                    className="w-full px-4 py-3 md:py-4 rounded-xl border border-white/30 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#64ccc5] focus:border-[#64ccc5] transition-all text-center text-2xl md:text-3xl tracking-[0.5em] uppercase font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-white/90 uppercase tracking-wider">
                    Your Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={12}
                    className="w-full px-4 py-3 md:py-3.5 rounded-xl border border-white/30 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#64ccc5] focus:border-[#64ccc5] transition-all text-center text-lg md:text-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !code || !name}
                  className="w-full py-3 md:py-4 rounded-xl bg-[#64ccc5] text-slate-950 font-semibold text-sm md:text-base shadow-[0_0_15px_rgba(100,204,197,0.3)] hover:bg-[#56b4ae] focus:outline-none focus:ring-2 focus:ring-[#64ccc5] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                      <span>Joining...</span>
                    </div>
                  ) : (
                    "JOIN ROOM"
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#64ccc5]" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
