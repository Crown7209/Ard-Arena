import { Arena, type ArenaOptions } from "./arena";
import { type ArenaType as ArenaTypeValue } from "./arenaTypes";
import { Orientation } from "./orientations";
import { MoveType } from "./moveTypes";
import { Fighter } from "../fighters/fighter";

export interface GameCallbacks {
  attack?: (fighter: Fighter, opponent: Fighter, damage: number) => void;
  "game-end"?: (fighter: Fighter) => void;
  "player-connected"?: () => void;
}

export interface GameOptions {
  arena: {
    container: HTMLElement;
    arena: number;
    width?: number;
    height?: number;
  };
  fighters: Array<{ name: string }>;
  callbacks?: GameCallbacks;
}

export abstract class BaseController {
  public fighters: Fighter[] = [];
  protected opponents: Map<string, Fighter> = new Map();
  public arena: Arena;
  protected callbacks: GameCallbacks;
  protected options: GameOptions;

  constructor(options: GameOptions) {
    this.options = options;
    this.callbacks = options.callbacks || {};
    this.initializeFighters(options.fighters);
    const arenaOptions: ArenaOptions = {
      fighters: this.fighters,
      arena: options.arena.arena as ArenaTypeValue,
      width: options.arena.width,
      height: options.arena.height,
      container: options.arena.container,
      game: this,
    };
    this.arena = new Arena(arenaOptions);
  }

  protected initializeFighters(fighters: Array<{ name: string }>): void {
    this.fighters = [];
    this.opponents = new Map();

    for (let i = 0; i < fighters.length; i += 1) {
      const current = fighters[i];
      const orientation = i === 0 ? Orientation.LEFT : Orientation.RIGHT;
      this.fighters.push(
        new Fighter({
          name: current.name,
          arena: undefined,
          orientation,
          game: this,
        })
      );
    }
    if (this.fighters.length >= 2) {
      this.opponents.set(this.fighters[0].getName(), this.fighters[1]);
      this.opponents.set(this.fighters[1].getName(), this.fighters[0]);
    }
  }

  getOpponent(f: Fighter): Fighter {
    const opponent = this.opponents.get(f.getName());
    if (!opponent) {
      throw new Error("Opponent not found");
    }
    return opponent;
  }

  init(promise: GamePromise): void {
    let current = 0;
    const total = this.fighters.length;
    const self = this;

    for (let i = 0; i < this.fighters.length; i += 1) {
      const f = this.fighters[i];
      f.init(() => {
        f.setMove(MoveType.STAND);
        current += 1;
        if (current === total) {
          if (!self.arena) return;
          self.arena.init();
          self.setFightersArena();
          self.initialize();
          promise.initialized();
        }
      });
    }
  }

  protected abstract initialize(): void;

  protected setFightersArena(): void {
    for (let i = 0; i < this.fighters.length; i += 1) {
      const f = this.fighters[i];
      f.setArena(this.arena);
    }
    this.fighters[1].setX(940);
  }

  fighterAttacked(fighter: Fighter, damage: number): void {
    const opponent = this.getOpponent(fighter);
    const opponentLife = opponent.getLife();

    if (
      this.requiredDistance(fighter, opponent) &&
      this.attackCompatible(fighter.getMove().type, opponent.getMove().type)
    ) {
      opponent.endureAttack(damage, fighter.getMove().type);
      const callback = this.callbacks.attack;
      if (typeof callback === "function") {
        callback.call(
          null,
          fighter,
          opponent,
          opponentLife - opponent.getLife()
        );
      }
    }
  }

  protected attackCompatible(
    attack: MoveType,
    opponentStand: MoveType
  ): boolean {
    if (opponentStand === MoveType.SQUAT) {
      // Allow low attacks and crouched high kick to hit crouched opponents
      if (
        attack !== MoveType.LOW_PUNCH &&
        attack !== MoveType.LOW_KICK &&
        attack !== MoveType.SQUAT_LOW_KICK &&
        attack !== MoveType.SQUAT_LOW_PUNCH &&
        attack !== MoveType.SQUAT_HIGH_KICK
      ) {
        return false;
      }
    }
    // Allow crouched high kick to hit standing opponents (head level)
    if (attack === MoveType.SQUAT_HIGH_KICK && opponentStand !== MoveType.SQUAT) {
      return true;
    }
    return true;
  }

