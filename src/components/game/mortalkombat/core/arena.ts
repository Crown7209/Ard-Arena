import { ArenaType, type ArenaType as ArenaTypeValue } from "./arenaTypes";
import { Orientation } from "./orientations";
import { MoveType } from "./moveTypes";
import { CONFIG } from "./config";
import type { Fighter } from "../fighters/fighter";
import type { BaseController } from "./controller";

export interface ArenaOptions {
  fighters: Fighter[];
  arena: ArenaTypeValue;
  width?: number;
  height?: number;
  container: HTMLElement;
  game: BaseController;
}

export class Arena {
  public width: number;
  public height: number;
  private originalWidth: number;
  private originalHeight: number;
  public arena: ArenaTypeValue;
  public fighters: Fighter[];
  private container: HTMLElement;
  private game: BaseController;
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;
  private texture?: HTMLImageElement;
  private timeRemaining: number = 60;
  private timerInterval?: number;
  private countdownState: "ready" | "counting" | "finished" = "ready";
  private countdownValue: number = 5;
  private countdownInterval?: number;
  private readyStartTime?: number;
  private currentRound: number = 1;
  private player1Wins: number = 0;
  private player2Wins: number = 0;

  constructor(options: ArenaOptions) {
    this.originalWidth = options.width || CONFIG.ARENA_WIDTH;
    this.originalHeight = options.height || CONFIG.ARENA_HEIGHT;
    this.width = this.originalWidth;
    this.height = this.originalHeight;
    this.arena = options.arena || ArenaType.TOWER;
    this.fighters = options.fighters;
    this.container = options.container;
    this.game = options.game;
  }

  public getContainer(): HTMLElement {
    return this.container;
  }

  private getMobileScale(): number {
    const width = window.innerWidth;
    const minWidth = 375;
    const maxMobileWidth = 1024;

    // If width is above mobile breakpoint or below minimum, use full scale
    if (width > maxMobileWidth || width < minWidth) {
      return 1.0;
    }

    // Clamp width to valid range
    const clampedWidth = Math.max(Math.min(width, maxMobileWidth), minWidth);

    // Calculate scale: 0.35 at 375px, 0.6 at 1024px, linear interpolation
    const minScale = 0.35; // Smallest scale at 375px
    const maxScale = 0.6; // Scale at 1024px

    if (clampedWidth <= minWidth) {
      return minScale;
    }

    // Linear interpolation between minWidth and maxMobileWidth
    const ratio = (clampedWidth - minWidth) / (maxMobileWidth - minWidth);
    return minScale + ratio * (maxScale - minScale);
  }

