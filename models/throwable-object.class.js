class ThrowableObject extends MovableObject {
  constructor(x, y, direction) {
    super().loadImage('img/6_salsa_bottle/salsa_bottle.png');
    this.x = x;
    this.y = y;
    this.height = 60;
    this.width = 60;
    this.throwDirection = direction;
    this.throw();
  }

  throw() {
    this.speedY = 20;
    this.applyGravity();

    let interval = setInterval(() => {
      this.x += this.throwDirection * 10;
    }, 25);

    setTimeout(() => clearInterval(interval), 2000);
  }
}
