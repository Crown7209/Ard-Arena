"use client";

import NFTHuntMenu from "@/components/game/nft-hunt/NFTHuntMenu";
import NFTHuntGameOver from "@/components/game/nft-hunt/NFTHuntGameOver";
import NFTHuntPlaying from "@/components/game/nft-hunt/NFTHuntPlaying";
import { useNFTHuntGame } from "@/components/game/nft-hunt/useNFTHuntGame";

export default function NFTHuntGame() {
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
  } = useNFTHuntGame();

  if (gameState === "menu") {
    return (
      <NFTHuntMenu
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
      <NFTHuntGameOver
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
    <NFTHuntPlaying
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
