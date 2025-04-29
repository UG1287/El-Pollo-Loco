/**
 * Represents a bottle collectible object in the game.
 * Inherits from MovableObject.
 */
class Bottle extends MovableObject {
  width = 60;
  height = 60;

  IMAGES_BOTTLE = [
    'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
    'img/6_salsa_bottle/2_salsa_bottle_on_ground.png',
  ];

  /**
   * Creates a new Bottle instance at the specified position.
   * @param {number} x - The x-position where the bottle appears.
   * @param {number} y - The y-position where the bottle appears.
   * @param {number} direction - The movement direction (unused but consistent with other constructors).
   */
  constructor(x, y, direction) {
    super().loadImage(this.IMAGES_BOTTLE[0]);
    this.loadImages(this.IMAGES_BOTTLE);
    this.x = x;
    this.y = y;
    this.animate();
  }

  /**
   * Starts the animation loop for switching bottle images.
   * @returns {void}
   */
  animate() {
    this.groundIntervalID = setInterval(() => {
      this.playAnimation(this.IMAGES_BOTTLE);
    }, 300);
  }

  /**
   * Stops the bottle animation.
   * @returns {void}
   */
  stop() {
    clearInterval(this.groundIntervalID);
  }
}
