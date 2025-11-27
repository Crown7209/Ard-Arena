import React, { useState, useRef, useEffect } from "react";
import { Star, Trophy, X, HelpCircle, ArrowLeft, Coins } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { LeaderboardEntry } from "./types";
import Image from "next/image";

interface CoinHuntMenuProps {
  playerLevel: number;
  playerXP: number;
  xpProgress: number;
  startGame: () => void;
  showLeaderboard: boolean;
  setShowLeaderboard: (show: boolean) => void;
  leaderboard: LeaderboardEntry[];
  xpToLevel: (level: number) => number;
  selectedCharacter: string;
  setSelectedCharacter: (char: string) => void;
}

const CoinHuntMenu: React.FC<CoinHuntMenuProps> = ({
  playerLevel,
  playerXP,
  xpProgress,
  startGame,
  showLeaderboard,
  setShowLeaderboard,
  leaderboard,
  xpToLevel,
  selectedCharacter,
  setSelectedCharacter,
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [coins, setCoins] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch coins
  useEffect(() => {
    const fetchCoins = async () => {
      if (authUser?.id) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("coins")
            .eq("id", authUser.id)
            .single();

          if (error) {
            console.error("Error fetching coins:", error);
            setCoins(0);
          } else if (data) {
            const coinsValue = data.coins;
            if (coinsValue === null || coinsValue === undefined) {
              setCoins(100);
            } else {
              setCoins(coinsValue);
            }
          }
        } catch (err) {
          console.error("Unexpected error fetching coins:", err);
          setCoins(0);
        }
      }
    };

    fetchCoins();

    if (authUser?.id) {
      const channel = supabase
        .channel(`coin-hunt-coins-${authUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "users",
            filter: `id=eq.${authUser.id}`,
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
  }, [authUser]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowTutorial(false);
      }
    };

    if (showTutorial) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [showTutorial]);

  const characters = [
    { id: "char1", name: "Character 1", image: "/images/char1.png" },
    { id: "char2", name: "Character 2", image: "/images/char2.png" },
    { id: "char3", name: "Character 3", image: "/images/char3.png" },
  ];

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 md:p-6 overflow-hidden"
      style={{ backgroundColor: "#021526" }}
    >
      {/* Creative Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs with smooth animations */}
        <div
          className="absolute top-0 left-0 w-96 h-96 bg-[#0A5EB0]/20 rounded-full blur-3xl"
          style={{
            animation: "coinHuntFloat 8s ease-in-out infinite",
          }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-[#0A5EB0]/15 rounded-full blur-3xl"
          style={{
            animation: "coinHuntFloat 10s ease-in-out infinite reverse",
            animationDelay: "1s",
          }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0A5EB0]/10 rounded-full blur-3xl"
          style={{
            animation: "coinHuntPulse 6s ease-in-out infinite",
            animationDelay: "2s",
          }}
        ></div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(#0A5EB0 1px, transparent 1px),
              linear-gradient(90deg, #0A5EB0 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#0A5EB0]/30 rounded-full blur-sm"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animation: `coinHuntFloat 12s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          ></div>
        ))}
      </div>
      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 md:top-6 md:left-6 z-30 inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[#0A5EB0]/50 bg-[#0A5EB0]/10 text-[#0A5EB0] hover:bg-[#0A5EB0]/20 transition-all duration-200"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4 text-[#0A5EB0]" />
      </button>

      {/* Coins Display */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30">
        <div className="flex items-center gap-2 rounded-xl border border-[#0A5EB0]/50 bg-[#0A5EB0]/10 px-3 md:px-4 py-2 backdrop-blur-sm">
          <Coins className="w-4 h-4 md:w-5 md:h-5 text-[#0A5EB0]" />
          <span className="text-[#0A5EB0] font-bold text-sm md:text-base">
            {coins}
          </span>
        </div>
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-4 md:space-y-6">
        {/* Player Stats */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-[#0A5EB0]/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-[#0A5EB0]" />
              <span className="text-white font-bold text-sm md:text-base">
                Level {playerLevel}
              </span>
            </div>
            <span className="text-white/60 text-xs md:text-sm">
              {playerXP} / {xpToLevel(playerLevel)} XP
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 md:h-2.5">
            <div
              className="h-2 md:h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${xpProgress}%`,
                backgroundColor: "#0A5EB0",
              }}
            />
          </div>
        </div>

        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400 mb-4">
          COIN HUNT
        </h1>
        <p className="text-xl text-cyan-300 mb-2">Vertical Survival</p>
        <p className="text-slate-400 mb-8">Collect rare Coins and survive!</p>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-cyan-500/20">
          <h2 className="text-lg font-bold text-white mb-4">How to Play</h2>
          <ul className="text-left text-slate-300 space-y-2 text-sm">
            <li>🎮 Use Arrow Keys or WASD to move</li>
            <li>💎 Collect colored Coin loot</li>
            <li>⚡ Power-ups: Speed, Magnet, Time (+10s)</li>
            <li>🔥 Build combos for multipliers!</li>
            <li>🧱 Avoid gray obstacles!</li>
            <li>🤖 Escape the red AI bot!</li>
            <li>📈 Earn XP and level up!</li>
            <li>⏱️ Survive</li>
          </ul>
        </div>

        {/* Character Selection */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-[#0A5EB0]/30">
          <h3 className="text-white font-bold text-sm md:text-base mb-3 md:mb-4 text-center">
            Choose Your Character
          </h3>
          <div className="flex justify-center gap-3 md:gap-4">
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedCharacter(char.id)}
                className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 transition-all duration-200 hover:scale-110 active:scale-95 ${
                  selectedCharacter === char.id
                    ? "border-[#0A5EB0] bg-[#0A5EB0]/20 shadow-lg shadow-[#0A5EB0]/50"
                    : "border-white/20 bg-white/5 hover:border-[#0A5EB0]/50"
                }`}
              >
                <Image
                  src={char.image}
                  alt={char.name}
                  fill
                  className="object-contain p-2"
                  sizes="96px"
                />
                {selectedCharacter === char.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#0A5EB0] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 md:space-y-3">
          <button
            onClick={startGame}
            className="w-full bg-linear-to-r from-cyan-500 to-purple-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:scale-105 transition-transform cursor-pointer shadow-md shadow-cyan-500/50"
          >
            START GAME
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTutorial(true)}
              className="flex-1 bg-white/5 text-white font-semibold py-2.5 md:py-3 px-4 rounded-xl hover:bg-white/10 active:scale-95 transition-all duration-200 border border-white/10 flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">How to Play</span>
            </button>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="flex-1 bg-white/5 text-white font-semibold py-2.5 md:py-3 px-4 rounded-xl hover:bg-white/10 active:scale-95 transition-all duration-200 border border-white/10"
            >
              <span className="text-xs md:text-sm">
                {showLeaderboard ? "Hide" : "View"} Leaderboard
              </span>
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        {showLeaderboard && (
          <div className="mt-4 md:mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-[#0A5EB0]/20">
            <h3 className="text-white font-bold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#0A5EB0]" />
              Daily Leaderboard
            </h3>
            {leaderboard.length === 0 ? (
              <p className="text-white/60 text-xs md:text-sm">
                No scores yet. Be the first!
              </p>
            ) : (
              <div className="space-y-1.5 md:space-y-2">
                {leaderboard.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 md:p-3 rounded-lg ${
                      idx === 0
                        ? "bg-[#0A5EB0]/20 border border-[#0A5EB0]/40"
                        : idx === 1
                        ? "bg-white/10 border border-white/20"
                        : idx === 2
                        ? "bg-white/5 border border-white/10"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="text-white/80 font-bold w-5 md:w-6 text-xs md:text-sm">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-white font-medium text-xs md:text-sm">
                          {entry.name}
                        </div>
                        <div className="text-xs text-white/50">
                          Level {entry.level}
                        </div>
                      </div>
                    </div>
                    <div className="text-[#0A5EB0] font-bold text-sm md:text-base">
                      {entry.score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative bg-[#021526] rounded-2xl border border-[#0A5EB0]/40 p-4 md:p-6 max-w-sm w-full shadow-2xl"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowTutorial(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Modal Content */}
            <div className="pr-8">
              <h2 className="text-lg md:text-xl font-bold text-white mb-4">
                How to Play
              </h2>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#0A5EB0]">•</span>
                  <span>
                    <strong>Move:</strong> Arrow Keys or WASD
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0A5EB0]">•</span>
                  <span>
                    <strong>Collect</strong> colored coins
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0A5EB0]">•</span>
                  <span>
                    <strong>Avoid</strong> gray obstacles
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0A5EB0]">•</span>
                  <span>
                    <strong>Escape</strong> the red AI bot
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0A5EB0]">•</span>
                  <span>
                    <strong>Power-ups:</strong> Speed, Magnet, Time
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0A5EB0]">•</span>
                  <span>
                    <strong>Survive</strong> 60 seconds
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinHuntMenu;
