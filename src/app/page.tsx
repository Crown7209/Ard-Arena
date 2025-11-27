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
import { usePlayerStore } from "@/store/playerStore";
import { Account } from "@/components/layout/Account";
import { useAccount } from "wagmi";
import GameBrowser from "@/components/game/GameBrowser";
import { supabase } from "@/lib/supabase";
import { useRoom } from "@/hooks/useRoom";

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
  const [coins, setCoins] = useState<number>(100);

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

  useEffect(() => {
    const fetchCoins = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("coins")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error(
              "Error fetching coins:",
              error,
              JSON.stringify(error)
            );
            // If user doesn't exist yet (PGRST116) or other error, handle gracefully
            if (error.code === "PGRST116") {
              setCoins(100);
            } else {
              // For other errors, still default to 0 but log it
              setCoins(0);
            }
          } else if (data) {
            // Handle NULL, undefined, or actual 0 value
            const coinsValue = data.coins;
            if (coinsValue === null || coinsValue === undefined) {
              // If coins is NULL, set to 100 and update database
              setCoins(100);
              await supabase
                .from("users")
                .update({ coins: 100 })
                .eq("id", user.id);
            } else {
              setCoins(coinsValue);
            }
          }
        } catch (err) {
          console.error("Unexpected error fetching coins:", err);
          setCoins(0);
        }
      } else {
        // Not logged in - show default or 0
        setCoins(0);
      }
    };

    fetchCoins();

    if (user?.id) {
      const channel = supabase
        .channel(`user-coins-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "users",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new && payload.new.coins !== undefined) {
              setCoins(payload.new.coins as number);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Wallet connection reward logic
  const { isConnected, address } = useAccount();

  useEffect(() => {
    const handleWalletReward = async () => {
      if (user && isConnected && address) {
        const rewardKey = `wallet_reward_${user.id}_${address}`;
        const hasClaimed = localStorage.getItem(rewardKey);

        if (!hasClaimed) {
          console.log("Wallet connected! Rewarding 100 coins...");

          // Optimistic update
          // Use functional update to ensure we have the latest state
          setCoins((prevCoins) => {
            const currentCoins = prevCoins || 0;
            const newCoins = currentCoins + 100;

            // Update database inside the callback or after?
            // Better to do it outside, but we need the value.
            // Let's just calculate it based on 'coins' state which should be fresh enough or use the functional update for state and a separate read for DB?
            // Actually, let's just use the state value.
            return newCoins;
          });

          // We need the new value for DB update.
          // Let's just assume coins + 100 for DB update to be safe, or fetch fresh?
          // Simplest:
          const newCoinsVal = (coins || 0) + 100;

          // Mark as claimed locally to prevent loops
          localStorage.setItem(rewardKey, "true");

          try {
            // Update database - use upsert to handle case where user record doesn't exist yet
            const { error } = await supabase
              .from("users")
              .upsert({
                id: user.id,
                coins: newCoinsVal,
                email: user.email, // Include email as it might be required for new records
              })
              .select();

            if (error) {
              console.error(
                "Error updating coins in DB:",
                error,
                JSON.stringify(error)
              );
            } else {
              console.log("Coins updated in DB successfully");
            }
          } catch (err) {
            console.error("Exception updating coins:", err);
          }
        }
      }
    };

    handleWalletReward();
  }, [user, isConnected, address, coins]); // Added coins to dependency to ensure we have fresh value, but hasClaimed protects loop.

  // Room / Party Logic
  const [roomCode, setRoomCode] = useState<string | null>(null);

  const { room } = useRoom(roomCode || undefined, true); // Use roomCode directly

  const isRoomHost =
    typeof window !== "undefined" &&
    room?.host_id === localStorage.getItem("hostId");

  useEffect(() => {
    const code = localStorage.getItem("currentRoomCode");
    if (code) {
      setRoomCode(code);
    }
  }, []);

  useEffect(() => {
    console.log("🔍 Room status check:", {
      status: room?.status,
      roomCode,
      room,
    });

    if (room?.status === "playing" && roomCode) {
      console.log("✅ Redirecting to game with code:", roomCode);
      router.push(`/game?code=${roomCode}`);
    }
  }, [room?.status, roomCode, router, room]);

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
        // Just navigate to lobby as host (don't join as player)
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

  const handleStartSelectedGame = async (gameId: string) => {
    if (!room?.id) return;

    // Get current player ID
    let playerId = localStorage.getItem("playerId");

    // If admin hasn't joined as a player yet, join them now
    if (!playerId) {
      const hostId = localStorage.getItem("hostId");
      if (hostId && room.host_id === hostId) {
        // Admin is the host, join them as a player
        try {
          const { playerService } = await import("@/services/playerService");
          const player = await playerService.joinRoom(room.id, "Host");
          if (player) {
            playerId = player.id;
            localStorage.setItem("playerId", player.id);
            setCurrentPlayerId(player.id);
            // Mark admin as ready
            await playerService.toggleReady(player.id, true);
          } else {
            alert("Failed to join as player");
            return;
          }
        } catch (error) {
          console.error("Error joining as player:", error);
          alert("Failed to join as player");
          return;
        }
      } else {
        alert("You must join the room first");
        return;
      }
    }

    // Check if user is admin
    if (room.admin_id !== playerId) {
      alert("Only the admin can select a game");
      return;
    }

    setLoading(true);
    try {
      // Select the game
      await roomService.selectGame(room.id, gameId, playerId);

      // Start the game
      await roomService.startGame(room.id);
      // The useEffect will handle redirect when status becomes "playing"
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to start game");
      setLoading(false);
    }
  };

  // Check if current user is admin
  const currentPlayerId =
    typeof window !== "undefined" ? localStorage.getItem("playerId") : null;
  const isAdmin = currentPlayerId && room?.admin_id === currentPlayerId;

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
        <header className="flex flex-wrap items-center justify-between gap-3 pl-4 pr-0 py-4 md:gap-4 md:pl-12 md:pr-0 md:py-10">
          {/* Mobile: Icon-only button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
            aria-label="Game Category"
          >
            <Swords className="h-4 w-4 text-[#64ccc5]" />
          </button>

          {/* Desktop: Full button with text and title */}
          <div className="hidden md:flex flex-wrap items-center gap-4 text-left">
            <button
              type="button"
              className={`${outlineButton} h-16 px-6 text-base uppercase tracking-[0.3em]`}
            >
              <Swords className="h-4 w-4 text-[#64ccc5]" />
              <span className="min-w-16 text-center">
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

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="flex h-10 md:h-16 items-center gap-2 md:gap-4 rounded-xl md:rounded-2xl border border-white/30 bg-black/60 px-2.5 md:px-6 backdrop-blur">
              <Coins className="h-4 w-4 md:h-6 md:w-6 text-[#64ccc5]" />
              <div className="flex flex-col leading-none">
                <p className="text-[9px] md:text-xs uppercase tracking-[0.4em] text-white/60">
                  Coins
                </p>
                <p className="text-base md:text-2xl font-bold text-white">
                  {coins}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
              onClick={() => router.push("/leaderboard")}
              aria-label="Leaderboard"
            >
              <Trophy className="h-4 w-4 text-[#64ccc5]" />
            </button>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                aria-label={user ? "Open profile menu" : "Go to login"}
                className="inline-flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl border border-white/30 bg-white/5 text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
                onClick={handleProfileAction}
                disabled={authLoading}
              >
                {user ? (
                  <PersonStanding
                    className="h-4 w-4 md:h-7 md:w-7 text-[#64ccc5]"
                    color="#64ccc5"
                    strokeWidth={2}
                  />
                ) : (
                  <LogIn
                    className="h-4 w-4 md:h-7 md:w-7 text-[#64ccc5]"
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

        <main className="flex flex-1 flex-col items-center justify-center text-center px-4 py-40 md:py-60">
          {/* If user is in a room */}
          {room && roomCode ? (
            <div className="mb-6 flex flex-col items-center gap-8">
              <div>
                <p className="text-2xl md:text-xs uppercase tracking-[0.6em] text-white/60">
                  ROOM {roomCode}
                </p>
                {isAdmin ? (
                  <>
                    <p className="text-xl md:text-3xl mt-4 font-black text-[#64ccc5] uppercase tracking-widest">
                      You are the Admin
                    </p>
                    <p className="text-sm mt-2 uppercase tracking-widest text-white/60">
                      Select a game below to start
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl md:text-3xl mt-4 font-black text-white uppercase tracking-widest">
                      Waiting for Admin
                    </p>
                    <p className="text-sm mt-2 uppercase tracking-widest text-[#64ccc5]">
                      The admin will select a game soon...
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile: Show only ARD ARENA */}
              <div className="mb-6 md:hidden flex flex-col items-center gap-8">
                <div>
                  <p className="text-2xl md:text-xs uppercase tracking-[0.6em] text-white/60">
                    ARD ARENA
                  </p>
                  <p className="text-sm mt-2 uppercase tracking-widest text-[#64ccc5]">
                    Mini Games - Major Fun
                  </p>
                </div>

                <button
                  onClick={() => router.push("/join")}
                  className={`${accentButton} w-full max-w-[280px] h-14 text-base shadow-[0_0_20px_rgba(100,204,197,0.3)] hover:shadow-[0_0_30px_rgba(100,204,197,0.5)]`}
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>JOIN ROOM</span>
                </button>
              </div>

              {/* Desktop: Keep original hero design */}
              <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-sm uppercase tracking-[0.7em] text-white/60 mb-8">
                  Get Ready
                </p>
                <button
                  onClick={handleHostGame}
                  disabled={loading}
                  className={`${accentButton} min-w-[240px] hover:scale-105 active:scale-95 cursor-pointer`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>CREATING...</span>
                    </>
                  ) : (
                    <>
                      <Gamepad2 className="w-6 h-6" />
                      <span>PLAY NOW</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </main>

        {/* Show GameBrowser only if admin or not in a room */}
        {(!room || isAdmin) && (
          <GameBrowser
            onGameSelect={isAdmin ? handleStartSelectedGame : undefined}
          />
        )}

        <footer className="flex flex-wrap items-center justify-center gap-4 px-4 py-8 md:px-12">
          <p className="text-sm text-white/60">
            © 2025 ARD Arena. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
