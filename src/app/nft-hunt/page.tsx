"use client";

import { useState, useEffect } from "react";
import NFTHuntMenu from "@/components/game/nft-hunt/NFTHuntMenu";
import NFTHuntGameOver from "@/components/game/nft-hunt/NFTHuntGameOver";
import NFTHuntPlaying from "@/components/game/nft-hunt/NFTHuntPlaying";
import { useNFTHuntGame } from "@/components/game/nft-hunt/useNFTHuntGame";

export default function NFTHuntGame() {
  const [selectedCharacter, setSelectedCharacter] = useState<string>("char1");

  // Load saved character from localStorage
  useEffect(() => {
    const savedChar = localStorage.getItem("coin_hunt_character");
    if (savedChar) {
      setSelectedCharacter(savedChar);
    }
  }, []);

  // Save character selection
  const handleCharacterChange = (char: string) => {
    setSelectedCharacter(char);
    localStorage.setItem("coin_hunt_character", char);
  };

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
    resumeGame,
    canResume,
    xpProgress,
    XP_TO_LEVEL,
    XP_PER_POINT,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  } = useNFTHuntGame(selectedCharacter);

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
        selectedCharacter={selectedCharacter}
        setSelectedCharacter={handleCharacterChange}
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
        resumeGame={resumeGame}
        canResume={canResume}
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
