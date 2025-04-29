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

  /**
   * Applies gravity to the object, pulling it downward over time.
   * @returns {void}
   */
  applyGravity() {
    setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }
    }, 1000 / 30);
  }

  /**
   * Checks if the object is currently above the ground.
   * @returns {boolean} True if above ground, false otherwise.
   */
  isAboveGround() {
    if (this instanceof ThrowableObject) {
      return true;
    } else {
      return this.y < 230;
    }
  }

  /**
   * Checks collision with another movable object.
   * @param {MovableObject} mo - The other movable object.
   * @returns {boolean} True if a collision is detected, false otherwise.
   */
  isColliding(mo) {
    return (
      this.x + this.width >= mo.x &&
      this.x <= mo.x + mo.width &&
      this.y + this.height >= mo.y &&
      this.y <= mo.y + mo.height
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
    return timePassed < 0.25;
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