  init(): void {
    const canvas = document.createElement("canvas");
    this.updateCanvasSize(canvas);
    canvas.style.display = "block";
    this.container.appendChild(canvas);
    const context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: false,
    });
    if (!context) {
      throw new Error("Could not get 2d context");
    }

    // Enable image smoothing for better quality
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    this.context = context;
    this.canvas = canvas;
    this.startCountdown();
    this.refresh();
    this.setupResizeListener();
  }

  private updateCanvasSize(canvas: HTMLCanvasElement): void {
    const width = window.innerWidth;
    const minWidth = 375;
    const maxMobileWidth = 1024;

    // On mobile (375px - 1024px), make canvas match full viewport
    if (width >= minWidth && width <= maxMobileWidth) {
      // Canvas should fill the full viewport - controller overlays on top
      const viewportHeight = window.innerHeight;
      const aspectRatio = this.originalWidth / this.originalHeight;

      // Calculate dimensions that fill viewport while maintaining aspect ratio
      // Use full viewport height - controller is positioned fixed on top
      let scaledWidth = width;
      let scaledHeight = width / aspectRatio;

      // If calculated height exceeds viewport, scale to fit height instead
      if (scaledHeight > viewportHeight) {
        scaledHeight = viewportHeight;
        scaledWidth = viewportHeight * aspectRatio;
      }

      // Use full viewport size for canvas (no mobileScale reduction)
      // mobileScale only affects UI elements and fighters, not canvas/background
      canvas.width = Math.floor(scaledWidth);
      canvas.height = Math.floor(scaledHeight);
      canvas.style.width = "100vw";
      canvas.style.height = "100vh"; // Fill full viewport height
      canvas.style.maxWidth = "100vw";
      canvas.style.maxHeight = "100vh";
      canvas.style.minWidth = "0";
      canvas.style.minHeight = "0";

      // Update internal width/height for drawing calculations
      this.width = canvas.width;
      this.height = canvas.height;
    } else {
      // Desktop: use original dimensions
      this.width = this.originalWidth;
      this.height = this.originalHeight;
      canvas.width = this.width;
      canvas.height = this.height;
      canvas.style.width = `${this.width}px`;
      canvas.style.height = `${this.height}px`;
      canvas.style.maxWidth = "none";
      canvas.style.maxHeight = "none";
      canvas.style.minWidth = `${this.width}px`;
      canvas.style.minHeight = `${this.height}px`;
    }
  }

  private setupResizeListener(): void {
    let resizeTimeout: number | undefined;
    window.addEventListener("resize", () => {
      // Debounce resize events
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = window.setTimeout(() => {
        if (this.canvas) {
          this.updateCanvasSize(this.canvas);
          // Clear texture to force reload with new dimensions
          this.texture = undefined;
        }
        this.refresh();
      }, 100);
    });
  }

  setRound(round: number): void {
    this.currentRound = round;
  }

  setWins(player1Wins: number, player2Wins: number): void {
    this.player1Wins = player1Wins;
    this.player2Wins = player2Wins;
  }

  startCountdown(): void {
    // Lock all fighters during countdown
    this.fighters.forEach((fighter) => {
      fighter.lock();
    });

    // Reset countdown state
    this.countdownState = "ready";
    this.countdownValue = 5;
    this.readyStartTime = Date.now();

    // Show "READY" or "ROUND X" for 5 seconds
    const readyInterval = window.setInterval(() => {
      const elapsed = Date.now() - (this.readyStartTime || 0);
      if (elapsed >= 5000) {
        clearInterval(readyInterval);
        this.countdownState = "counting";
        this.countdownValue = 5;
        this.startCountdownNumbers();
      }
      this.refresh();
    }, 100);
  }

  private startCountdownNumbers(): void {
    this.countdownValue = 5;
    this.refresh(); // Show 5 immediately
    
    this.countdownInterval = window.setInterval(() => {
      this.countdownValue -= 1;
      this.refresh();

      if (this.countdownValue <= 0) {
        this.countdownState = "finished";
        if (this.countdownInterval !== undefined) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = undefined;
        }
        // Unlock fighters and start the game timer
        this.fighters.forEach((fighter) => {
          fighter.unlock();
        });
        this.startTimer();
        this.refresh();
      }
    }, 1000);
  }

  startTimer(): void {
    this.timeRemaining = 60;
    this.timerInterval = window.setInterval(() => {
      this.timeRemaining -= 1;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.stopTimer();
        this.handleTimeUp();
      }
      this.refresh();
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval !== undefined) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  stopCountdown(): void {
    if (this.countdownInterval !== undefined) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
  }

  getTimeRemaining(): number {
    return this.timeRemaining;
  }

  private handleTimeUp(): void {
    if (this.fighters.length < 2) return;

    const fighter1 = this.fighters[0];
    const fighter2 = this.fighters[1];
    const health1 = fighter1.getLife();
    const health2 = fighter2.getLife();

    // Fighter with more health (less damage) wins
    let winner: Fighter;
    let loser: Fighter;

    if (health1 > health2) {
      winner = fighter1;
      loser = fighter2;
    } else if (health2 > health1) {
      winner = fighter2;
      loser = fighter1;
    } else {
      // Tie - both fighters stop
      fighter1.getMove().stop();
      fighter2.getMove().stop();
      return;
    }

    // Stop both fighters
    fighter1.getMove().stop();
    fighter2.getMove().stop();

    // Stop timer when time is up
    this.stopTimer();

    // Winner does win animation, loser does fall
    winner.setMove(MoveType.WIN);
    loser.setMove(MoveType.FALL);

    // Trigger game end callback
    const callback = (this.game as any).callbacks?.["game-end"];
    if (typeof callback === "function") {
      callback.call(null, loser);
    }
  }

  destroy(): void {
    this.stopTimer();
    this.stopCountdown();
    if (this.canvas && this.container.contains(this.canvas)) {
      this.container.removeChild(this.canvas);
    }
    this.canvas = undefined;
    this.context = undefined;
    this.container = undefined as any;
    this.game = undefined as any;
    this.fighters = undefined as any;
    this.arena = undefined as any;
  }

  private drawArena(): void {
    if (!this.context || !this.canvas) return;

    // Get actual canvas dimensions
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    // Clear canvas first to ensure clean background
    this.context.clearRect(0, 0, canvasWidth, canvasHeight);

    if (this.texture) {
      // Draw the texture to fill the entire canvas exactly, stretching to fit
      // This ensures the background fills the full device viewport
      this.context.drawImage(
        this.texture,
        0,
        0,
        this.texture.width,
        this.texture.height,
        0,
        0,
        canvasWidth,
        canvasHeight
      );
    } else {
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.src = `${CONFIG.IMAGES}${CONFIG.ARENAS}${this.arena}/arena.png`;
      img.onload = () => {
        this.texture = img;
        if (this.context && this.canvas) {
          const canvasWidth = this.canvas.width;
          const canvasHeight = this.canvas.height;

          // Clear and redraw to ensure proper placement
          this.context.clearRect(0, 0, canvasWidth, canvasHeight);

          // Draw the image scaled to fill the entire canvas exactly
          // This ensures the background fills the full device viewport
          this.context.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            0,
            0,
            canvasWidth,
            canvasHeight
          );
          // Refresh to draw UI elements on top
          this.refresh();
        }
      };
      img.onerror = () => {
        // Fallback: draw a solid color background if image fails to load
        if (this.context && this.canvas) {
          this.context.fillStyle = "#2a2a2a";
          this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
      };
    }
  }

  refresh(): void {
    if (!this.context) return;

    // Ensure image smoothing is enabled for better quality
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = "high";

    this.drawArena();
    // Draw static health bar UI at the top
    this.drawStaticHealthBars();
    
    // Draw round indicator on canvas (only when countdown finished and game is playing)
    if (this.countdownState === "finished") {
      this.drawRoundIndicator();
    }
    
    // Draw countdown if active
    if (this.countdownState !== "finished") {
      this.drawCountdown();
    }
    
    // Draw fighters (scaled up)
    const width = window.innerWidth;
    const minWidth = 375;
    const maxMobileWidth = 1024;
    const isMobile = width >= minWidth && width <= maxMobileWidth;
    const scaleRatio = isMobile ? this.width / this.originalWidth : 1.0;

    // Use larger scale factor on mobile, original on desktop
    const baseScaleFactor = isMobile ? 6.0 : 3.0; // 6x on mobile, 3x on desktop (original)
    const mobileScale = isMobile ? this.getMobileScale() : 1.0;
    const scaleFactor = baseScaleFactor * mobileScale * scaleRatio;
    for (let i = 0; i < this.fighters.length; i += 1) {
      const f = this.fighters[i];
      const state = f.getState();
      if (state) {
        const scaledWidth = state.width * scaleFactor;
        const scaledHeight = state.height * scaleFactor;
        // Adjust Y position to keep bottom aligned (move up by the height difference)
        const yOffset = state.height * (scaleFactor - 1);
        // Additional offset to move characters higher on screen (mobile only)
        const heightAdjustment = isMobile ? 300 * scaleRatio : 0; // Only apply on mobile
        // Scale fighter positions
        const fighterX = f.getX() * scaleRatio;
        const fighterY = (f.getY() - yOffset - heightAdjustment) * scaleRatio;
        this.context.drawImage(
          state,
          fighterX,
          fighterY,
          scaledWidth,
          scaledHeight
        );
      }
    }
  }

  private drawStaticHealthBars(): void {
    if (!this.context || this.fighters.length < 2) return;

    const width = window.innerWidth;
    const minWidth = 375;
    const maxMobileWidth = 1024;
    const isMobile = width >= minWidth && width <= maxMobileWidth;

    const mobileScale = isMobile ? this.getMobileScale() : 1.0;
    const scaleRatio = isMobile ? this.width / this.originalWidth : 1.0;

    const padding = 20 * scaleRatio;
    const barHeight = 24 * scaleRatio;
    const barWidth = 400 * scaleRatio;

    // Background removed - no dark overlay

    const fighter1 = this.fighters[0];
    const fighter2 = this.fighters[1];

    // Align health bars and timer vertically
    const barY = 56 * scaleRatio; // Vertical position for health bars and timer

    // Left player (fighter1) - Player 1
    const leftX = padding;
    this.drawPlayerHealthBar(
      fighter1,
      leftX,
      barY,
      barWidth,
      barHeight,
      true,
      1,
      mobileScale,
      scaleRatio
    );

    // Right player (fighter2) - Player 2
    const rightX = this.width - padding - barWidth;
    this.drawPlayerHealthBar(
      fighter2,
      rightX,
      barY,
      barWidth,
      barHeight,
      false,
      2,
      mobileScale,
      scaleRatio
    );

    // Draw timer in the center, aligned with health bars (only after countdown)
    if (this.countdownState === "finished") {
      this.drawTimer(barY, mobileScale, scaleRatio);
    }
  }

  private drawRoundIndicator(): void {
    if (!this.context || !this.canvas) return;

    const width = window.innerWidth;
    const minWidth = 375;
    const maxMobileWidth = 1024;
    const isMobile = width >= minWidth && width <= maxMobileWidth;
    const scaleRatio = isMobile ? this.width / this.originalWidth : 1.0;

    const centerX = this.canvas.width / 2;
    const indicatorY = 120 * scaleRatio; // Position below timer

    // Draw round text
    const roundFontSize = Math.max(14 * scaleRatio, 10);
    this.context.fillStyle = "rgba(255, 255, 255, 0.9)";
    this.context.font = `bold ${roundFontSize}px Arial, sans-serif`;
    this.context.textAlign = "center";
    this.context.textBaseline = "top";
    
    // Add text shadow for readability
    this.context.shadowBlur = 3 * scaleRatio;
    this.context.shadowColor = "rgba(0, 0, 0, 0.8)";
    this.context.shadowOffsetX = 1 * scaleRatio;
    this.context.shadowOffsetY = 1 * scaleRatio;

    this.context.fillText(`Round ${this.currentRound} of 3`, centerX, indicatorY);

    // Draw score text below
    const scoreFontSize = Math.max(11 * scaleRatio, 8);
    this.context.fillStyle = "rgba(255, 255, 255, 0.7)";
    this.context.font = `${scoreFontSize}px Arial, sans-serif`;
    this.context.fillText(
      `Player 1: ${this.player1Wins} | Player 2: ${this.player2Wins}`,
      centerX,
      indicatorY + (18 * scaleRatio)
    );

    // Reset shadow
    this.context.shadowBlur = 0;
    this.context.shadowOffsetX = 0;
    this.context.shadowOffsetY = 0;
  }

  private drawTimer(
    barY: number,
    _mobileScale: number,
    scaleRatio: number
  ): void {
    if (!this.context) return;

    const centerX = Math.round(this.width / 2);
    const timerY = barY; // Align with health bars
    const time = Math.max(0, this.timeRemaining);

    const radius = 36 * scaleRatio;
    const lineWidth = 8 * scaleRatio; // Thicker border for better visibility
    const fontSize = Math.max(32 * scaleRatio, 16); // Ensure minimum readable size

    // Draw timer background circle with better contrast
    this.context.fillStyle = "rgba(0, 0, 0, 0.8)"; // Darker, more opaque background
    this.context.beginPath();
    this.context.arc(centerX, timerY, radius, 0, Math.PI * 2);
    this.context.fill();

    // Draw outer glow for better visibility
    this.context.shadowBlur = 10 * scaleRatio;
    this.context.shadowColor = this.timeRemaining <= 10 ? "#FF0000" : "#FFFFFF";
    this.context.shadowOffsetX = 0;
    this.context.shadowOffsetY = 0;

    // Draw timer border
    this.context.strokeStyle = this.timeRemaining <= 10 ? "#FF0000" : "#FFFFFF";
    this.context.lineWidth = lineWidth;
    this.context.stroke();

    // Reset shadow
    this.context.shadowBlur = 0;

    // Draw timer text with better contrast and quality
    this.context.fillStyle = this.timeRemaining <= 10 ? "#FF0000" : "#FFFFFF";
    this.context.font = `bold ${fontSize}px Arial, sans-serif`;
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    // Add text shadow for better readability
    this.context.shadowBlur = 4 * scaleRatio;
    this.context.shadowColor = "rgba(0, 0, 0, 0.8)";
    this.context.shadowOffsetX = 2 * scaleRatio;
    this.context.shadowOffsetY = 2 * scaleRatio;

    this.context.fillText(time.toString(), centerX, timerY);

    // Reset shadow
    this.context.shadowBlur = 0;
    this.context.shadowOffsetX = 0;
    this.context.shadowOffsetY = 0;
  }

  private drawCountdown(): void {
    if (!this.context || !this.canvas) return;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const width = window.innerWidth;
    const minWidth = 375;
    const maxMobileWidth = 1024;
    const isMobile = width >= minWidth && width <= maxMobileWidth;
    const scaleRatio = isMobile ? this.width / this.originalWidth : 1.0;

    // Determine text to display
    let displayText = "";
    if (this.countdownState === "ready") {
      if (this.currentRound === 1) {
        displayText = "READY";
      } else if (this.currentRound === 2) {
        displayText = "ROUND 2";
      } else if (this.currentRound === 3) {
        displayText = "ROUND 3";
      } else {
        displayText = `ROUND ${this.currentRound}`;
      }
    } else if (this.countdownState === "counting") {
      displayText = this.countdownValue.toString();
    }

    // Calculate font size based on screen size
    const baseFontSize = isMobile ? 120 : 80;
    const fontSize = baseFontSize * scaleRatio;

    // Draw semi-transparent background overlay
    this.context.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw text with glow effect
    this.context.shadowBlur = 30 * scaleRatio;
    this.context.shadowColor = "#FFFFFF";
    this.context.shadowOffsetX = 0;
    this.context.shadowOffsetY = 0;

    this.context.fillStyle = "#FFFFFF";
    this.context.font = `bold ${fontSize}px Arial, sans-serif`;
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    // Add pulsing effect for "READY"
    if (this.countdownState === "ready") {
      const pulse = Math.sin(Date.now() / 200) * 0.1 + 1;
      this.context.save();
      this.context.translate(centerX, centerY);
      this.context.scale(pulse, pulse);
      this.context.translate(-centerX, -centerY);
      this.context.fillText(displayText, centerX, centerY);
      this.context.restore();
    } else {
      // Scale effect for countdown numbers (pulse when number changes)
      const timeSinceStart = Date.now() % 1000;
      const scale = 1.0 + Math.sin((timeSinceStart / 1000) * Math.PI) * 0.2;
      this.context.save();
      this.context.translate(centerX, centerY);
      this.context.scale(scale, scale);
      this.context.translate(-centerX, -centerY);
      this.context.fillText(displayText, centerX, centerY);
      this.context.restore();
    }

    // Reset shadow
    this.context.shadowBlur = 0;
    this.context.shadowOffsetX = 0;
    this.context.shadowOffsetY = 0;
  }

  private drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    if (!this.context) return;
    this.context.beginPath();
    this.context.moveTo(x + radius, y);
    this.context.lineTo(x + width - radius, y);
    this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.context.lineTo(x + width, y + height - radius);
    this.context.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    this.context.lineTo(x + radius, y + height);
    this.context.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.context.lineTo(x, y + radius);
    this.context.quadraticCurveTo(x, y, x + radius, y);
    this.context.closePath();
  }

  private drawPlayerHealthBar(
    fighter: Fighter,
    x: number,
    y: number,
    barWidth: number,
    barHeight: number,
    isLeft: boolean,
    playerNumber: number,
    _mobileScale: number,
    scaleRatio: number
  ): void {
    if (!this.context) return;

    const maxLife = 100;
    const currentLife = fighter.getLife();
    const lifePercentage = currentLife / maxLife;
    const fighterName = `Player ${playerNumber}`;

    // Health bar position
    const barX = Math.round(x);
    const barY = Math.round(y);

    // Draw fighter name above health bar with better visibility
    const nameFontSize = Math.max(22 * scaleRatio, 14); // Ensure minimum readable size
    const nameX = isLeft ? barX : barX + barWidth;
    const nameY = barY - 32 * scaleRatio; // Position name above the bar

    // Draw player name text with better contrast (no background)
    this.context.fillStyle = "#FFFFFF"; // White for better visibility
    this.context.font = `bold ${nameFontSize}px Arial, sans-serif`;
    this.context.textAlign = isLeft ? "left" : "right";
    this.context.textBaseline = "top";

    // Add text shadow for better readability
    this.context.shadowBlur = 3 * scaleRatio;
    this.context.shadowColor = "rgba(0, 0, 0, 0.8)";
    this.context.shadowOffsetX = 1 * scaleRatio;
    this.context.shadowOffsetY = 1 * scaleRatio;

    this.context.fillText(fighterName, nameX, nameY);

    // Reset shadow
    this.context.shadowBlur = 0;
    this.context.shadowOffsetX = 0;
    this.context.shadowOffsetY = 0;

    const borderRadius = 12 * scaleRatio;

    // Draw health bar background with better contrast
    // Outer border for visibility
    this.context.strokeStyle = "#000000";
    this.context.lineWidth = 2 * scaleRatio;
    this.drawRoundedRect(barX, barY, barWidth, barHeight, borderRadius);
    this.context.stroke();

    // Draw empty health bar (dark red, rounded) with better visibility
    this.context.fillStyle = "#4A0000"; // Darker red for better contrast
    this.drawRoundedRect(barX, barY, barWidth, barHeight, borderRadius);
    this.context.fill();

    // Draw current health (rounded)
    const healthWidth = barWidth * lifePercentage;
    if (healthWidth > 0) {
      // Color gradient: green (100%) -> yellow (50%) -> red (0%)
      if (lifePercentage > 0.5) {
        // Green to yellow
        const greenIntensity = Math.floor(255 * ((lifePercentage - 0.5) * 2));
        this.context.fillStyle = `rgb(${255 - greenIntensity}, 255, 0)`;
      } else {
        // Yellow to red
        const redIntensity = Math.floor(255 * (1 - lifePercentage * 2));
        this.context.fillStyle = `rgb(255, ${redIntensity}, 0)`;
      }
      // For partial health, clip to rounded rectangle
      this.context.save();
      this.drawRoundedRect(barX, barY, healthWidth, barHeight, borderRadius);
      this.context.clip();
      this.context.fillRect(barX, barY, healthWidth, barHeight);
      this.context.restore();
    }
  }

  moveFighter(
    fighter: Fighter,
    pos: { x: number; y: number }
  ): { x: number; y: number } {
    const opponent = this.game.getOpponent(fighter);
    const op = { x: opponent.getX(), y: opponent.getY() };
    const isOver = pos.y + fighter.getVisibleHeight() <= op.y;

    // Use original width for boundaries since fighters use original coordinate system
    const boundaryWidth = this.originalWidth;

    if (pos.x <= 0) {
      pos.x = 0;
    }
    if (pos.x >= boundaryWidth - fighter.getVisibleWidth()) {
      pos.x = boundaryWidth - fighter.getVisibleWidth();
    }

    if (!isOver) {
      if (fighter.getOrientation() === Orientation.LEFT) {
        if (pos.x + fighter.getVisibleWidth() > op.x) {
          pos = this.synchronizeFighters(pos, fighter, opponent);
        }
      } else {
        if (pos.x < op.x + opponent.getVisibleWidth()) {
          pos = this.synchronizeFighters(pos, fighter, opponent);
        }
      }
    }

    this.setFightersOrientation(fighter, opponent);
    return pos;
  }

  private synchronizeFighters(
    pos: { x: number; y: number },
    fighter: Fighter,
    opponent: Fighter
  ): { x: number; y: number } {
    const moveType = fighter.getMove().type;
    if (
      moveType === MoveType.FORWARD_JUMP ||
      moveType === MoveType.BACKWARD_JUMP
    ) {
      pos.x = fighter.getX();
      return pos;
    }
    // Use original width for boundaries since fighters use original coordinate system
    const boundaryWidth = this.originalWidth;
    let diff: number;
    if (fighter.getOrientation() === Orientation.LEFT) {
      diff = Math.min(
        boundaryWidth -
          (opponent.getX() +
            opponent.getVisibleWidth() +
            fighter.getVisibleWidth()),
        pos.x - fighter.getX()
      );
      pos.x = fighter.getX() + diff;
      if (diff > 0) {
        opponent.setX(opponent.getX() + diff);
      }
    } else {
      diff = Math.min(opponent.getX(), fighter.getX() - pos.x);
      if (diff > 0) {
        pos.x = fighter.getX() - diff;
        opponent.setX(opponent.getX() - diff);
        if (opponent.getX() + opponent.getWidth() > pos.x) {
          pos.x = opponent.getX() + opponent.getVisibleWidth();
        }
      } else {
        pos.x = fighter.getX();
        if (opponent.getX() + opponent.getWidth() > pos.x) {
          pos.x = opponent.getX() + opponent.getVisibleWidth();
        }
      }
    }
    return pos;
  }

  private setFightersOrientation(f1: Fighter, f2: Fighter): void {
    if (f1.getX() < f2.getX()) {
      f1.setOrientation(Orientation.LEFT);
      f2.setOrientation(Orientation.RIGHT);
    } else {
      f1.setOrientation(Orientation.RIGHT);
      f2.setOrientation(Orientation.LEFT);
    }
  }
}
