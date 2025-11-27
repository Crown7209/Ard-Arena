import { FiniteMove } from '../finiteMove';
import { MoveType } from '../moveTypes';
import { CONFIG } from '../config';
import type { Fighter } from '../../fighters/fighter';

export class Squat extends FiniteMove {
  private standingSpriteHeight: number = 0;
  private groundLineY: number = 0;

  constructor(owner: Fighter) {
    super(owner, MoveType.SQUAT, 40);
    this.totalSteps = 3;
  }

  protected _beforeGo(): void {
    super._beforeGo();
    // Get the standing sprite height from current state (should be standing before crouching)
    // or calculate from PLAYER_TOP position
    const currentState = this.owner.getState();
    if (currentState) {
      this.standingSpriteHeight = currentState.height;
      // Calculate the ground line Y position (where feet touch) when standing
      // Ground line = PLAYER_TOP + standing sprite height
      this.groundLineY = CONFIG.PLAYER_TOP + this.standingSpriteHeight;
    } else {
      // Fallback: use current Y position if state not available
      const currentY = this.owner.getY();
      // Estimate ground line based on current position
      this.groundLineY = currentY + (this.owner.getVisibleHeight() || 120);
      this.standingSpriteHeight = this.owner.getVisibleHeight() || 120;
    }
  }

  protected _action(): void {
    this.keepDistance();
    // Ensure feet stay aligned with ground line when crouching, positioned lower to match opponent's leg
    const currentState = this.owner.getState();
    if (currentState && this.groundLineY > 0) {
      const currentSpriteHeight = currentState.height;
      // Calculate target Y so that the bottom of the sprite (feet) touches the ground line
      // Add significant offset to place character lower when crouching (matching opponent's leg position)
      const lowerOffset = 60; // Additional offset to place crouching character lower, aligned with opponent's leg
      const targetY = this.groundLineY - currentSpriteHeight + lowerOffset;
      this.owner.setY(targetY);
    }
    if (this.currentStep === 2) {
      this.stop();
    }
  }
}
