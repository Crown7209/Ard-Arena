import { useEffect, useRef, useState } from "react";
import {
  Position,
  Loot,
  PowerUp,
  Obstacle,
  AIBot,
  LeaderboardEntry,
} from "./types";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const CANVAS_WIDTH = 600; // Increased from 400 to accommodate larger characters
const CANVAS_HEIGHT = 1000; // Increased from 800 to accommodate larger characters
const PLAYER_SIZE = 65; // Increased to make characters more prominent and visible
const LOOT_SIZE = 20;
const POWERUP_SIZE = 25;
const BASE_PLAYER_SPEED = 5;

const XP_PER_POINT = 10;
const XP_TO_LEVEL = (level: number) =>
  Math.floor(100 * Math.pow(1.5, level - 1));
const COIN_COST_TO_RESUME = 20;

export const useNFTHuntGame = (selectedCharacter: string = "char1") => {
  const { user: authUser } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">(
    "menu"
  );
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [collectedLoot, setCollectedLoot] = useState<Loot[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [canResume, setCanResume] = useState(false);

  const [combo, setCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [playerSpeed, setPlayerSpeed] = useState(BASE_PLAYER_SPEED);
  const [magnetActive, setMagnetActive] = useState(false);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Character images
  const playerImageRef = useRef<HTMLImageElement | null>(null);
  const botImageRef = useRef<HTMLImageElement | null>(null);

  const playerPos = useRef<Position>({
    x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
    y: CANVAS_HEIGHT - 100,
  });
  const loots = useRef<Loot[]>([]);
  const powerUps = useRef<PowerUp[]>([]);
  const obstacles = useRef<Obstacle[]>([]);
  const aiBots = useRef<AIBot[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});
  const animationFrameId = useRef<number | null>(null);
  const lootIdCounter = useRef(0);
  const powerUpIdCounter = useRef(0);
  const obstacleIdCounter = useRef(0);
  const aiBotIdCounter = useRef(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const comboTimeout = useRef<NodeJS.Timeout | null>(null);
  const speedBoostTimeout = useRef<NodeJS.Timeout | null>(null);
  const magnetTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastCollectTime = useRef<number>(0);
  const lastBotSpawnTime = useRef<number>(0);
  const gameStartTime = useRef<number>(0);
  const joystickRef = useRef({ x: 0, y: 0 });

  const magnetActiveRef = useRef(false);
  const speedBoostActiveRef = useRef(false);

  const lootInterval = useRef<NodeJS.Timeout | null>(null);
  const powerUpInterval = useRef<NodeJS.Timeout | null>(null);
  const obstacleInterval = useRef<NodeJS.Timeout | null>(null);
  const gameTimeout = useRef<NodeJS.Timeout | null>(null);

  // Saved game state for resume
  const savedGameState = useRef<{
    collectedLoot: Loot[];
    score: number;
    timer: number;
    playerLevel: number;
    playerXP: number;
  } | null>(null);

  const COIN_TYPES = [
    { name: "Diamond", color: "#60A5FA", emoji: "💎" },
    { name: "Gold", color: "#FBBF24", emoji: "🪙" },
    { name: "Ruby", color: "#EF4444", emoji: "💍" },
    { name: "Emerald", color: "#10B981", emoji: "🟢" },
    { name: "Sapphire", color: "#3B82F6", emoji: "🔵" },
  ];

  // Load character images based on selection
  useEffect(() => {
    const playerImg = new Image();
    const characterPath = `/images/${selectedCharacter}.png`;
    playerImg.src = characterPath;
    playerImg.onload = () => {
      playerImageRef.current = playerImg;
    };
    playerImg.onerror = () => {
      // Fallback to char1 if image fails to load
      const fallbackImg = new Image();
      fallbackImg.src = "/images/char1.png";
      fallbackImg.onload = () => {
        playerImageRef.current = fallbackImg;
      };
    };

    const botImg = new Image();
    botImg.src = "/images/monster.png";
    botImg.onload = () => {
      botImageRef.current = botImg;
    };
  }, [selectedCharacter]);

  useEffect(() => {
    const savedLevel = localStorage.getItem("coin_hunt_level");
    const savedXP = localStorage.getItem("coin_hunt_xp");
    const savedLeaderboard = localStorage.getItem("coin_hunt_leaderboard");

    if (savedLevel) setPlayerLevel(parseInt(savedLevel));
    if (savedXP) setPlayerXP(parseInt(savedXP));
    if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));
  }, []);

  const savePlayerData = () => {
    localStorage.setItem("coin_hunt_level", playerLevel.toString());
    localStorage.setItem("coin_hunt_xp", playerXP.toString());
  };

  const addToLeaderboard = (score: number) => {
    const today = new Date().toISOString().split("T")[0];
    const newEntry: LeaderboardEntry = {
      name: `Player ${Math.floor(Math.random() * 1000)}`,
      score,
      level: playerLevel,
      date: today,
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(updatedLeaderboard);
    localStorage.setItem(
      "coin_hunt_leaderboard",
      JSON.stringify(updatedLeaderboard)
    );
  };

  const addXP = (amount: number) => {
    const newXP = playerXP + amount;
    const xpNeeded = XP_TO_LEVEL(playerLevel);

    if (newXP >= xpNeeded) {
      setPlayerLevel(playerLevel + 1);
      setPlayerXP(newXP - xpNeeded);
    } else {
      setPlayerXP(newXP);
    }
  };

  const spawnLoot = () => {
    const type = COIN_TYPES[Math.floor(Math.random() * COIN_TYPES.length)];
    const newLoot: Loot = {
      id: lootIdCounter.current++,
      x: Math.random() * (CANVAS_WIDTH - LOOT_SIZE),
      y: Math.random() * (CANVAS_HEIGHT - 200) + 50,
      color: type.color,
      type: type.name,
    };
    loots.current.push(newLoot);
  };

  const spawnPowerUp = () => {
    const types: ("speed" | "magnet" | "time")[] = ["speed", "magnet", "time"];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = { speed: "#FBBF24", magnet: "#A855F7", time: "#10B981" };
    const newPowerUp: PowerUp = {
      id: powerUpIdCounter.current++,
      x: Math.random() * (CANVAS_WIDTH - POWERUP_SIZE),
      y: Math.random() * (CANVAS_HEIGHT - 200) + 50,
      type,
      color: colors[type],
    };
    powerUps.current.push(newPowerUp);
  };

  const spawnObstacle = () => {
    const wallType = Math.random();
    let width, height;

    if (wallType < 0.3) {
      width = 10;
      height = 100 + Math.random() * 150;
    } else if (wallType < 0.6) {
      width = 100 + Math.random() * 150;
      height = 10;
    } else {
      width = 40 + Math.random() * 60;
      height = 40 + Math.random() * 60;
    }

    let x, y;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      x = Math.random() * (CANVAS_WIDTH - width);
      y = Math.random() * (CANVAS_HEIGHT - 200) + 50;

      const distanceFromPlayer = Math.sqrt(
        Math.pow(x + width / 2 - playerPos.current.x, 2) +
          Math.pow(y + height / 2 - playerPos.current.y, 2)
      );

      if (distanceFromPlayer > 100 || attempts >= maxAttempts) {
        break;
      }
      attempts++;
    } while (attempts < maxAttempts);

    const newObstacle: Obstacle = {
      id: obstacleIdCounter.current++,
      x,
      y,
      width,
      height,
    };
    obstacles.current.push(newObstacle);
  };

  const spawnAIBot = () => {
    const newBot: AIBot = {
      id: aiBotIdCounter.current++,
      x: Math.random() * (CANVAS_WIDTH - PLAYER_SIZE),
      y: 50 + Math.random() * 100,
      speed: 1.5 + Math.random() * 0.5,
    };
    aiBots.current.push(newBot);
  };

  const activateSpeedBoost = () => {
    setSpeedBoostActive(true);
    speedBoostActiveRef.current = true;
    setPlayerSpeed(BASE_PLAYER_SPEED * 2);

    if (speedBoostTimeout.current) clearTimeout(speedBoostTimeout.current);
    speedBoostTimeout.current = setTimeout(() => {
      setSpeedBoostActive(false);
      speedBoostActiveRef.current = false;
      setPlayerSpeed(BASE_PLAYER_SPEED);
    }, 5000);
  };

  const activateMagnet = () => {
    setMagnetActive(true);
    magnetActiveRef.current = true;

    if (magnetTimeout.current) clearTimeout(magnetTimeout.current);
    magnetTimeout.current = setTimeout(() => {
      setMagnetActive(false);
      magnetActiveRef.current = false;
    }, 8000);
  };

  const updateCombo = () => {
    const now = Date.now();
    if (now - lastCollectTime.current < 2000) {
      setCombo((prev) => {
        const newCombo = prev + 1;
        if (newCombo >= 10) setComboMultiplier(3);
        else if (newCombo >= 5) setComboMultiplier(2);
        else setComboMultiplier(1.5);
        return newCombo;
      });
    } else {
      setCombo(1);
      setComboMultiplier(1);
    }
    lastCollectTime.current = now;

    if (comboTimeout.current) clearTimeout(comboTimeout.current);
    comboTimeout.current = setTimeout(() => {
      setCombo(0);
      setComboMultiplier(1);
    }, 2000);
  };

  const checkCollision = (
    pos1: Position,
    size1: number,
    pos2: Position,
    size2: number
  ) => {
    return (
      pos1.x < pos2.x + size2 &&
      pos1.x + size1 > pos2.x &&
      pos1.y < pos2.y + size2 &&
      pos1.y + size1 > pos2.y
    );
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0F172A";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    const newPos = { ...playerPos.current };
    let dx = 0;
    let dy = 0;

    if (keys.current["ArrowLeft"] || keys.current["a"]) dx -= 1;
    if (keys.current["ArrowRight"] || keys.current["d"]) dx += 1;
    if (keys.current["ArrowUp"] || keys.current["w"]) dy -= 1;
    if (keys.current["ArrowDown"] || keys.current["s"]) dy += 1;

    if (joystickRef.current.x !== 0 || joystickRef.current.y !== 0) {
      dx = joystickRef.current.x;
      dy = joystickRef.current.y;
    }

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 1) {
        dx /= length;
        dy /= length;
      }

      newPos.x += dx * playerSpeed;
      newPos.y += dy * playerSpeed;
    }

    newPos.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_SIZE, newPos.x));
    newPos.y = Math.max(0, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, newPos.y));

    let collided = false;
    for (const obstacle of obstacles.current) {
      if (
        newPos.x < obstacle.x + obstacle.width &&
        newPos.x + PLAYER_SIZE > obstacle.x &&
        newPos.y < obstacle.y + obstacle.height &&
        newPos.y + PLAYER_SIZE > obstacle.y
      ) {
        collided = true;
        break;
      }
    }

    if (!collided) {
      playerPos.current = newPos;
    }

    const elapsedSeconds = Math.floor(
      (Date.now() - gameStartTime.current) / 1000
    );
    const currentInterval = Math.floor(elapsedSeconds / 30);
    const lastInterval = Math.floor(lastBotSpawnTime.current / 30);

    if (elapsedSeconds > 0 && currentInterval > lastInterval) {
      spawnAIBot();
      lastBotSpawnTime.current = elapsedSeconds;
    }

    let closestBotDistance = Infinity;

    for (const bot of aiBots.current) {
      const dx = playerPos.current.x - bot.x;
      const dy = playerPos.current.y - bot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestBotDistance) {
        closestBotDistance = distance;
      }

      if (distance > 0) {
        const moveX = (dx / distance) * bot.speed;
        const moveY = (dy / distance) * bot.speed;

        bot.x += moveX;
        bot.y += moveY;
      }

      const botCenterX = bot.x + PLAYER_SIZE / 2;
      const botCenterY = bot.y + PLAYER_SIZE / 2;
      const playerCenterX = playerPos.current.x + PLAYER_SIZE / 2;
      const playerCenterY = playerPos.current.y + PLAYER_SIZE / 2;
      const botPlayerDistance = Math.sqrt(
        Math.pow(botCenterX - playerCenterX, 2) +
          Math.pow(botCenterY - playerCenterY, 2)
      );

      if (botPlayerDistance < PLAYER_SIZE * 0.8) {
        endGame();
        return;
      }
    }

    if (
      elapsedSeconds > 0 &&
      elapsedSeconds % 10 === 0 &&
      elapsedSeconds !== lastBotSpawnTime.current
    ) {
      aiBots.current.forEach((bot) => {
        bot.speed = Math.min(4, bot.speed + 0.05);
      });
    }

    if (magnetActiveRef.current) {
      ctx.strokeStyle = "#A855F7";
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(
        playerPos.current.x + PLAYER_SIZE / 2,
        playerPos.current.y + PLAYER_SIZE / 2,
        100,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw player character image
    if (playerImageRef.current) {
      ctx.shadowBlur = speedBoostActiveRef.current ? 20 : 15;
      ctx.shadowColor = speedBoostActiveRef.current ? "#FBBF24" : "#64CCC5";
      ctx.drawImage(
        playerImageRef.current,
        playerPos.current.x,
        playerPos.current.y,
        PLAYER_SIZE,
        PLAYER_SIZE
      );
      ctx.shadowBlur = 0;
    } else {
      // Fallback to rectangle if image not loaded
      ctx.fillStyle = speedBoostActiveRef.current ? "#FBBF24" : "#64CCC5";
      ctx.shadowBlur = 15;
      ctx.shadowColor = speedBoostActiveRef.current ? "#FBBF24" : "#64CCC5";
      ctx.fillRect(
        playerPos.current.x,
        playerPos.current.y,
        PLAYER_SIZE,
        PLAYER_SIZE
      );
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(playerPos.current.x + 8, playerPos.current.y + 10, 5, 5);
      ctx.fillRect(playerPos.current.x + 17, playerPos.current.y + 10, 5, 5);
    }

    if (comboMultiplier > 1) {
      ctx.fillStyle = "#FBBF24";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        `x${comboMultiplier.toFixed(1)}`,
        playerPos.current.x + PLAYER_SIZE / 2,
        playerPos.current.y - 5
      );
    }

    const magnetRadius = magnetActiveRef.current ? 100 : 0;
    loots.current = loots.current.filter((loot) => {
      const distance = Math.sqrt(
        Math.pow(loot.x - (playerPos.current.x + PLAYER_SIZE / 2), 2) +
          Math.pow(loot.y - (playerPos.current.y + PLAYER_SIZE / 2), 2)
      );

      if (magnetActiveRef.current && distance < magnetRadius) {
        const angle = Math.atan2(
          playerPos.current.y + PLAYER_SIZE / 2 - loot.y,
          playerPos.current.x + PLAYER_SIZE / 2 - loot.x
        );
        loot.x += Math.cos(angle) * 3;
        loot.y += Math.sin(angle) * 3;
      }

      if (
        checkCollision(
          playerPos.current,
          PLAYER_SIZE,
          { x: loot.x, y: loot.y },
          LOOT_SIZE
        )
      ) {
        const points = Math.floor(1 * comboMultiplier);
        setScore((prev) => prev + points);
        setCollectedLoot((prev) => [...prev, loot]);
        addXP(XP_PER_POINT);
        updateCombo();
        return false;
      }

      ctx.fillStyle = loot.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = loot.color;
      ctx.fillRect(loot.x, loot.y, LOOT_SIZE, LOOT_SIZE);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(loot.x, loot.y, LOOT_SIZE, LOOT_SIZE);

      return true;
    });

    powerUps.current = powerUps.current.filter((powerUp) => {
      if (
        checkCollision(
          playerPos.current,
          PLAYER_SIZE,
          { x: powerUp.x, y: powerUp.y },
          POWERUP_SIZE
        )
      ) {
        if (powerUp.type === "speed") activateSpeedBoost();
        if (powerUp.type === "magnet") activateMagnet();
        if (powerUp.type === "time") {
          setTimer((prev) => prev + 10);
        }
        return false;
      }

      ctx.fillStyle = powerUp.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = powerUp.color;
      ctx.beginPath();
      ctx.arc(
        powerUp.x + POWERUP_SIZE / 2,
        powerUp.y + POWERUP_SIZE / 2,
        POWERUP_SIZE / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      const icons = { speed: "⚡", magnet: "🧲", time: "⏰" };
      ctx.fillText(
        icons[powerUp.type],
        powerUp.x + POWERUP_SIZE / 2,
        powerUp.y + POWERUP_SIZE / 2 + 5
      );

      return true;
    });

    obstacles.current.forEach((obstacle) => {
      ctx.fillStyle = "#475569";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      ctx.strokeStyle = "#1E293B";
      ctx.lineWidth = 2;
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    if (closestBotDistance < 100) {
      const playerCenterX = playerPos.current.x + PLAYER_SIZE / 2;
      const playerCenterY = playerPos.current.y + PLAYER_SIZE / 2;
      ctx.strokeStyle = "#EF4444";
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.3;
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // Draw bot character images
    aiBots.current.forEach((bot) => {
      if (botImageRef.current) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#EF4444";
        ctx.drawImage(
          botImageRef.current,
          bot.x,
          bot.y,
          PLAYER_SIZE,
          PLAYER_SIZE
        );
        ctx.shadowBlur = 0;
      } else {
        // Fallback to rectangle if image not loaded
        ctx.fillStyle = "#EF4444";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#EF4444";
        ctx.fillRect(bot.x, bot.y, PLAYER_SIZE, PLAYER_SIZE);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(bot.x + 8, bot.y + 10, 5, 5);
        ctx.fillRect(bot.x + 17, bot.y + 10, 5, 5);
      }
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    if (lootInterval.current) clearInterval(lootInterval.current);
    if (powerUpInterval.current) clearInterval(powerUpInterval.current);
    if (obstacleInterval.current) clearInterval(obstacleInterval.current);
    if (gameTimeout.current) clearTimeout(gameTimeout.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    if (animationFrameId.current)
      cancelAnimationFrame(animationFrameId.current);

    // Clear saved game state when starting a new game
    savedGameState.current = null;
    setCanResume(false);

    setGameState("playing");
    setScore(0);
    setTimer(0);
    setCombo(0);
    setComboMultiplier(1);
    setCollectedLoot([]);
    setSpeedBoostActive(false);
    setMagnetActive(false);
    setPlayerSpeed(BASE_PLAYER_SPEED);
    playerPos.current = {
      x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
      y: CANVAS_HEIGHT - 100,
    };
    loots.current = [];
    powerUps.current = [];
    obstacles.current = [];
    aiBots.current = [];
    lootIdCounter.current = 0;
    powerUpIdCounter.current = 0;
    obstacleIdCounter.current = 0;
    aiBotIdCounter.current = 0;
    lastBotSpawnTime.current = 0;
    gameStartTime.current = Date.now();

    joystickRef.current = { x: 0, y: 0 };
    keys.current = {};
    magnetActiveRef.current = false;
    speedBoostActiveRef.current = false;

    spawnAIBot();

    for (let i = 0; i < 5; i++) {
      spawnLoot();
    }

    for (let i = 0; i < 3; i++) {
      spawnObstacle();
    }

    timerInterval.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    lootInterval.current = setInterval(() => {
      if (loots.current.length < 10) {
        spawnLoot();
      }
    }, 2000);

    powerUpInterval.current = setInterval(() => {
      if (powerUps.current.length < 2) {
        spawnPowerUp();
      }
    }, 8000);

    obstacleInterval.current = setInterval(() => {
      if (obstacles.current.length < 5) {
        spawnObstacle();
      }
    }, 10000);

    animationFrameId.current = requestAnimationFrame(gameLoop);

    gameTimeout.current = setTimeout(() => {
      endGame();
    }, 60000);
  };

  const endGame = () => {
    setGameState("gameover");
    if (animationFrameId.current)
      cancelAnimationFrame(animationFrameId.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    if (lootInterval.current) clearInterval(lootInterval.current);
    if (powerUpInterval.current) clearInterval(powerUpInterval.current);
    if (obstacleInterval.current) clearInterval(obstacleInterval.current);
    if (gameTimeout.current) clearTimeout(gameTimeout.current);

    // Save game state for resume
    savedGameState.current = {
      collectedLoot: [...collectedLoot],
      score,
      timer,
      playerLevel,
      playerXP,
    };
    setCanResume(true);

    addToLeaderboard(score);
    savePlayerData();
  };

  const checkAndDeductCoins = async (amount: number): Promise<boolean> => {
    if (!authUser?.id) {
      alert("Please log in to resume");
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
      alert(`You need ${amount} coins to resume. You have ${currentCoins} coins.`);
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

    return true;
  };

  const resumeGame = async () => {
    if (!savedGameState.current) {
      alert("No saved game state found");
      return;
    }

    const canResume = await checkAndDeductCoins(COIN_COST_TO_RESUME);
    if (!canResume) {
      return;
    }

    // Clear any existing intervals
    if (lootInterval.current) clearInterval(lootInterval.current);
    if (powerUpInterval.current) clearInterval(powerUpInterval.current);
    if (obstacleInterval.current) clearInterval(obstacleInterval.current);
    if (gameTimeout.current) clearTimeout(gameTimeout.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    if (animationFrameId.current)
      cancelAnimationFrame(animationFrameId.current);

    // Restore saved game state
    const saved = savedGameState.current;
    setScore(saved.score);
    setTimer(0); // Start with fresh timer
    setCollectedLoot(saved.collectedLoot); // Keep collected items
    setPlayerLevel(saved.playerLevel);
    setPlayerXP(saved.playerXP);
    setCombo(0);
    setComboMultiplier(1);
    setSpeedBoostActive(false);
    setMagnetActive(false);
    setPlayerSpeed(BASE_PLAYER_SPEED);
    
    playerPos.current = {
      x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
      y: CANVAS_HEIGHT - 100,
    };
    loots.current = [];
    powerUps.current = [];
    obstacles.current = [];
    aiBots.current = [];
    lootIdCounter.current = 0;
    powerUpIdCounter.current = 0;
    obstacleIdCounter.current = 0;
    aiBotIdCounter.current = 0;
    lastBotSpawnTime.current = 0;
    gameStartTime.current = Date.now();

    joystickRef.current = { x: 0, y: 0 };
    keys.current = {};
    magnetActiveRef.current = false;
    speedBoostActiveRef.current = false;

    // Start game with restored state
    setGameState("playing");

    spawnAIBot();

    for (let i = 0; i < 5; i++) {
      spawnLoot();
    }

    for (let i = 0; i < 3; i++) {
      spawnObstacle();
    }

    timerInterval.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    lootInterval.current = setInterval(() => {
      if (loots.current.length < 10) {
        spawnLoot();
      }
    }, 2000);

    powerUpInterval.current = setInterval(() => {
      if (powerUps.current.length < 2) {
        spawnPowerUp();
      }
    }, 8000);

    obstacleInterval.current = setInterval(() => {
      if (obstacles.current.length < 5) {
        spawnObstacle();
      }
    }, 10000);

    // Start fresh 60-second timer
    gameTimeout.current = setTimeout(() => {
      endGame();
    }, 60000);

    animationFrameId.current = requestAnimationFrame(gameLoop);
    setCanResume(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    savePlayerData();
  }, [playerLevel, playerXP]);

  const xpProgress = (playerXP / XP_TO_LEVEL(playerLevel)) * 100;

  return {
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
    playerSpeed,
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
  };
};
