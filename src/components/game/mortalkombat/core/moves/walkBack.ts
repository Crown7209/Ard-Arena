import { CycleMove } from '../cycleMove';
import { MoveType } from '../moveTypes';
import { CONFIG } from '../config';
import type { Fighter } from '../../fighters/fighter';

export class WalkBack extends CycleMove {
  constructor(owner: Fighter) {
    super(owner, MoveType.WALK_BACKWARD, 9);
  }

  protected _action(): void {
    // Reduced step distance for slower, more controlled movement
    this.owner.setX(this.owner.getX() - 12);
    this.owner.setY(CONFIG.PLAYER_TOP);
  }
}

