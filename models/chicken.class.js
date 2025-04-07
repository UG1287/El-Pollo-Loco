class Chicken extends MovableObject {
  y = 350;
  height = 80;
  width = 70;
  IMAGES_WALKING = [
    'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
    'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
    'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
  ];
  IMAGE_DEAD = 'img/3_enemies_chicken/chicken_normal/2_dead/dead.png';

  constructor() {
    super().loadImage(this.IMAGES_WALKING[0]);
    this.loadImages(this.IMAGES_WALKING);

    this.x = 200 + Math.random() * 500;
    this.speed = 0.15 + Math.random() * 0.25;

    this.animate();
  }

  animate() {
    this.walkingInterval = setInterval(() => {
      this.moveLeft();
    }, 1000 / 60);

    this.animationInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 200);
  }

  die() {
    console.log('Huhn gestorben!');
    this.loadImage(this.IMAGE_DEAD);
    clearInterval(this.walkingInterval);
    clearInterval(this.animationInterval);

    setTimeout(() => {
      this.removeChicken();
    }, 300);
  }

  removeChicken() {
    if (this.world) {
      let index = this.world.level.enemies.indexOf(this);
      if (index !== -1) {
        this.world.level.enemies.splice(index, 1);
      }
    }
  }
}
