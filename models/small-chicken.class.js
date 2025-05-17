/**
 * Represents a smaller version of the Chicken enemy.
 * Inherits from Chicken.
 */
class SmallChicken extends Chicken {
    
    height = 60;
    width = 60;
  
    IMAGES_WALKING = [
      'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
      'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
      'img/3_enemies_chicken/chicken_small/1_walk/3_w.png',
    ];
    IMAGES_DEAD = ['img/3_enemies_chicken/chicken_small/2_dead/dead.png'];
  
    /**
     * Creates a new SmallChicken instance at a given horizontal position.
     * Loads specific images and starts a slower animation loop.
     * @param {number} x - The horizontal position of the SmallChicken.
     */
    constructor(x = 200 + Math.random() * 500) {
      super();
      clearInterval(this.walkingInterval);
      clearInterval(this.animationInterval);
      this.loadImage(this.IMAGES_WALKING[0]);
      this.loadImages(this.IMAGES_WALKING);
      this.loadImages(this.IMAGES_DEAD);
      this.x = x;
      this.y = this.GROUND_LEVEL + 190;
      this.IMAGE_DEAD = this.IMAGES_DEAD[0];

      this.animateSmall();
    }
  
    /**
     * Starts the movement and animation loop for the SmallChicken
     * with a slower walking animation compared to the normal Chicken.
     * @returns {void}
     */
    animateSmall() {
      this.walkingInterval = setInterval(() => this.moveLeft(), 1000 / 60);
      this.animationInterval = setInterval(() => {
        this.playAnimation(this.IMAGES_WALKING);
      }, 200);
    }
  }
  