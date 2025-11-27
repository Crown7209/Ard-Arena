import { MoveType } from '../moveTypes';
import { KEYS } from './basicController';

export interface TouchButton {
  keyCode: number;
  element: HTMLElement;
  isPressed: boolean;
}

export class MobileController {
  private container: HTMLElement;
  private pressed: Record<number, boolean> = {};
  private touchButtons: Map<number, TouchButton> = new Map();
  private onKeyPress: (keyCode: number, pressed: boolean) => void;
  private isVisible: boolean = false;

  constructor(
    container: HTMLElement,
    onKeyPress: (keyCode: number, pressed: boolean) => void
  ) {
    this.container = container;
    this.onKeyPress = onKeyPress;
    this.createController();
    this.setupOrientationLock();
    this.updateVisibility();
    window.addEventListener('resize', () => this.updateVisibility());
  }

  private isMobile(): boolean {
    const width = window.innerWidth;
    // Mobile controller only works between 375px and 1024px
    // If screen is smaller or larger, don't show mobile controller
    return width >= 375 && width <= 1024;
  }

  private updateVisibility(): void {
    const shouldShow = this.isMobile();
    if (shouldShow !== this.isVisible) {
      this.isVisible = shouldShow;
      const controller = this.container.querySelector('.mobile-controller');
      if (controller) {
        (controller as HTMLElement).style.display = shouldShow ? 'flex' : 'none';
      }
    }
  }

