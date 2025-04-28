class Endboss extends MovableObject {
  y = 0;
  height = 450;
  width = 300;
  speed = 1.9;
  energy = 50;
  chaseRange = 1000;
  minDistance = 100;
  movementIntervalID;
  animationIntervalID;
  deadIntervalID;
  deadPlayed = false;
  currentAnimationImages = [];
  alertTimePassed = false;

  IMAGES_WALK = [
    'img/4_enemie_boss_chicken/1_walk/G1.png',
    'img/4_enemie_boss_chicken/1_walk/G2.png',
    'img/4_enemie_boss_chicken/1_walk/G3.png',
    'img/4_enemie_boss_chicken/1_walk/G4.png',
  ];

  IMAGES_ALERT = [
    'img/4_enemie_boss_chicken/2_alert/G5.png',
    'img/4_enemie_boss_chicken/2_alert/G6.png',
    'img/4_enemie_boss_chicken/2_alert/G7.png',
    'img/4_enemie_boss_chicken/2_alert/G8.png',
    'img/4_enemie_boss_chicken/2_alert/G9.png',
    'img/4_enemie_boss_chicken/2_alert/G10.png',
    'img/4_enemie_boss_chicken/2_alert/G11.png',
    'img/4_enemie_boss_chicken/2_alert/G12.png',
  ];

  IMAGES_ATTACK = [
    'img/4_enemie_boss_chicken/3_attack/G13.png',
    'img/4_enemie_boss_chicken/3_attack/G14.png',
    'img/4_enemie_boss_chicken/3_attack/G15.png',
    'img/4_enemie_boss_chicken/3_attack/G16.png',
    'img/4_enemie_boss_chicken/3_attack/G17.png',
    'img/4_enemie_boss_chicken/3_attack/G18.png',
    'img/4_enemie_boss_chicken/3_attack/G19.png',
    'img/4_enemie_boss_chicken/3_attack/G20.png',
  ];

  IMAGES_HURT = [
    'img/4_enemie_boss_chicken/4_hurt/G21.png',
    'img/4_enemie_boss_chicken/4_hurt/G22.png',
    'img/4_enemie_boss_chicken/4_hurt/G23.png',
  ];

  IMAGES_DEAD = [
    'img/4_enemie_boss_chicken/5_dead/G24.png',
    'img/4_enemie_boss_chicken/5_dead/G25.png',
    'img/4_enemie_boss_chicken/5_dead/G26.png',
  ];

  constructor(xPos) {
    super().loadImage(this.IMAGES_ALERT[0]);
    this.x = xPos;
    this.loadImages(this.IMAGES_WALK);
    this.loadImages(this.IMAGES_ALERT);
    this.loadImages(this.IMAGES_ATTACK);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.currentAnimationImages = this.IMAGES_ALERT;
    setTimeout(() => {
      this.alertTimePassed = true;
    }, 1000);
    this.startMovement();
    this.startAnimation();
  }

  startMovement() {
    this.alertStarted = false;
    this.alertFinished = false;

    this.movementIntervalID = setInterval(() => {
      if (!this.world || this.isDead()) return;

      const bossCenter = this.x + this.width / 2;
      const charCenter =
        this.world.character.x + this.world.character.width / 2;
      const distX = charCenter - bossCenter;

      const bossIsVisible =
        this.x + this.width > -this.world.camera_x &&
        this.x < -this.world.camera_x + this.world.canvas.width;

      if (Math.abs(distX) < this.chaseRange && bossIsVisible) {
        if (!this.alertStarted) {
          this.alertStarted = true;
          this.currentAnimationImages = this.IMAGES_ALERT;
          this.currentImage = 0;

          setTimeout(() => {
            this.alertFinished = true;
          }, 1500);
        }

        if (this.alertFinished && Math.abs(distX) > this.minDistance) {
          if (distX > 0) {
            this.otherDirection = true;
            this.moveRight();
          } else {
            this.otherDirection = false;
            this.moveLeft();
          }
        }
      }
    }, 1000 / 60);
  }

  startAnimation() {
    this.animationIntervalID = setInterval(() => {
      if (this.isDead()) {
        if (!this.deadPlayed) {
          this.deadPlayed = true;
          clearInterval(this.movementIntervalID);
          clearInterval(this.animationIntervalID);
          this.playDeadSequence();
        }
        return;
      }

      let newAnimation = this.IMAGES_ALERT;

      if (this.isHurt()) {
        newAnimation = this.IMAGES_HURT;
      } else if (!this.alertTimePassed) {
        newAnimation = this.IMAGES_ALERT;
      } else {
        const bossCenter = this.x + this.width / 2;
        const charCenter =
          this.world.character.x + this.world.character.width / 2;
        const distX = charCenter - bossCenter;
        if (Math.abs(distX) < this.minDistance) {
          newAnimation = this.IMAGES_ATTACK;
        } else if (Math.abs(distX) < this.chaseRange) {
          newAnimation = this.IMAGES_WALK;
        }
      }

      if (this.currentAnimationImages !== newAnimation) {
        this.currentAnimationImages = newAnimation;
        this.currentImage = 0;
      }

      this.playAnimation(this.currentAnimationImages);
    }, 120);
  }

  playDeadSequence() {
    let idx = 0;
    this.deadIntervalID = setInterval(() => {
      if (idx < this.IMAGES_DEAD.length) {
        const path = this.IMAGES_DEAD[idx];
        this.img = this.imageCache[path];
        idx++;
      } else {
        clearInterval(this.deadIntervalID);
      }
    }, 200);
  }

  distanceToCharacter() {
    if (!this.world || !this.world.character) return Infinity;
    return Math.abs(this.x - this.world.character.x);
  }

  takeDamage() {
    this.energy -= 20;
    if (this.energy < 0) this.energy = 0;
    if (this.energy > 0) this.lastHit = Date.now();
  }

  setWorld(world) {
    this.world = world;
  }

  stop() {
    clearInterval(this.movementIntervalID);
    clearInterval(this.animationIntervalID);
    clearInterval(this.deadIntervalID);
  }
}
