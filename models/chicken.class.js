/**
 * Represents a Chicken enemy in the game.
 * Inherits from MovableObject.
 */
class Chicken extends MovableObject {
  height = 70;
  width = 60;
  IMAGES_WALKING = [
    'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
    'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
    'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
  ];
  IMAGE_DEAD = 'img/3_enemies_chicken/chicken_normal/2_dead/dead.png';

  /**
   * Creates a new Chicken instance, loads walking images,
   * sets random position and speed, and starts the animation.
   */
  constructor(x = 200 + Math.random() * 500) {
    super().loadImage(this.IMAGES_WALKING[0]);
    this.loadImages(this.IMAGES_WALKING);

    this.x = x;
    this.y = this.GROUND_LEVEL + 180;

    this.speed = 0.15 + Math.random() * 0.25;

    this.animate();
  }

  /**
   * Starts the movement and animation of the chicken.
   * - Moves left continuously.
   * - Cycles through walking images to simulate animation.
   *
   * @returns {void}
   */
  animate() {
    this.walkingInterval = setInterval(() => {
      this.moveLeft();
    }, 1000 / 60);

    this.animationInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 100);
  }

  /**
   * Handles the chicken's death:
   * - Stops movement and animation.
   * - Displays the dead image.
   * - Removes the chicken from the world after a short delay.
   *
   * @returns {void}
   */
  die() {
    this.loadImage(this.IMAGE_DEAD);
    clearInterval(this.walkingInterval);
    clearInterval(this.animationInterval);

    setTimeout(() => {
      this.removeChicken();
    }, 300);
  }

  /**
   * Removes the chicken from the world's enemy array
   * if it exists within the current level.
   *
   * @returns {void}
   */
  removeChicken() {
    if (this.world) {
      let index = this.world.level.enemies.indexOf(this);
      if (index !== -1) {
        this.world.level.enemies.splice(index, 1);
      }
    }
  }
}
