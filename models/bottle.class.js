class Bottle extends MovableObject {
  width = 60;
  height = 60;

  IMAGES_BOTTLE = [
    'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
    'img/6_salsa_bottle/2_salsa_bottle_on_ground.png',
  ];

  constructor(x, y, direction) {
    super().loadImage(this.IMAGES_BOTTLE[0]);
    this.loadImages(this.IMAGES_BOTTLE);
    this.x = x;
    this.y = y;
    this.animate();
  }

  animate() {
    this.groundIntervalID = setInterval(() => {
      this.playAnimation(this.IMAGES_BOTTLE);
    }, 300);
  }

  stop() {
    clearInterval(this.groundIntervalID);
  }
}