  private setupOrientationLock(): void {
    if (!this.isMobile()) return;

    // Try to lock orientation to landscape
    const lockOrientation = () => {
      if (screen.orientation && 'lock' in screen.orientation && typeof (screen.orientation as any).lock === 'function') {
        (screen.orientation as any).lock('landscape').catch(() => {
          // Orientation lock may fail in some browsers, ignore silently
        });
      } else if ((screen as any).lockOrientation) {
        (screen as any).lockOrientation('landscape');
      } else if ((screen as any).mozLockOrientation) {
        (screen as any).mozLockOrientation('landscape');
      } else if ((screen as any).msLockOrientation) {
        (screen as any).msLockOrientation('landscape');
      }
    };

    // Lock on initial load
    lockOrientation();

    // Lock on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(lockOrientation, 100);
    });

    // Lock on resize (for some devices)
    window.addEventListener('resize', () => {
      if (this.isMobile()) {
        setTimeout(lockOrientation, 100);
      }
    });
  }

  private createController(): void {
    const controller = document.createElement('div');
    controller.className = 'mobile-controller';
    controller.style.display = this.isMobile() ? 'flex' : 'none';

    // Left side - D-pad and movement controls
    const leftSide = this.createLeftSide();
    controller.appendChild(leftSide);

    // Right side - Action buttons (ASDF)
    const rightSide = this.createRightSide();
    controller.appendChild(rightSide);

    this.container.appendChild(controller);
  }

  private createLeftSide(): HTMLElement {
    const leftSide = document.createElement('div');
    leftSide.className = 'controller-left';

    // Circular joystick container
    const joystickContainer = document.createElement('div');
    joystickContainer.className = 'joystick-container';
    
    // Joystick base (circular background)
    const joystickBase = document.createElement('div');
    joystickBase.className = 'joystick-base';
    
    // Joystick handle (the draggable part)
    const joystickHandle = document.createElement('div');
    joystickHandle.className = 'joystick-handle';
    
    joystickContainer.appendChild(joystickBase);
    joystickContainer.appendChild(joystickHandle);
    
    // Setup drag gestures for the joystick
    this.setupJoystickDrag(joystickContainer, joystickHandle);

    leftSide.appendChild(joystickContainer);

    return leftSide;
  }

  private createRightSide(): HTMLElement {
    const rightSide = document.createElement('div');
    rightSide.className = 'controller-right';

    // Action buttons in diamond shape: X (top), Y (left), A (right), B (bottom)
    // Mapping: X=A(HP), Y=S(LP), A=F(HK), B=D(LK)
    const buttonX = this.createButton('X', KEYS.HP, 'action-btn btn-x'); // Top - HP
    const buttonY = this.createButton('Y', KEYS.LP, 'action-btn btn-y'); // Left - LP
    const buttonA = this.createButton('A', KEYS.HK, 'action-btn btn-a'); // Right - HK
    const buttonB = this.createButton('B', KEYS.LK, 'action-btn btn-b'); // Bottom - LK

    rightSide.appendChild(buttonX);
    rightSide.appendChild(buttonY);
    rightSide.appendChild(buttonA);
    rightSide.appendChild(buttonB);

    return rightSide;
  }

  private createButton(
    label: string,
    keyCode: number,
    className: string
  ): HTMLElement {
    const button = document.createElement('div');
    button.className = className;
    button.textContent = label;
    button.setAttribute('data-key', keyCode.toString());

    const touchButton: TouchButton = {
      keyCode,
      element: button,
      isPressed: false,
    };

    this.touchButtons.set(keyCode, touchButton);

    // Touch start
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleTouch(keyCode, true);
    });

    // Touch end
    button.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleTouch(keyCode, false);
    });

    // Touch cancel (when finger leaves screen)
    button.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.handleTouch(keyCode, false);
    });

    // Mouse events for testing on desktop
    button.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.handleTouch(keyCode, true);
    });

    button.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.handleTouch(keyCode, false);
    });

    button.addEventListener('mouseleave', (e) => {
      e.preventDefault();
      this.handleTouch(keyCode, false);
    });

    return button;
  }

  private handleTouch(keyCode: number, pressed: boolean): void {
    // Update pressed state for all keys (movement and action buttons)
    this.pressed[keyCode] = pressed;

    // Only update visual state for action buttons (they're in touchButtons map)
    const touchButton = this.touchButtons.get(keyCode);
    if (touchButton) {
      touchButton.isPressed = pressed;
      if (pressed) {
        touchButton.element.classList.add('pressed');
      } else {
        touchButton.element.classList.remove('pressed');
      }
    }

    // Always call onKeyPress for both movement and action keys
    this.onKeyPress(keyCode, pressed);
  }

  public getPressedKeys(): Record<number, boolean> {
    return { ...this.pressed };
  }

  private setupJoystickDrag(container: HTMLElement, handle: HTMLElement): void {
    let isDragging = false;
    let centerX = 0;
    let centerY = 0;
    let radius = 0;
    const deadZone = 15; // Minimum distance to trigger movement
    const maxDistance = 45; // Maximum drag distance (slightly reduced to keep handle visible)

    const updateJoystickPosition = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
      radius = rect.width / 2 - 10;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Limit handle to circle boundary
      const limitedDistance = Math.min(distance, maxDistance);
      const angle = Math.atan2(deltaY, deltaX);

      const handleX = Math.cos(angle) * limitedDistance;
      const handleY = Math.sin(angle) * limitedDistance;

      // Position handle to follow finger - use pixel values directly since handle is already centered
      handle.style.transform = `translate(calc(-50% + ${handleX}px), calc(-50% + ${handleY}px))`;
      handle.style.transition = 'none'; // Disable transition while dragging for immediate response

      // Determine movement direction
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      // Release all keys first
      this.handleTouch(KEYS.UP, false);
      this.handleTouch(KEYS.DOWN, false);
      this.handleTouch(KEYS.LEFT, false);
      this.handleTouch(KEYS.RIGHT, false);

      if (limitedDistance > deadZone) {
        // Upward movement (jump)
        if (deltaY < -deadZone && absY > absX * 0.7) {
          this.handleTouch(KEYS.UP, true);
        }
        // Downward movement (crouch)
        else if (deltaY > deadZone && absY > absX * 0.7) {
          this.handleTouch(KEYS.DOWN, true);
        }
        // Left movement (backward)
        else if (deltaX < -deadZone && absX > absY * 0.7) {
          this.handleTouch(KEYS.LEFT, true);
        }
        // Right movement (forward)
        else if (deltaX > deadZone && absX > absY * 0.7) {
          this.handleTouch(KEYS.RIGHT, true);
        }
        // Diagonal movements
        else {
          // Up-Left (backward jump)
          if (deltaY < -deadZone && deltaX < -deadZone) {
            this.handleTouch(KEYS.UP, true);
            this.handleTouch(KEYS.LEFT, true);
          }
          // Up-Right (forward jump)
          else if (deltaY < -deadZone && deltaX > deadZone) {
            this.handleTouch(KEYS.UP, true);
            this.handleTouch(KEYS.RIGHT, true);
          }
          // Down-Left
          else if (deltaY > deadZone && deltaX < -deadZone) {
            this.handleTouch(KEYS.DOWN, true);
            this.handleTouch(KEYS.LEFT, true);
          }
          // Down-Right
          else if (deltaY > deadZone && deltaX > deadZone) {
            this.handleTouch(KEYS.DOWN, true);
            this.handleTouch(KEYS.RIGHT, true);
          }
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        isDragging = true;
        updateJoystickPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        e.preventDefault();
        updateJoystickPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        isDragging = false;
        // Re-enable transition for smooth return to center
        handle.style.transition = 'transform 0.1s ease-out';
        // Reset handle position to center
        handle.style.transform = 'translate(-50%, -50%)';
        // Release all keys
        this.handleTouch(KEYS.UP, false);
        this.handleTouch(KEYS.DOWN, false);
        this.handleTouch(KEYS.LEFT, false);
        this.handleTouch(KEYS.RIGHT, false);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    // Mouse events for desktop testing
    container.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      updateJoystickPosition(e.clientX, e.clientY);
    });

    container.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        updateJoystickPosition(e.clientX, e.clientY);
      }
    });

    container.addEventListener('mouseup', handleTouchEnd);
    container.addEventListener('mouseleave', handleTouchEnd);
  }

  public destroy(): void {
    try {
      const controller = this.container.querySelector('.mobile-controller');
      if (controller && controller.parentNode) {
        controller.parentNode.removeChild(controller);
      }
    } catch (e) {
      // Container may already be destroyed, ignore
    }
    this.touchButtons.clear();
    this.pressed = {};
  }
}

