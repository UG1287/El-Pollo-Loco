// SmallChicken.class.js
class SmallChicken extends Chicken {
  y = 370;
  height = 60;
  width = 60;

  IMAGES_WALKING = [
    'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
    'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
    'img/3_enemies_chicken/chicken_small/1_walk/3_w.png',
  ];
  IMAGES_DEAD = ['img/3_enemies_chicken/chicken_small/2_dead/dead.png'];

  constructor(x) {
    super();
    clearInterval(this.walkingInterval);
    clearInterval(this.animationInterval);
    this.loadImage(this.IMAGES_WALKING[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_DEAD);
    this.IMAGE_DEAD = this.IMAGES_DEAD[0];
    this.animateSmall();
  }

  animateSmall() {
    this.walkingInterval = setInterval(() => this.moveLeft(), 1000 / 60);
    this.animationInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 200);
  }
}
