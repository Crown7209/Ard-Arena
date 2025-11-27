"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { matchmakingService, MatchmakingPlayer } from "@/services/matchmakingService";
import { roomService } from "@/services/roomService";
import { playerService } from "@/services/playerService";
import { usePlayerStore } from "@/store/playerStore";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Loader2, Users, ArrowLeft, CheckCircle2, XCircle, User } from "lucide-react";

export default function OnePlayerPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { setCurrentPlayerId } = usePlayerStore();
  const [activePlayers, setActivePlayers] = useState<MatchmakingPlayer[]>([]);
  const [isInQueue, setIsInQueue] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Refresh active players on mount and periodically
    refreshActivePlayers();
    setLoading(false);

    // Refresh active players every 5 seconds
    const interval = setInterval(refreshActivePlayers, 5000);

    // If user is signed in, check if they're in queue
    if (authUser?.id) {
      checkIfInQueue();
    }

    return () => {
      clearInterval(interval);
    };
  }, [authUser]);

  const checkIfInQueue = async () => {
    if (!authUser?.id) return;
    const players = await matchmakingService.getActivePlayers();
    const inQueue = players.some((p) => p.id === authUser.id);
    setIsInQueue(inQueue);
  };

  const refreshActivePlayers = async () => {
    const players = await matchmakingService.getActivePlayers();
    setActivePlayers(players);
    if (authUser?.id) {
      const inQueue = players.some((p) => p.id === authUser.id);
      setIsInQueue(inQueue);
    }
  };

  const handleJoinQueue = async () => {
    if (!authUser?.id) {
      router.push("/login");
      return;
    }

    try {
      await matchmakingService.joinQueue(authUser.id);
      setIsInQueue(true);
      await refreshActivePlayers();
    } catch (error) {
      console.error("Error joining queue:", error);
      alert("Failed to join queue");
    }
  };

  const handleLeaveQueue = async () => {
    if (!authUser?.id) return;

    try {
      await matchmakingService.leaveQueue(authUser.id);
      setIsInQueue(false);
      await refreshActivePlayers();
    } catch (error) {
      console.error("Error leaving queue:", error);
    }
  };

  const handleReady = async () => {
    if (!authUser?.id || isMatching) return;

    // Check if there are at least 2 players (including current user)
    if (activePlayers.length < 2) {
      alert("No active players available. Please wait for more players to join.");
      return;
    }

    setIsMatching(true);

    // Find a match
    const matchedUserId = await matchmakingService.findMatch(authUser.id);

    if (!matchedUserId) {
      setIsMatching(false);
      alert("No players available for matching. Please try again.");
      return;
    }

    await startGameWithMatch(matchedUserId);
  };

  const startGameWithMatch = async (matchedUserId: string) => {
    try {
      if (!authUser?.id) {
        throw new Error("User not authenticated");
      }

      // Create a room for the match
      const hostId = Math.random().toString(36).substring(7);
      const room = await roomService.createRoom(hostId);
      
      if (!room) {
        throw new Error("Failed to create room");
      }

      // Get current user's player name
      const currentUserName = authUser.email?.split("@")[0] || "Player 1";

      // Current user joins as player 1 (host)
      const player1 = await playerService.joinRoom(room.id, currentUserName);
      
      if (!player1) {
        throw new Error("Failed to join room as player 1");
      }

      // Store current player info
      localStorage.setItem("playerId", player1.id);
      localStorage.setItem("hostId", hostId);
      localStorage.setItem("currentRoomCode", room.code);
      setCurrentPlayerId(player1.id);

      // Current user is ready
      await playerService.toggleReady(player1.id, true);

      // Navigate to lobby to wait for matched player
      router.push(`/lobby/${room.code}`);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Error starting game. Please try again.");
      setIsMatching(false);
    }
  };

  const neonBg = (
    <>
      <Image
        src="/images/fighting-grid.svg"
        alt="Neon grid"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/80" />
    </>
  );

  return (
    <div className="relative min-h-screen overflow-hidden text-white portrait-lock bg-black">
      <div className="fixed inset-0 -z-10 hidden md:block">
        {neonBg}
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Mobile Header */}
        <header className="flex items-center justify-between gap-3 pl-4 pr-0 py-4 md:gap-4 md:pl-12 md:pr-0 md:py-10">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 text-[#64ccc5]" />
          </button>

          <div className="hidden md:flex flex-wrap items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/30 bg-white/5 px-6 text-xs font-semibold uppercase tracking-[0.4em] text-white/80"
            >
              Fight Game
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-white/50">
                1 Player Mode
              </p>
              <p className="text-3xl font-black text-[#e0fdfb] drop-shadow-[0_0_15px_rgba(100,204,197,0.5)]">
                Matchmaking
              </p>
            </div>
          </div>

          {/* Mobile: Title */}
          <div className="md:hidden flex items-center gap-2">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                1 Player
              </p>
              <p className="text-lg font-black text-[#64ccc5]">
                Matchmaking
              </p>
            </div>
          </div>

          {/* Desktop: Stats */}
          <div className="hidden md:flex flex-wrap items-center gap-4">
            <div className="flex h-14 items-center gap-3 rounded-2xl border border-white/25 bg-black/50 px-5 backdrop-blur">
              <Users className="h-5 w-5 text-[#64ccc5]" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  Active
                </p>
                <p className="text-xl font-bold">
                  {activePlayers.length}
                  <span className="text-sm text-white/60"> players</span>
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile: Vertical 2-box layout */}
        <main className="flex-1 px-4 py-4 md:px-8 md:py-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-5">
              {/* Box 1: Join Queue */}
              <section className="bg-black/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 p-3 md:p-6">
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  <div className="inline-flex items-center justify-center p-3 bg-[#64ccc5]/10 rounded-xl mb-2 md:mb-4 border border-[#64ccc5]/30">
                    <User className="w-6 h-6 md:w-8 md:h-8 text-[#64ccc5]" />
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2">
                    Join Queue
                  </h2>
                  <p className="text-center text-xs md:text-sm text-white/60 mb-4">
                    {isInQueue 
                      ? "You're in the matchmaking queue" 
                      : "Join the queue to find an opponent"}
                  </p>
                  {!isInQueue ? (
                    <button
                      onClick={handleJoinQueue}
                      disabled={!authUser}
                      className="w-full py-3 md:py-4 rounded-lg md:rounded-xl bg-[#64ccc5] text-slate-950 font-semibold shadow-[0_0_15px_rgba(100,204,197,0.3)] hover:bg-[#56b4ae] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      {authUser ? "Join Queue" : "Sign In to Join"}
                    </button>
                  ) : (
                    <button
                      onClick={handleLeaveQueue}
                      className="w-full py-3 md:py-4 rounded-lg md:rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all text-sm md:text-base font-semibold"
                    >
                      Leave Queue
                    </button>
                  )}
                </div>
              </section>

              {/* Box 2: Active Players & Ready Button */}
              <section className="bg-black/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 p-3 md:p-6 flex flex-col">
                <div className="flex-1 mb-3 md:mb-4">
                  <div className="mb-2 md:mb-3 flex items-center justify-between">
                    <h3 className="text-xs md:text-base font-bold text-white uppercase tracking-[0.2em] md:tracking-wider">
                      Active Players ({activePlayers.length})
                    </h3>
                  </div>
                  {loading ? (
                    <div className="text-center py-8 text-white/60">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#64ccc5]" />
                      <div className="text-xs">Loading players...</div>
                    </div>
                  ) : activePlayers.length === 0 ? (
                    <div className="text-center py-8 text-white/60 text-sm">
                      No active players
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] md:max-h-[400px] overflow-y-auto">
                      {activePlayers.map((player) => (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all duration-200 ${
                            player.id === authUser?.id
                              ? "border-[#64ccc5]/50 bg-[#64ccc5]/10"
                              : "border-white/20 bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3 md:gap-4">
                            <div
                              className={`p-2 rounded-lg ${
                                player.id === authUser?.id
                                  ? "bg-[#64ccc5]/20"
                                  : "bg-white/10"
                              }`}
                            >
                              <User
                                className={`w-4 h-4 md:w-5 md:h-5 ${
                                  player.id === authUser?.id
                                    ? "text-[#64ccc5]"
                                    : "text-white/60"
                                }`}
                              />
                            </div>
                            <span
                              className={`text-sm md:text-base font-bold ${
                                player.id === authUser?.id ? "text-white" : "text-white/90"
                              }`}
                            >
                              {player.username || player.email.split("@")[0]}
                              {player.id === authUser?.id && (
                                <span className="ml-2 text-xs text-[#64ccc5]">(You)</span>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  <button
                    onClick={handleReady}
                    disabled={isMatching || activePlayers.length < 2 || !isInQueue || !authUser}
                    className="w-full py-3 md:py-4 rounded-lg md:rounded-xl bg-[#64ccc5] text-slate-950 font-semibold shadow-[0_0_15px_rgba(100,204,197,0.3)] hover:bg-[#56b4ae] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    {isMatching ? (
                      <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                        <span>Matching...</span>
                      </>
                    ) : (
                      <span>Ready to Play</span>
                    )}
                  </button>
                  {activePlayers.length < 2 && !loading && (
                    <p className="text-center text-[10px] md:text-xs text-white/60 mt-2">
                      {activePlayers.length === 0 
                        ? "No active players. Waiting for players to join..." 
                        : "Need at least 2 players to start"}
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

