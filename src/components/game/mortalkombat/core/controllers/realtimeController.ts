import { BaseController, type GameOptions } from "../controller";
import { MoveType } from "../moveTypes";
import { KEYS } from "./basicController";
import type { Fighter } from "../../fighters/fighter";
import { MobileController } from "./mobileController";
import {
  GameRealtimeService,
  type GameMove,
  type GamePosition,
  type GameLife,
} from "@/services/gameService";

export interface RealtimeGameOptions extends GameOptions {
  roomId: string;
  playerId: string;
  playerIndex: number; // 0 for player1, 1 for player2
  arena: {
    container: HTMLElement;
    arena: number;
  };
}

export class RealtimeController extends BaseController {
  private roomId: string;
  private playerId: string;
  private playerIndex: number;
  private realtimeService: GameRealtimeService;
  private pressed: Record<number, boolean> = {};
  private mobileController: MobileController | null = null;
  private lastPositionUpdate = 0;
  private lastLifeUpdate = 0;

  constructor(options: RealtimeGameOptions) {
    super(options);
    this.roomId = options.roomId;
    this.playerId = options.playerId;
    this.playerIndex = options.playerIndex;
    this.realtimeService = new GameRealtimeService(this.roomId, this.playerId);
  }

  protected initialize(): void {
    this.setupRealtimeListeners();
    this.addKeyboardHandlers();
    this.addMobileController();
    this.startSyncIntervals();
  }

  private setupRealtimeListeners(): void {
    const opponentIndex = this.playerIndex === 0 ? 1 : 0;
    const opponent = this.fighters[opponentIndex];

    this.realtimeService.subscribe({
      onMove: (data: GameMove) => {
        // Move is a string (MoveType)
        opponent.setMove(data.move as MoveType);
      },
      onPosition: (data: GamePosition) => {
        opponent.setX(data.x);
        opponent.setY(data.y);
      },
      onLife: (data: GameLife) => {
        opponent.setLife(data.life);
      },
    });
  }

  private addKeyboardHandlers(): void {
    const player = this.fighters[this.playerIndex];

    document.addEventListener(
      "keydown",
      (e) => {
        this.pressed[e.keyCode] = true;
        const move = this.getMove(this.pressed, KEYS, this.playerIndex);
        this.moveFighter(player, move);
      },
      false
    );

    document.addEventListener(
      "keyup",
      (e) => {
        delete this.pressed[e.keyCode];
        const move = this.getMove(this.pressed, KEYS, this.playerIndex);
        this.moveFighter(player, move);
      },
      false
    );
  }

  private addMobileController(): void {
    const container = (this.options as RealtimeGameOptions).arena?.container;
    if (!container) return;

    this.mobileController = new MobileController(
      container,
      (keyCode, pressed) => {
        const player = this.fighters[this.playerIndex];
        if (pressed) {
          this.pressed[keyCode] = true;
        } else {
          delete this.pressed[keyCode];
        }
        const move = this.getMove(this.pressed, KEYS, this.playerIndex);
        this.moveFighter(player, move);
      }
    );
  }

  private startSyncIntervals(): void {
    const player = this.fighters[this.playerIndex];

    // Sync position every 500ms
    setInterval(() => {
      if (!player.isJumping()) {
        const now = Date.now();
        if (now - this.lastPositionUpdate > 450) {
          this.realtimeService.sendPosition(player.getX(), player.getY());
          this.lastPositionUpdate = now;
        }
      }
    }, 500);

    // Sync life every 2 seconds
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastLifeUpdate > 1900) {
        this.realtimeService.sendLife(player.getLife());
        this.lastLifeUpdate = now;
      }
    }, 2000);
  }

  private getMove(
    pressed: Record<number, boolean>,
    k: typeof KEYS,
    p: number
  ): MoveType | null {
    const f = this.fighters[p];
    const leftOrient = "left" as const;
    const rightOrient = "right" as const;
    const orient = f.getOrientation();

    if (f.getMove().type === MoveType.SQUAT && !pressed[k.DOWN]) {
      return MoveType.STAND_UP;
    }
    if (f.getMove().type === MoveType.BLOCK && !pressed[k.BLOCK]) {
      return MoveType.STAND;
    }
    if (Object.keys(pressed).length === 0) {
      return MoveType.STAND;
    }
    if (pressed[k.BLOCK]) {
      return MoveType.BLOCK;
    } else if (pressed[k.LEFT]) {
      if (pressed[k.UP]) {
        return MoveType.BACKWARD_JUMP;
      } else if (pressed[k.HK] && orient === leftOrient) {
        return MoveType.SPIN_KICK;
      }
      return MoveType.WALK_BACKWARD;
    } else if (pressed[k.RIGHT]) {
      if (pressed[k.UP]) {
        return MoveType.FORWARD_JUMP;
      } else if (pressed[k.HK] && orient === rightOrient) {
        return MoveType.SPIN_KICK;
      }
      return MoveType.WALK;
    } else if (pressed[k.DOWN]) {
      if (pressed[k.HP]) {
        return MoveType.UPPERCUT;
      } else if (pressed[k.LK]) {
        return MoveType.SQUAT_LOW_KICK;
      } else if (pressed[k.HK]) {
        return MoveType.SQUAT_HIGH_KICK;
      } else if (pressed[k.LP]) {
        return MoveType.SQUAT_LOW_PUNCH;
      }
      return MoveType.SQUAT;
    } else if (pressed[k.HK]) {
      if (f.getMove().type === MoveType.FORWARD_JUMP) {
        return MoveType.FORWARD_JUMP_KICK;
      } else if (f.getMove().type === MoveType.BACKWARD_JUMP) {
        return MoveType.BACKWARD_JUMP_KICK;
      }
      return MoveType.HIGH_KICK;
    } else if (pressed[k.UP]) {
      return MoveType.JUMP;
    } else if (pressed[k.LK]) {
      if (f.getMove().type === MoveType.FORWARD_JUMP) {
        return MoveType.FORWARD_JUMP_KICK;
      } else if (f.getMove().type === MoveType.BACKWARD_JUMP) {
        return MoveType.BACKWARD_JUMP_KICK;
      }
      return MoveType.LOW_KICK;
    } else if (pressed[k.LP]) {
      if (f.getMove().type === MoveType.FORWARD_JUMP) {
        return MoveType.FORWARD_JUMP_PUNCH;
      } else if (f.getMove().type === MoveType.BACKWARD_JUMP) {
        return MoveType.BACKWARD_JUMP_PUNCH;
      }
      return MoveType.LOW_PUNCH;
    } else if (pressed[k.HP]) {
      if (f.getMove().type === MoveType.FORWARD_JUMP) {
        return MoveType.FORWARD_JUMP_PUNCH;
      } else if (f.getMove().type === MoveType.BACKWARD_JUMP) {
        return MoveType.BACKWARD_JUMP_PUNCH;
      }
      return MoveType.HIGH_PUNCH;
    }
    return null;
  }

  private moveFighter(fighter: Fighter, move: MoveType | null): void {
    if (move) {
      fighter.setMove(move);
      // Broadcast move to other players (MoveType is already a string)
      this.realtimeService.sendMove(move);
    }
  }

  public reset(): void {
    super.reset();
    this.realtimeService.unsubscribe();
    if (this.mobileController) {
      this.mobileController.destroy();
      this.mobileController = null;
    }
  }
}
