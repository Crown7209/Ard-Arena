"use client";

import { useEffect, useState, useRef } from "react";
import { getRandomColorPairs } from "./ColorHelper";

const GAME_STATE = {
  LEVEL_SELECT: "level_select",
  PENDING: "pending",
  PLAYING: "playing",
  BLOCKING: "blocking",
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
  medium: { name: "Medium", gridSize: 4, pairsCount: 8, time: 30 },
  hard: { name: "Hard", gridSize: 5, pairsCount: 12, time: 45 },
  extreme: { name: "Extreme", gridSize: 6, pairsCount: 18, time: 60 },
};

export default function ColorMatchGame() {
  const [selection, setSelection] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>(
    GAME_STATE.LEVEL_SELECT
  );
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [timer, setTimer] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [randomColorList, setRandomColorList] = useState<string[]>([]);
  const [activeItems, setActiveItems] = useState<Set<number>>(new Set());
  const [backgroundColor, setBackgroundColor] = useState("goldenrod");
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startLevel = (levelKey: string) => {
    const level = LEVELS[levelKey];
    setCurrentLevel(level);
    setTimer(level.time);
    const colors = getRandomColorPairs(level.pairsCount);
    setRandomColorList(colors);
    setActiveItems(new Set());
    setSelection([]);
    setMatchCount(0);
    setBackgroundColor("goldenrod");
    setGameState(GAME_STATE.PENDING);
    startCountdown();
  };

  const reset = () => {
    setSelection([]);
    setGameState(GAME_STATE.LEVEL_SELECT);
    setCurrentLevel(null);
    setTimer(0);
    setMatchCount(0);
    setBackgroundColor("goldenrod");
    setActiveItems(new Set());

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
          setGameState(GAME_STATE.FINISHED);
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return -1;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleColorClick = (idx: number) => {
    if (
      !currentLevel ||
      activeItems.has(idx) ||
      gameState === GAME_STATE.BLOCKING ||
      gameState === GAME_STATE.FINISHED ||
      timer < 0
    )
      return;

    const newSelection = [...selection, idx];
    setSelection(newSelection);
    setActiveItems((prev) => new Set(prev).add(idx));

    if (newSelection.length < 2) return;

    const firstColor = randomColorList[newSelection[0]];
    const secondColor = randomColorList[newSelection[1]];
    const isMatch = firstColor === secondColor;

    if (!isMatch) {
      setGameState(GAME_STATE.BLOCKING);
      setTimeout(() => {
        setActiveItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(newSelection[0]);
          newSet.delete(newSelection[1]);
          return newSet;
        });
        setSelection([]);
        setGameState(GAME_STATE.PLAYING);
      }, 500);
      return;
    }

    // Match found
    setMatchCount((prev) => {
      const newCount = prev + 1;
      if (newCount === currentLevel.pairsCount) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        setGameState(GAME_STATE.FINISHED);
      }
      return newCount;
    });
    setSelection([]);
    setBackgroundColor(randomColorList[idx]);
  };

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const getTimerText = () => {
    if (timer < 0) return "Game Over!";
    if (currentLevel && matchCount === currentLevel.pairsCount)
      return "You WIN! 😍";
    return `${timer}s`;
  };

  // Level Selection Screen
  if (gameState === GAME_STATE.LEVEL_SELECT) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center p-5 bg-linear-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">
            Color Match
          </h1>
          <p className="text-xl text-white/90 mb-12 drop-shadow-lg">
            Choose your difficulty level
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(LEVELS).map(([key, level]) => (
              <button
                key={key}
                onClick={() => startLevel(key)}
                className="group relative bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-8 hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                  {level.name}
                </div>
                <div className="text-white/80 text-sm mb-3">
                  {level.gridSize}x{level.gridSize} Grid
                </div>
                <div className="text-white/70 text-xs">
                  {level.pairsCount} pairs • {level.time}s
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Game Screen
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center p-5 transition-colors duration-400"
      style={{ backgroundColor }}
    >
      <div className="max-w-[500px] w-full text-center">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          {currentLevel?.name} Mode
        </h1>

        {/* Timer */}
        <p className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg">
          {getTimerText()}
        </p>

        {/* Play Again Button */}
        <div className="min-h-[60px] mb-6">
          {(gameState === GAME_STATE.FINISHED ||
            (currentLevel && matchCount === currentLevel.pairsCount)) && (
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

        {/* Game Board */}
        <div className="bg-white/90 rounded-xl p-5 shadow-2xl">
          <ul
            className="grid gap-3 list-none p-0 m-0"
            style={{
              gridTemplateColumns: `repeat(${
                currentLevel?.gridSize || 4
              }, 1fr)`,
            }}
          >
            {randomColorList.map((color, idx) => (
              <li
                key={idx}
                className={`
                  aspect-square rounded-lg cursor-pointer relative overflow-hidden
                  border-2 transition-all duration-200
                  ${
                    activeItems.has(idx) ? "border-gray-400" : "border-gray-300"
                  }
                  hover:scale-105 hover:border-gray-500
                `}
                onClick={() => handleColorClick(idx)}
              >
                <div
                  className={`
                    absolute inset-0 transition-all duration-300
                    ${activeItems.has(idx) ? "" : "bg-white shadow-inner"}
                  `}
                  style={activeItems.has(idx) ? { backgroundColor: color } : {}}
                ></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
