/**
 * Represents a moving cloud object in the game background.
 * Inherits from MovableObject.
 */
class Cloud extends MovableObject {
  y = 20;
  width = 500;
  height = 250;
  speed = 0.15;

  /**
   * Creates a new Cloud instance with a random horizontal position
   * and starts its movement animation.
   */
  constructor() {
    super().loadImage('img/5_background/layers/4_clouds/1.png');
    this.x = Math.random() * 500;
    this.animate();
  }

  /**
   * Starts the cloud's movement to the left.
   * @returns {void}
   */
  animate() {
    this.moveLeft();
  }

  /**
   * Continuously moves the cloud to the left at a set speed.
   * @returns {void}
   */
  moveLeft() {
    setInterval(() => {
      this.x -= this.speed;
    }, 1000 / 60);
  }
}
