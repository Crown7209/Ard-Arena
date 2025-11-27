"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import GameCard from "./GameCard";
import { roomService } from "@/services/roomService";
import { playerService } from "@/services/playerService";
import { usePlayerStore } from "@/store/playerStore";

type Game = {
  id: string;
  title: string;
  description: string;
  rating: number;
  players: string;
  image: string;
  gameType: "fighting" | "other";
};

type GameCategory = {
  name: string;
  games: Game[];
};

interface GameBrowserProps {
  onGameSelect?: (gameId: string) => void;
}

const GameBrowser = ({ onGameSelect }: GameBrowserProps) => {
  const router = useRouter();
  const { setCurrentPlayerId } = usePlayerStore();
  const [loadingGameId, setLoadingGameId] = useState<string | null>(null);

  const handleGameClick = async (game: Game) => {
    if (loadingGameId) return;

    // If we are in selection mode (host selecting game), call the callback
    if (onGameSelect) {
      onGameSelect(game.id);
      return;
    }

    setLoadingGameId(game.id);

    // For Fight Game, create room and go to lobby (Standard Flow)
    // The user wants it to go to "mk" which is /game
    if (game.gameType === "fighting") {
      // Clear previous session data
      localStorage.removeItem("playerId");
      localStorage.removeItem("currentRoomCode");
      setCurrentPlayerId(null);

      const hostId = Math.random().toString(36).substring(7);
      localStorage.setItem("hostId", hostId);

      try {
        const room = await roomService.createRoom(hostId);
        if (room) {
          // Set room to selecting status and redirect to home
          await roomService.updateRoomStatus(room.id, "selecting");
          localStorage.setItem("currentRoomCode", room.code);
          setLoadingGameId(null);
          router.push("/");
          return;
        } else {
          alert("Failed to create room");
        }
      } catch (error) {
        console.error(error);
        alert("Error creating room");
      } finally {
        setLoadingGameId(null);
      }
      return;
    }

    // For Color Match game, navigate directly to the game page
    if (game.id === "game-2") {
      setLoadingGameId(null);
      router.push("/colormatch");
      return;
    }

    // For Coin Hunt game, navigate directly to the game page
    if (game.id === "coin-hunt") {
      setLoadingGameId(null);
      router.push("/coin-hunt");
      return;
    }

    // For other games, use the normal flow

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
      setLoadingGameId(null);
    }
  };

  const categories: GameCategory[] = [
    {
      name: "Children",
      games: [
        {
          id: "game-1",
          title: "Adventure Quest",
          description:
            "Embark on an exciting journey through magical worlds and solve puzzles together!",
          rating: 5,
          players: "1-4 players",
          image: "/images/gamepreview/adventure-quest.png",
          gameType: "other",
        },
        {
          id: "game-2",
          title: "Color Match",
          description:
            "Match colors and patterns in this fun and educational game for kids!",
          rating: 4.5,
          players: "1-2 players",
          image: "/images/gamepreview/color-match.png",
          gameType: "other",
        },
        {
          id: "game-3",
          title: "Animal Friends",
          description:
            "Help cute animals solve problems and learn about friendship!",
          rating: 5,
          players: "1-3 players",
          image: "/images/gamepreview/animal-friends.png",
          gameType: "other",
        },
      ],
    },
    {
      name: "Youth",
      games: [
        {
          id: "fighting-game",
          title: "Fight Game",
          description:
            "Intense multiplayer fighting game! Battle your friends in epic combat with various moves and strategies.",
          rating: 5,
          players: "1-2 players",
          image: "/images/fighting-grid.svg",
          gameType: "fighting",
        },
        {
          id: "game-5",
          title: "Racing Challenge",
          description:
            "Fast-paced racing action! Compete against friends in thrilling races with power-ups and obstacles.",
          rating: 4.5,
          players: "1-4 players",
          image: "/images/gamepreview/racing-challenge.png",
          gameType: "other",
        },
        {
          id: "game-6",
          title: "Battle Arena",
          description:
            "Strategic combat game where you build your team and fight in intense battles!",
          rating: 4.5,
          players: "2-6 players",
          image: "/images/gamepreview/battle-arena.png",
          gameType: "other",
        },
      ],
    },
    {
      name: "Adults",
      games: [
        {
          id: "coin-hunt",
          title: "Coin Hunt",
          description:
            "Collect coins, avoid obstacles, and escape the AI bot in this fast-paced survival game!",
          rating: 5,
          players: "1 player",
          image: "/images/gamepreview/coin-hunters.png",
          gameType: "other",
        },
        {
          id: "game-7",
          title: "Strategy Master",
          description:
            "Test your strategic thinking in this challenging board game adaptation!",
          rating: 5,
          players: "2-4 players",
          image: "/images/gamepreview/strategy-game.png",
          gameType: "other",
        },
        {
          id: "game-8",
          title: "Card Champions",
          description:
            "Classic card game experience with modern twists and competitive gameplay!",
          rating: 4.5,
          players: "2-6 players",
          image: "/images/gamepreview/card-champions.png",
          gameType: "other",
        },
      ],
    },
  ];

  return (
    <div className="relative w-full py-6 md:py-12 px-4 md:px-12">
      <div className="mx-auto max-w-7xl">
        {categories.map((category, categoryIndex) => (
          <div key={category.name} className="mb-8 md:mb-16 last:mb-0">
            <h2 className="mb-3 md:mb-6 text-base md:text-3xl font-black text-[#e0fdfb] drop-shadow-[0_0_15px_rgba(100,204,197,0.5)]">
              {category.name}
            </h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {category.games.map((game) => (
                <div key={game.id} className="relative">
                  {loadingGameId === game.id && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl md:rounded-2xl bg-black/80 backdrop-blur-sm">
                      <Loader2 className="h-4 w-4 md:h-8 md:w-8 animate-spin text-[#64ccc5]" />
                    </div>
                  )}
                  <GameCard
                    title={game.title}
                    description={game.description}
                    rating={game.rating}
                    players={game.players}
                    image={game.image}
                    onClick={() => handleGameClick(game)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBrowser;
