/**
 * Represents a throwable object (e.g., salsa bottle) in the game.
 * Inherits from MovableObject.
 */
class ThrowableObject extends MovableObject {
  /**
   * Creates a new ThrowableObject instance at the specified position and direction.
   * @param {number} x - The starting x-position.
   * @param {number} y - The starting y-position.
   * @param {number} direction - The horizontal throw direction (1 for right, -1 for left).
   */
  constructor(x, y, direction) {
    super().loadImage('img/6_salsa_bottle/salsa_bottle.png');
    this.x = x;
    this.y = y;
    this.height = 60;
    this.width = 60;
    this.throwDirection = direction;
    this.isThrowable = true;
    this.GROUND_LEVEL = -Infinity;
    this.throw();
  }

  /**
   * Applies gravity to the object by updating its vertical position and speed.
   * Should be called once to start continuous gravity effect.
   * @returns {void}
   */
  applyGravity() {
    this.gravityInterval = setInterval(() => {
      this.y -= this.speedY;
      this.speedY -= this.acceleration;
    }, 1000 / 30);
  }

  /**
   * Initiates the throw motion by applying gravity and moving horizontally.
   * @returns {void}
   */
  throw() {
    this.speedY = 20;
    this.applyGravity();
    let interval = setInterval(() => {
      this.x += this.throwDirection * 10;
    }, 25);
    setTimeout(() => clearInterval(interval), 2000);
  }
}
