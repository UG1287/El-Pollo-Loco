/**
 * Represents a movable object in the game, extending DrawableObject.
 * Handles movement, gravity, collisions, and basic physics.
 */
class MovableObject extends DrawableObject {
  speed = 0.15;
  otherDirection = false;
  speedY = 0;
  acceleration = 2.5;
  energy = 100;
  lastHit = 0;
  currentAnimationImages = [];
  animationFrameIndex = 0;
  GROUND_LEVEL = 180;
  hitbox = { top: 0, bottom: 0, left: 0, right: 0 };

  /**
   * Applies gravity to the object, pulling it downward over time.
   * @returns {void}
   */
  applyGravity() {
    setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
        if (!(this instanceof ThrowableObject) && this.y > this.GROUND_LEVEL) {
          this.y = this.GROUND_LEVEL;
          this.speedY = 0;
        }
      }
    }, 1000 / 30);
  }

  /**
   * Checks if the object is currently above the ground.
   * @returns {boolean} True if above ground, false otherwise.
   */
  isAboveGround() {
    return this.y < this.GROUND_LEVEL;
  }

  /**
   * Checks collision with another movable object.
   * @param {MovableObject} mo - The other movable object.
   * @returns {boolean} True if a collision is detected, false otherwise.
   */
  isColliding(mo) {
    const x1 = this.x + this.hitbox.left;
    const y1 = this.y + this.hitbox.top;
    const w1 = this.width - this.hitbox.left - this.hitbox.right;
    const h1 = this.height - this.hitbox.top - this.hitbox.bottom;

    const x2 = mo.x + (mo.hitbox?.left ?? 0);
    const y2 = mo.y + (mo.hitbox?.top ?? 0);
    const w2 = mo.width  - ((mo.hitbox?.left ?? 0) + (mo.hitbox?.right ?? 0));
    const h2 = mo.height - ((mo.hitbox?.top  ?? 0) + (mo.hitbox?.bottom ?? 0));

    return (
      x1 < x2 + w2 &&
      x1 + w1 > x2 &&
      y1 < y2 + h2 &&
      y1 + h1 > y2
    );
  }

  /**
   * Handles being hit by reducing energy and playing a hit sound.
   * @returns {void}
   */
  hit() {
    if (this.world && this.world.soundManager) {
      this.world.soundManager.playSound('hit');
    }
    this.lastAction = Date.now();
    this.energy -= 5;
    if (this.energy < 0) this.energy = 0;
    else this.lastHit = Date.now();
  }

  /**
   * Checks if the object was recently hit.
   * @returns {boolean} True if recently hurt, false otherwise.
   */
  isHurt() {
    let timePassed = (Date.now() - this.lastHit) / 1000;
    return timePassed < 0.7;
  }

  /**
   * Reduces the object's energy by a larger amount.
   * @returns {void}
   */
  takeDamage() {
    this.energy -= 50;
  }

  /**
   * Checks if the object is dead (no energy left).
   * @returns {boolean} True if dead, false otherwise.
   */
  isDead() {
    return this.energy <= 0;
  }

  /**
   * Plays an animation by cycling through provided images.
   * @param {string[]} images - Array of image paths to animate through.
   * @returns {void}
   */
  playAnimation(images) {
    if (!images || images.length === 0) return;
    if (this.currentAnimationImages !== images) {
      this.currentAnimationImages = images;
      this.animationFrameIndex = 0; // Reset to first image for new animation
    }
    const path = this.currentAnimationImages[this.animationFrameIndex];
    this.img = this.imageCache[path];
    this.animationFrameIndex++;
    if (this.animationFrameIndex >= this.currentAnimationImages.length) {
      this.animationFrameIndex = 0;
    }
  }

  /**
   * Moves the object to the right.
   * @returns {void}
   */
  moveRight() {
    this.lastAction = Date.now();
    this.x += this.speed;
    clearTimeout(this.idleTimeout);
    clearTimeout(this.longIdleTimeout);
  }

  /**
   * Moves the object to the left.
   * @returns {void}
   */
  moveLeft() {
    this.lastAction = Date.now();
    this.x -= this.speed;
    clearTimeout(this.idleTimeout);
    clearTimeout(this.longIdleTimeout);
  }

  /**
   * Makes the object jump by setting a vertical speed.
   * @returns {void}
   */
  jump() {
    this.lastAction = Date.now();
    this.speedY = 25;
    clearTimeout(this.idleTimeout);
    clearTimeout(this.longIdleTimeout);
  }

  /**
   * Gets the top y-coordinate of the object.
   * @returns {number} The y-coordinate at the top.
   */
  getTop() {
    return this.y;
  }

  /**
   * Gets the bottom y-coordinate of the object.
   * @returns {number} The y-coordinate at the bottom.
   */
  getBottom() {
    return this.y + this.height;
  }

  /**
   * Gets the left x-coordinate of the object.
   * @returns {number} The x-coordinate at the left side.
   */
  getLeft() {
    return this.x;
  }

  /**
   * Gets the right x-coordinate of the object.
   * @returns {number} The x-coordinate at the right side.
   */
  getRight() {
    return this.x + this.width;
  }
}
