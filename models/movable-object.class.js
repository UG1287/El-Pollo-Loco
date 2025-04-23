class MovableObject extends DrawableObject {
  speed = 0.15;
  otherDirection = false;
  speedY = 0;
  acceleration = 2.5;
  energy = 100;
  lastHit = 0;

  applyGravity() {
    setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }
    }, 1000 / 25);
  }

  isAboveGround() {
    if (this instanceof ThrowableObject) {
      return true;
    } else {
      return this.y < 230;
    }
  }

  isColliding(mo) {
    return (
      this.x + this.width >= mo.x &&
      this.x <= mo.x + mo.width &&
      this.y + this.height >= mo.y &&
      this.y <= mo.y + mo.height
    );
  }

  hit() {
    if (this.world && this.world.soundManager) { this.world.soundManager.playSound('hit'); }

    this.lastAction = Date.now();
    this.energy -= 5;
    if (this.energy < 0) this.energy = 0;
    else this.lastHit = Date.now();
  }

  isHurt() {
    const timePassed = (Date.now() - this.lastHit) / 1000;
    return timePassed < 0.7;
  }

  takeDamage() {
    this.energy -= 50;
  }

  isDead() {
    return this.energy <= 0;
  }

  playAnimation(images) {
    let i = this.currentImage % images.length;
    let path = images[i];
    this.img = this.imageCache[path];
    this.currentImage++;
  }

  moveRight() {
    this.lastAction = Date.now();
    this.x += this.speed;
    clearTimeout(this.idleTimeout);
    clearTimeout(this.longIdleTimeout);
  }

  moveLeft() {
    this.lastAction = Date.now();
    this.x -= this.speed;
    clearTimeout(this.idleTimeout);
    clearTimeout(this.longIdleTimeout);
  }

  jump() {
    this.lastAction = Date.now();
    this.speedY = 25;
    clearTimeout(this.idleTimeout);
    clearTimeout(this.longIdleTimeout);
  }

  getTop() {
    return this.y;
  }

  getBottom() {
    return this.y + this.height;
  }

  getLeft() {
    return this.x;
  }

  getRight() {
    return this.x + this.width;
  }
}
