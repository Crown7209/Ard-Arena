"use client";

import CoinHuntMenu from "@/components/game/coin-hunt/CoinHuntMenu";
import CoinHuntGameOver from "@/components/game/coin-hunt/CoinHuntGameOver";
import CoinHuntPlaying from "@/components/game/coin-hunt/CoinHuntPlaying";
import { useCoinHuntGame } from "@/components/game/coin-hunt/useCoinHuntGame";

export default function CoinHuntGame() {
  const {
    canvasRef,
    gameState,
    setGameState,
    score,
    timer,
    collectedLoot,
    showLeaderboard,
    setShowLeaderboard,
    combo,
    comboMultiplier,
    magnetActive,
    speedBoostActive,
    playerLevel,
    playerXP,
    leaderboard,
    joystickRef,
    startGame,
    xpProgress,
    XP_TO_LEVEL,
    XP_PER_POINT,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  } = useCoinHuntGame();

  if (gameState === "menu") {
    return (
      <CoinHuntMenu
        playerLevel={playerLevel}
        playerXP={playerXP}
        xpProgress={xpProgress}
        startGame={startGame}
        showLeaderboard={showLeaderboard}
        setShowLeaderboard={setShowLeaderboard}
        leaderboard={leaderboard}
        xpToLevel={XP_TO_LEVEL}
      />
    );
  }

  if (gameState === "gameover") {
    return (
      <CoinHuntGameOver
        score={score}
        timer={timer}
        playerLevel={playerLevel}
        playerXP={playerXP}
        xpProgress={xpProgress}
        collectedLoot={collectedLoot}
        startGame={startGame}
        setGameState={setGameState}
        xpToLevel={XP_TO_LEVEL}
        xpPerPoint={XP_PER_POINT}
      />
    );
  }

  return (
    <CoinHuntPlaying
      score={score}
      timer={timer}
      playerLevel={playerLevel}
      combo={combo}
      comboMultiplier={comboMultiplier}
      speedBoostActive={speedBoostActive}
      magnetActive={magnetActive}
      canvasRef={canvasRef}
      joystickRef={joystickRef}
      CANVAS_WIDTH={CANVAS_WIDTH}
      CANVAS_HEIGHT={CANVAS_HEIGHT}
    />
  );
}
