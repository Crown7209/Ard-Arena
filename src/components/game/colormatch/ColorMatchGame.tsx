"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getRandomColorPairs } from "./ColorHelper";

const GAME_STATE = {
  LEVEL_SELECT: "level_select",
  PLAYING: "playing",
  FINISHED: "finished",
} as const;

type GameState = (typeof GAME_STATE)[keyof typeof GAME_STATE];

type Level = {
  name: string;
  gridSize: number;
  pairsCount: number;
  time: number;
};

const LEVELS: Record<string, Level> = {
  medium: { name: "Medium", gridSize: 4, pairsCount: 8, time: 50 },
  hard: { name: "Hard", gridSize: 5, pairsCount: 12, time: 80 },
  extreme: { name: "Extreme", gridSize: 6, pairsCount: 18, time: 100 },
};

const POINTS_BY_LEVEL: Record<string, number> = {
  medium: 1,
  hard: 2,
  extreme: 3,
};

const COIN_COST_TO_PLAY = 50;
const COIN_COST_TO_CONTINUE = 30;
const TIME_EXTENSION = 30; // seconds

export default function ColorMatchGame() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [selection, setSelection] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>(GAME_STATE.LEVEL_SELECT);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [currentLevelKey, setCurrentLevelKey] = useState<string>("");
  const [timer, setTimer] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [randomColorList, setRandomColorList] = useState<string[]>([]);
  const [activeItems, setActiveItems] = useState<Set<number>>(new Set());
  const [backgroundColor, setBackgroundColor] = useState("#BAE1FF");
  const [foundColors, setFoundColors] = useState<Set<string>>(new Set());
  const [targetColor, setTargetColor] = useState<string>("#BAE1FF");
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [draggedTiles, setDraggedTiles] = useState<Set<number>>(new Set());
  const [coins, setCoins] = useState<number>(100);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tileTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const clearTileTimer = (idx: number) => {
    const timer = tileTimersRef.current.get(idx);
    if (timer) {
      clearTimeout(timer);
      tileTimersRef.current.delete(idx);
    }
  };

  const hideTile = (idx: number) => {
    if (matchedPairs.has(idx)) return;
    clearTileTimer(idx);
    setActiveItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(idx);
      return newSet;
    });
    setDraggedTiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(idx);
      return newSet;
    });
  };

  const revealTile = (idx: number) => {
    if (matchedPairs.has(idx)) return;
    clearTileTimer(idx);
    setActiveItems((prev) => new Set(prev).add(idx));
    
    const timer = setTimeout(() => {
      setActiveItems((prev) => {
        if (!matchedPairs.has(idx) && !selection.includes(idx) && prev.has(idx)) {
          const newSet = new Set(prev);
          newSet.delete(idx);
          return newSet;
        }
        return prev;
      });
      tileTimersRef.current.delete(idx);
    }, 600);
    
    tileTimersRef.current.set(idx, timer);
  };

  const checkAndDeductCoins = async (amount: number): Promise<boolean> => {
    if (!authUser?.id) {
      alert("Please log in to play");
      return false;
    }

    const { data, error } = await supabase
      .from("users")
      .select("coins")
      .eq("id", authUser.id)
      .single();

    if (error) {
      console.error("Error fetching coins:", error);
      alert("Error checking coins");
      return false;
    }

    const currentCoins = data?.coins || 0;
    if (currentCoins < amount) {
      alert(`You need ${amount} coins to play. You have ${currentCoins} coins.`);
      return false;
    }

    const newCoins = currentCoins - amount;
    const { error: updateError } = await supabase
      .from("users")
      .update({ coins: newCoins })
      .eq("id", authUser.id);

    if (updateError) {
      console.error("Error deducting coins:", updateError);
      alert("Error deducting coins");
      return false;
    }

    setCoins(newCoins);
    return true;
  };

  const addCoins = async (amount: number) => {
    if (!authUser?.id) return;

    const { data } = await supabase
      .from("users")
      .select("coins")
      .eq("id", authUser.id)
      .single();

    if (data) {
      const currentCoins = data.coins || 0;
      const newCoins = currentCoins + amount;
      await supabase
        .from("users")
        .update({ coins: newCoins })
        .eq("id", authUser.id);
      setCoins(newCoins);
    }
  };

  const startLevel = async (levelKey: string) => {
    const canPlay = await checkAndDeductCoins(COIN_COST_TO_PLAY);
    if (!canPlay) return;

    const level = LEVELS[levelKey];
    setCurrentLevel(level);
    setCurrentLevelKey(levelKey);
    setTimer(level.time);
    const colors = getRandomColorPairs(level.pairsCount);
    setRandomColorList(colors);
    setActiveItems(new Set());
    setSelection([]);
    setMatchCount(0);
    setFoundColors(new Set());
    setMatchedPairs(new Set());
    setDraggedTiles(new Set());
    setShowContinueButton(false);
    
    tileTimersRef.current.forEach((timer) => clearTimeout(timer));
    tileTimersRef.current.clear();
    
    const uniqueColors = Array.from(new Set(colors));
    const randomStartColor = uniqueColors[Math.floor(Math.random() * uniqueColors.length)];
    setBackgroundColor(randomStartColor);
    setTargetColor(randomStartColor);
    setGameState(GAME_STATE.PLAYING);
    startCountdown();
  };

  const handleContinue = async () => {
    const canContinue = await checkAndDeductCoins(COIN_COST_TO_CONTINUE);
    if (!canContinue) return;

    setTimer((prev) => prev + TIME_EXTENSION);
    setShowContinueButton(false);
    setGameState(GAME_STATE.PLAYING);
    startCountdown();
  };

  const reset = () => {
    setSelection([]);
    setGameState(GAME_STATE.LEVEL_SELECT);
    setCurrentLevel(null);
    setTimer(0);
    setMatchCount(0);
    setFoundColors(new Set());
    setMatchedPairs(new Set());
    setDraggedTiles(new Set());
    setActiveItems(new Set());
    
    tileTimersRef.current.forEach((timer) => clearTimeout(timer));
    tileTimersRef.current.clear();
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  const startCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          // Show continue button instead of immediately finishing
          setShowContinueButton(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleColorClick = (idx: number) => {
    if (
      !currentLevel ||
      matchedPairs.has(idx) ||
      gameState === GAME_STATE.FINISHED ||
      timer <= 0 ||
      showContinueButton
    )
      return;

    if (selection.includes(idx)) return;

    revealTile(idx);
    const newSelection = [...selection, idx];
    setSelection(newSelection);

    if (newSelection.length < 2) {
      return;
    }

    const firstColor = randomColorList[newSelection[0]];
    const secondColor = randomColorList[newSelection[1]];
    const isMatch = firstColor === secondColor && firstColor === targetColor;

    clearTileTimer(newSelection[0]);
    clearTileTimer(newSelection[1]);

    if (!isMatch) {
      setTimeout(() => {
        setActiveItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(newSelection[0]);
          newSet.delete(newSelection[1]);
          return newSet;
        });
        setSelection([]);
      }, 600);
      return;
    }

    const matchedColor = randomColorList[newSelection[0]];
    const updatedFoundColors = new Set(foundColors);
    updatedFoundColors.add(matchedColor);
    setFoundColors(updatedFoundColors);
    
    const allGameColors = Array.from(new Set(randomColorList));
    const remainingColors = allGameColors.filter(
      (color) => !updatedFoundColors.has(color)
    );
    
    let newBgColor: string;
    if (remainingColors.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingColors.length);
      newBgColor = remainingColors[randomIndex];
    } else if (allGameColors.length > 0) {
      const randomIndex = Math.floor(Math.random() * allGameColors.length);
      newBgColor = allGameColors[randomIndex];
    } else {
      newBgColor = "#BAE1FF";
    }
    
    setBackgroundColor(newBgColor);
    setTargetColor(newBgColor);
    
    setMatchedPairs((prev) => {
      const newSet = new Set(prev);
      newSet.add(newSelection[0]);
      newSet.add(newSelection[1]);
      return newSet;
    });
    
    setActiveItems((prev) => {
      const newSet = new Set(prev);
      newSet.add(newSelection[0]);
      newSet.add(newSelection[1]);
      return newSet;
    });
    
    setMatchCount((prev) => {
      const newCount = prev + 1;
      if (newCount === currentLevel.pairsCount) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        setGameState(GAME_STATE.FINISHED);
        setShowContinueButton(false);
        
        // Game won! Return 50 coins + add point to leaderboard
        if (authUser && currentLevelKey) {
          const pointsToAdd = POINTS_BY_LEVEL[currentLevelKey] || 0;
          if (pointsToAdd > 0) {
            // Return coins
            addCoins(COIN_COST_TO_PLAY);
            
            // Add points
            supabase
              .from("users")
              .select("color_match_points")
              .eq("id", authUser.id)
              .single()
              .then(({ data, error: fetchError }) => {
                if (!fetchError && data) {
                  const currentPoints = data.color_match_points || 0;
                  const newPoints = currentPoints + pointsToAdd;
                  supabase
                    .from("users")
                    .update({ color_match_points: newPoints })
                    .eq("id", authUser.id)
                    .then(({ error: updateError }) => {
                      if (updateError) {
                        console.error("Error updating color match points:", updateError);
                      }
                    });
                } else if (fetchError && fetchError.code === "PGRST116") {
                  // User doesn't exist in users table, create it
                  supabase
                    .from("users")
                    .insert({
                      id: authUser.id,
                      email: authUser.email || "",
                      color_match_points: pointsToAdd,
                    })
                    .then(({ error: insertError }) => {
                      if (insertError) {
                        console.error("Error creating user:", insertError);
                      }
                    });
                }
              });
          }
        }
      }
      return newCount;
    });
    
    setSelection([]);
  };

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
            console.error("Error fetching coins in game:", error);
            setCoins(0);
          } else if (data) {
            const coinsValue = data.coins;
            if (coinsValue === null || coinsValue === undefined) {
              setCoins(100);
              await supabase
                .from("users")
                .update({ coins: 100 })
                .eq("id", authUser.id);
            } else {
              setCoins(coinsValue);
            }
          }
        } catch (err) {
          console.error("Unexpected error fetching coins in game:", err);
          setCoins(0);
        }
      }
    };

    fetchCoins();
  }, [authUser]);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      tileTimersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const getTimerText = () => {
    if (showContinueButton) return "Time's Up!";
    if (currentLevel && matchCount === currentLevel.pairsCount)
      return "You WIN! 😍";
    return `${timer}s`;
  };

  if (gameState === GAME_STATE.LEVEL_SELECT) {
    return (
      <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center p-4 md:p-6">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/gamepreview/color-match.png"
            alt="Color Match Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="absolute inset-0 z-10 bg-black/20" />
        
        <button
          type="button"
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 md:top-6 md:left-6 z-30 inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/30 bg-white/5 text-white hover:bg-white/10 transition-all duration-200"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
        
        <div className="relative z-20 max-w-4xl w-full text-center flex flex-col h-full justify-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-2 md:mb-4 drop-shadow-2xl">
            Color Match
          </h1>
          <p className="text-base md:text-xl text-white/90 mb-4 md:mb-6 drop-shadow-lg">
            Choose your difficulty level
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full">
            {Object.entries(LEVELS).map(([key, level]) => {
              const canAfford = coins >= COIN_COST_TO_PLAY;
              return (
                <button
                  key={key}
                  onClick={() => startLevel(key)}
                  disabled={!canAfford}
                  className={`group relative bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl md:rounded-2xl px-4 py-6 md:px-6 md:py-8 transition-all duration-300 ${
                    canAfford
                      ? "hover:bg-white/20 hover:scale-105 hover:shadow-2xl"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2 group-hover:scale-110 transition-transform">
                    {level.name}
                  </div>
                  <div className="text-white/80 text-xs md:text-sm mb-1 md:mb-2">
                    {level.gridSize}x{level.gridSize} Grid
                  </div>
                  <div className="text-white/70 text-[10px] md:text-xs mb-1">
                    {level.pairsCount} pairs • {level.time}s
                  </div>
                  <div className="text-white/90 text-xs md:text-sm font-semibold">
                    {COIN_COST_TO_PLAY} coins
                  </div>
                  {!canAfford && (
                    <div className="text-red-300 text-[10px] md:text-xs mt-1">
                      Not enough coins
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center p-5 transition-colors duration-100 relative"
      style={{ backgroundColor }}
    >
      {/* Go Back Button */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 md:top-6 md:left-6 z-30 inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/30 bg-white/5 text-white hover:bg-white/10 transition-all duration-200"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4 text-white" />
      </button>
      
      <div className="max-w-[500px] w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          {currentLevel?.name} Mode
        </h1>

        <p className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg">
          {getTimerText()}
        </p>

        <div className="min-h-[60px] mb-6">
          {showContinueButton && (
            <div className="flex flex-col gap-3 items-center">
              <p className="text-white/80 mb-2">Continue playing?</p>
              <button
                className="px-6 py-3 text-lg font-bold text-white bg-[#64ccc5] border-2 border-[#64ccc5] rounded-lg hover:bg-[#56b4ae] hover:scale-105 transition-all duration-300 shadow-lg"
                onClick={handleContinue}
                disabled={coins < COIN_COST_TO_CONTINUE}
              >
                Continue ({COIN_COST_TO_CONTINUE} coins) +{TIME_EXTENSION}s
              </button>
              {coins < COIN_COST_TO_CONTINUE && (
                <p className="text-white/60 text-sm">Not enough coins</p>
              )}
              <button
                className="px-6 py-3 text-sm font-semibold text-white/80 bg-black/30 border border-white/30 rounded-lg hover:bg-black/50 transition-all duration-300"
                onClick={() => {
                  setGameState(GAME_STATE.FINISHED);
                  setShowContinueButton(false);
                }}
              >
                End Game
              </button>
            </div>
          )}
          {(gameState === GAME_STATE.FINISHED ||
            (currentLevel && matchCount === currentLevel.pairsCount)) && !showContinueButton && (
            <div className="flex gap-3 justify-center">
              <button
                className="px-6 py-3 text-lg font-bold text-white bg-black/30 border-2 border-white rounded-lg hover:bg-black/50 hover:scale-105 transition-all duration-300"
                onClick={reset}
              >
                Change Level
              </button>
              <button
                className="px-6 py-3 text-lg font-bold text-white bg-white/20 border-2 border-white rounded-lg hover:bg-white/30 hover:scale-105 transition-all duration-300"
                onClick={() =>
                  currentLevel &&
                  startLevel(
                    Object.keys(LEVELS).find(
                      (k) => LEVELS[k] === currentLevel
                    ) || "medium"
                  )
                }
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        <div 
          className="bg-white/90 rounded-xl p-5 shadow-2xl"
          onTouchMove={(e) => {
            if (showContinueButton || timer <= 0) return;
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element) {
              const liElement = element.closest('li[data-tile-index]');
              if (liElement) {
                const tileIndex = parseInt(liElement.getAttribute('data-tile-index') || '-1');
                if (tileIndex >= 0 && tileIndex < randomColorList.length && !matchedPairs.has(tileIndex) && !selection.includes(tileIndex)) {
                  revealTile(tileIndex);
                  setDraggedTiles((prev) => {
                    const newSet = new Set(prev);
                    newSet.add(tileIndex);
                    if (newSet.size > 3) {
                      const first = Array.from(newSet)[0];
                      newSet.delete(first);
                      hideTile(first);
                    }
                    return newSet;
                  });
                }
              }
            }
          }}
          onTouchEnd={() => {
            setTimeout(() => {
              setDraggedTiles((prev) => {
                const newSet = new Set(prev);
                newSet.forEach((tileIdx) => {
                  if (!matchedPairs.has(tileIdx) && !selection.includes(tileIdx)) {
                    hideTile(tileIdx);
                  }
                });
                return new Set();
              });
            }, 600);
          }}
        >
          <ul
            className="grid gap-3 list-none p-0 m-0"
            style={{
              gridTemplateColumns: `repeat(${
                currentLevel?.gridSize || 4
              }, 1fr)`,
            }}
          >
            {randomColorList.map((color, idx) => {
              const isMatched = matchedPairs.has(idx);
              const isActive = activeItems.has(idx) || draggedTiles.has(idx);
              
              return (
                <li
                  key={idx}
                  data-tile-index={idx}
                  className={`
                    aspect-square rounded-lg relative overflow-hidden
                    border-2 transition-all duration-100
                    ${
                      isMatched
                        ? "border-green-500 cursor-default"
                        : isActive
                        ? "border-gray-400 cursor-pointer"
                        : "border-gray-300 cursor-pointer hover:scale-105 hover:border-gray-400"
                    }
                  `}
                  onClick={() => handleColorClick(idx)}
                  onTouchStart={(e) => {
                    if (isMatched || selection.includes(idx) || showContinueButton || timer <= 0) return;
                    revealTile(idx);
                    setDraggedTiles((prev) => {
                      const newSet = new Set(prev);
                      newSet.add(idx);
                      if (newSet.size > 3) {
                        const first = Array.from(newSet)[0];
                        newSet.delete(first);
                        hideTile(first);
                      }
                      return newSet;
                    });
                  }}
                >
                  <div
                    className={`
                      absolute inset-0 transition-all duration-300 ease-in-out
                      ${isMatched || isActive ? "" : "bg-white shadow-inner"}
                    `}
                    style={
                      isMatched || isActive ? { backgroundColor: color } : {}
                    }
                  ></div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
