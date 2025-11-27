"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { start, reset, getGame } from "@/components/game/mortalkombat/game";
import { Loader2, RotateCcw, Home } from "lucide-react";
import { roomService } from "@/services/roomService";
import { playerService } from "@/services/playerService";
import { usePlayerStore } from "@/store/playerStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { MoveType } from "@/components/game/mortalkombat/core/moveTypes";
import { CONFIG } from "@/components/game/mortalkombat/core/config";
import RotationReminder from "@/components/game/RotationReminder";

type GameState = "playing" | "round-winner" | "final-winner";

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const gameOptionsRef = useRef<any>(null);

  const [gameReady, setGameReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [currentRound, setCurrentRound] = useState(1);
  const [player1Wins, setPlayer1Wins] = useState(0);
  const [player2Wins, setPlayer2Wins] = useState(0);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [finalWinner, setFinalWinner] = useState<number | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { currentPlayerId } = usePlayerStore();
  const { user: authUser } = useAuth();

  const roundRef = useRef(1);
  const player1WinsRef = useRef(0);
  const player2WinsRef = useRef(0);
  const player1UserIdRef = useRef<string | null>(null);
  const player2UserIdRef = useRef<string | null>(null);

  const handleRoundEnd = useCallback((loser: any) => {
    const game = getGame();
    if (!game || game.fighters.length < 2) return;

    // Stop the timer when winner is declared
    if (game.arena) {
      (game.arena as any).stopTimer();
    }

    const fighter1 = game.fighters[0];
    const fighter2 = game.fighters[1];
    
    // Determine winner (the one who didn't lose)
    // loser is the Fighter object that died
    const isFighter1Loser = loser === fighter1 || loser.getName() === fighter1.getName();
    const winnerIndex = isFighter1Loser ? 2 : 1; // Player 1 or Player 2

    setRoundWinner(winnerIndex);

    // Update win counts
    if (winnerIndex === 1) {
      player1WinsRef.current += 1;
      setPlayer1Wins(player1WinsRef.current);
    } else {
      player2WinsRef.current += 1;
      setPlayer2Wins(player2WinsRef.current);
    }

    // Update wins in arena for canvas display
    if (game.arena) {
      (game.arena as any).setWins(player1WinsRef.current, player2WinsRef.current);
    }

    // Check if game is over (3 rounds completed or someone has 2 wins)
    const currentRoundNum = roundRef.current;
    const newPlayer1Wins = player1WinsRef.current;
    const newPlayer2Wins = player2WinsRef.current;

    let newGameState: "playing" | "round-winner" | "final-winner";
    let finalWinnerIndex: number | undefined;
    let roundWinnerIndex: number | undefined;

    if (currentRoundNum >= 3 || newPlayer1Wins >= 2 || newPlayer2Wins >= 2) {
      // Game over - show final winner
      finalWinnerIndex = newPlayer1Wins > newPlayer2Wins ? 1 : 2;
      setFinalWinner(finalWinnerIndex);
      newGameState = "final-winner";
      
      // Update database with win for the winner
      // Only update if the current user is the winner (each client updates their own wins)
      const winnerUserId = finalWinnerIndex === 1 ? player1UserIdRef.current : player2UserIdRef.current;
      const currentUserId = authUser?.id;
      
      if (winnerUserId && currentUserId && winnerUserId === currentUserId) {
        // Fetch current wins and increment
        supabase
          .from("users")
          .select("wins")
          .eq("id", currentUserId)
          .single()
          .then(({ data, error: fetchError }) => {
            if (!fetchError && data) {
              const newWins = (data.wins || 0) + 1;
              supabase
                .from("users")
                .update({ wins: newWins })
                .eq("id", currentUserId)
                .then(({ error: updateError }) => {
                  if (updateError) {
                    console.error("Error updating wins:", updateError);
                  } else {
                    console.log("Wins updated successfully:", newWins);
                  }
                });
            } else {
              console.error("Error fetching current wins:", fetchError);
            }
          });
      }
    } else {
      // Show round winner, then continue to next round
      roundWinnerIndex = winnerIndex;
      newGameState = "round-winner";
    }

    setGameState(newGameState);

    // Sync game state to other players (for mobile updates)
    if ((game as any).getRealtimeService) {
      const realtimeService = (game as any).getRealtimeService();
      if (realtimeService) {
        realtimeService.sendGameState({
          gameState: newGameState,
          roundWinner: roundWinnerIndex,
          finalWinner: finalWinnerIndex,
          player1Wins: newPlayer1Wins,
          player2Wins: newPlayer2Wins,
          currentRound: currentRoundNum,
        });
      }
    }
  }, [authUser]);

  // Detect device orientation and screen size
  useEffect(() => {
    const checkOrientation = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      
      if (isMobileDevice) {
        const isLandscapeMode = window.innerWidth > window.innerHeight;
        setIsLandscape(isLandscapeMode);
      } else {
        // Desktop always shows game
        setIsLandscape(true);
      }
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  useEffect(() => {
    const initGame = async () => {
      try {
        // Get room code from URL or localStorage
        const code =
          searchParams.get("code") || localStorage.getItem("currentRoomCode");

        if (!code) {
          setError("No room code found");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        // Get room info
        const room = await roomService.getRoomByCode(code);
        if (!room) {
          setError("Room not found");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        // Get player info
        const playerId = currentPlayerId || localStorage.getItem("playerId");
        if (!playerId) {
          setError("Player not found");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        // Get all players to determine order
        const players = await playerService.getPlayers(room.id);
        const currentPlayer = players.find((p) => p.id === playerId);

        if (!currentPlayer) {
          setError("You are not in this room");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        // Determine player index (host is always player 0, first joiner is player 1)
        const storedHostId = localStorage.getItem("hostId");
        const isHost = room.host_id === storedHostId;
        const playerIndex = isHost ? 0 : 1;

        // Store user IDs for both players
        // Current user's ID based on their player index
        if (authUser?.id) {
          if (playerIndex === 0) {
            player1UserIdRef.current = authUser.id;
          } else {
            player2UserIdRef.current = authUser.id;
          }
        }

        // Try to get the other player's user ID from the players list
        // Note: This assumes players are authenticated and we can get their user IDs
        // For now, we'll update wins only for the current user when they win
        // The other player's client will update their own wins when they see the result

        setLoading(false);

        // Only initialize game if in landscape (or desktop)
        if (!isLandscape && isMobile) return;

        // Initialize game
        if (!containerRef.current || initialized.current) return;
        initialized.current = true;

        const options = {
          arena: {
            container: containerRef.current!,
            arena: 0,
          },
          fighters: [{ name: "subzero" }, { name: "kano" }],
          gameType: "realtime" as const,
          roomId: room.id,
          playerId: playerId,
          playerIndex: playerIndex,
          callbacks: {
            "game-end": handleRoundEnd,
          },
        };

        gameOptionsRef.current = options;

        start(options).ready(() => {
          // Initialize arena with current round and wins
          const game = getGame();
          if (game && game.arena) {
            (game.arena as any).setRound(roundRef.current);
            (game.arena as any).setWins(player1WinsRef.current, player2WinsRef.current);
          }
          
          setGameReady(true);
          
          // Setup game state listener for mobile sync
          if (game && (game as any).getRealtimeService) {
            const realtimeService = (game as any).getRealtimeService();
            if (realtimeService && (game as any).setGameStateCallback) {
              (game as any).setGameStateCallback((data: any) => {
                // Update game state from remote player
                setGameState(data.gameState);
                if (data.roundWinner !== undefined) {
                  setRoundWinner(data.roundWinner);
                }
                if (data.finalWinner !== undefined) {
                  setFinalWinner(data.finalWinner);
                }
                setPlayer1Wins(data.player1Wins);
                setPlayer2Wins(data.player2Wins);
                setCurrentRound(data.currentRound);
                roundRef.current = data.currentRound;
                player1WinsRef.current = data.player1Wins;
                player2WinsRef.current = data.player2Wins;
                
                // Update wins and round in arena for canvas display
                if (game.arena) {
                  (game.arena as any).setRound(data.currentRound);
                  (game.arena as any).setWins(data.player1Wins, data.player2Wins);
                  (game.arena as any).refresh(); // Refresh to show updated info
                }
                
                // Stop timer if winner is declared
                if (data.gameState === "round-winner" || data.gameState === "final-winner") {
                  if (game.arena) {
                    (game.arena as any).stopTimer();
                  }
                }
              });
            }
          }
        });
      } catch (err: any) {
        console.error("Error initializing game:", err);
        setError(err.message || "Failed to initialize game");
      }
    };

    if (isLandscape || !isMobile) {
      initGame();
    }

    return () => {
      if (initialized.current) {
        reset();
        initialized.current = false;
      }
    };
  }, [router, searchParams, currentPlayerId, handleRoundEnd, isLandscape, isMobile]);

  const startNextRound = () => {
    const game = getGame();
    if (!game || !gameOptionsRef.current) return;

    // Reset fighters - make sure they stand up
    game.fighters.forEach((fighter) => {
      fighter.setLife(100);
      fighter.unlock();
      // Stop any current move first
      try {
        fighter.getMove().stop();
      } catch (e) {
        // Ignore if no move set
      }
      // Set to stand position
      fighter.setMove(MoveType.STAND);
    });

    // Reset positions to starting points (left and right sides)
    game.fighters[0].setX(100);  // Player 1 on left
    game.fighters[1].setX(940);  // Player 2 on right
    
    // Reset Y positions to ground level
    game.fighters[0].setY(CONFIG.PLAYER_TOP);
    game.fighters[1].setY(CONFIG.PLAYER_TOP);
    
    // Sync positions immediately
    if ((game as any).getRealtimeService) {
      const realtimeService = (game as any).getRealtimeService();
      if (realtimeService) {
        realtimeService.sendPosition(game.fighters[0].getX(), game.fighters[0].getY());
        realtimeService.sendPosition(game.fighters[1].getX(), game.fighters[1].getY());
      }
    }

    roundRef.current += 1;
    setCurrentRound(roundRef.current);
    setRoundWinner(null);
    setGameState("playing");

    // Set round number and wins, then restart countdown
    if (game.arena) {
      (game.arena as any).setRound(roundRef.current);
      (game.arena as any).setWins(player1WinsRef.current, player2WinsRef.current);
      (game.arena as any).startCountdown();
    }
    
    // Sync game state update
    if ((game as any).getRealtimeService) {
      const realtimeService = (game as any).getRealtimeService();
      if (realtimeService) {
        realtimeService.sendGameState({
          gameState: "playing",
          player1Wins: player1WinsRef.current,
          player2Wins: player2WinsRef.current,
          currentRound: roundRef.current,
        });
      }
    }
  };

  const restartGame = () => {
    reset();
    initialized.current = false;
    roundRef.current = 1;
    player1WinsRef.current = 0;
    player2WinsRef.current = 0;
    setCurrentRound(1);
    setPlayer1Wins(0);
    setPlayer2Wins(0);
    setRoundWinner(null);
    setFinalWinner(null);
    setGameState("playing");
    setGameReady(false);

    // Reinitialize game
    if (containerRef.current && gameOptionsRef.current) {
      initialized.current = true;
      start(gameOptionsRef.current).ready(() => {
        setGameReady(true);
      });
    }
  };

  const goToLanding = () => {
    reset();
    router.push("/");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="flex items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-lg">Loading game...</span>
        </div>
      </div>
    );
  }

  // Show rotation reminder on mobile portrait
  if (isMobile && !isLandscape && !loading && !error) {
    return <RotationReminder />;
  }

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Round Winner Overlay - Fighting Game Style */}
      {gameState === "round-winner" && roundWinner && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/40">
          <div className="relative bg-black/40 border-2 border-white/20 rounded-lg p-5 text-center max-w-sm w-full mx-4">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/15" />
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/15" />
            
            {/* Round Label */}
            <div className="text-lg font-black mb-2 text-white/70 tracking-wider uppercase">
              Round {currentRound}
            </div>
            
            {/* Winner Announcement */}
            <div className="text-2xl font-black mb-2 text-white tracking-wider uppercase">
              PLAYER {roundWinner}
            </div>
            <div className="text-xl font-black mb-4 text-white/90 tracking-wider uppercase">
              WINS
            </div>
            
            {/* Score Display */}
            <div className="mb-4 space-y-1">
              <div className="text-xs font-bold text-white/50 tracking-wider uppercase mb-1">
                Score
              </div>
              <div className="flex justify-center items-center gap-4 text-base font-black">
                <div className={`${roundWinner === 1 ? 'text-white' : 'text-white/30'}`}>
                  P1: <span className="text-lg">{player1Wins}</span>
                </div>
                <div className="text-white/15 text-sm">|</div>
                <div className={`${roundWinner === 2 ? 'text-white' : 'text-white/30'}`}>
                  P2: <span className="text-lg">{player2Wins}</span>
                </div>
              </div>
            </div>
            
            {/* Continue Button */}
            <button
              onClick={startNextRound}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-6 rounded-md border border-white/20 transition-all text-sm uppercase tracking-wider"
            >
              Next Round
            </button>
          </div>
        </div>
      )}

      {/* Final Winner Overlay - Fighting Game Style */}
      {gameState === "final-winner" && finalWinner && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/40">
          <div className="relative bg-black/40 border-2 border-white/30 rounded-lg p-6 text-center max-w-md w-full mx-4">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20" />
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20" />
            
            {/* Main Title */}
            <div className="text-3xl font-black mb-4 text-white tracking-wider uppercase">
              WINNER
            </div>
            
            {/* Winner Announcement */}
            <div className="text-2xl font-black mb-4 text-white tracking-wider uppercase">
              PLAYER {finalWinner}
            </div>
            
            {/* Score Display */}
            <div className="mb-4 space-y-2">
              <div className="text-xs font-bold text-white/60 tracking-wider uppercase mb-1">
                Final Score
              </div>
              <div className="flex justify-center items-center gap-4 text-lg font-black">
                <div className={`${finalWinner === 1 ? 'text-white' : 'text-white/40'}`}>
                  P1: <span className="text-xl">{player1Wins}</span>
                </div>
                <div className="text-white/20 text-sm">|</div>
                <div className={`${finalWinner === 2 ? 'text-white' : 'text-white/40'}`}>
                  P2: <span className="text-xl">{player2Wins}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={restartGame}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-6 rounded-md border border-white/30 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Fight Again
              </button>
              <button
                onClick={goToLanding}
                className="w-full bg-white/5 hover:bg-white/10 text-white/80 font-bold py-2.5 px-6 rounded-md border border-white/20 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {!gameReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
            <span className="text-sm text-white">Loading...</span>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative overflow-hidden bg-black w-full flex justify-center"
      />
    </div>
  );
}