  protected requiredDistance(attacker: Fighter, opponent: Fighter): boolean {
    // Get actual sprite dimensions for accurate collision detection
    const attackerState = attacker.getState();
    const opponentState = opponent.getState();
    
    // Use sprite dimensions if available, otherwise use fallback dimensions
    const attackerWidth = attackerState?.width || attacker.getWidth();
    const attackerHeight = attackerState?.height || attacker.getVisibleHeight();
    const opponentWidth = opponentState?.width || opponent.getWidth();
    const opponentHeight = opponentState?.height || opponent.getVisibleHeight();
    
    // Calculate horizontal positions
    const attackerLeft = attacker.getX();
    const attackerRight = attacker.getX() + attackerWidth;
    const attackerCenterX = attacker.getX() + attackerWidth / 2;
    const opponentLeft = opponent.getX();
    const opponentRight = opponent.getX() + opponentWidth;
    const opponentCenterX = opponent.getX() + opponentWidth / 2;
    
    // Calculate horizontal distance between character centers
    const horizontalDistance = Math.abs(attackerCenterX - opponentCenterX);
    
    // Vertical collision detection - check if heights overlap (top/bottom sections sensing)
    const attackerTop = attacker.getY();
    const attackerBottom = attacker.getY() + attackerHeight;
    const opponentTop = opponent.getY();
    const opponentBottom = opponent.getY() + opponentHeight;
    
    // Check vertical overlap (heights matching - top/bottom sections must overlap)
    const verticalOverlap = !(attackerBottom < opponentTop || attackerTop > opponentBottom);
    
    // Default attack range: 200px horizontal distance with vertical overlap
    const ATTACK_RANGE = 200;
    
    // If within 200px horizontally and vertical overlap exists, allow hit
    if (horizontalDistance <= ATTACK_RANGE && verticalOverlap) {
      return true;
    }
    
    // For jump attacks, allow slightly larger vertical range but same horizontal
    const type = attacker.getMove().type;
    if (
      type === MoveType.BACKWARD_JUMP_KICK ||
      type === MoveType.FORWARD_JUMP_KICK ||
      type === MoveType.FORWARD_JUMP_PUNCH ||
      type === MoveType.BACKWARD_JUMP_PUNCH
    ) {
      // Allow hit if within 200px horizontally and within 30 pixels vertically
      const verticalDistance = Math.min(
        Math.abs(attackerBottom - opponentTop),
        Math.abs(attackerTop - opponentBottom)
      );
      return horizontalDistance <= ATTACK_RANGE && verticalDistance <= 30;
    }
    
    // For uppercut, use same 200px horizontal range
    if (type === MoveType.UPPERCUT) {
      return horizontalDistance <= ATTACK_RANGE && verticalOverlap;
    }
    
    return false;
  }

  fighterDead(fighter: Fighter): void {
    const opponent = this.getOpponent(fighter);
    const callback = this.callbacks["game-end"];
    opponent.getMove().stop();
    opponent.setMove(MoveType.WIN);
    if (typeof callback === "function") {
      callback.call(null, fighter);
    }
  }

  reset(): void {
    this.fighters.forEach((f) => {
      try {
        f.getMove().stop();
      } catch (e) {
        // Ignore if no move set
      }
    });
    this.fighters = [];
    this.opponents = new Map();
    this.arena.destroy();
    this.arena = undefined as any;
    this.callbacks = {};
  }
}

export class GamePromise {
  private callbacks: Array<() => void> = [];
  private isInitialized = false;

  initialized(): void {
    this.isInitialized = true;
    this.callbacks.forEach((c) => {
      if (typeof c === "function") {
        c();
      }
    });
  }

  ready(callback: () => void): void {
    if (this.isInitialized) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }
}
