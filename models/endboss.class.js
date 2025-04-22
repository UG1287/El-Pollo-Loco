class Endboss extends MovableObject {
  y = 0;
  height = 450;
  width = 300;
  speed = 1.9;
  energy = 50;
  chaseRange = 1000;
  minDistance = 100;

  // Interval‑IDs, um sie später stoppen zu können
  movementIntervalID;
  animationIntervalID;
  deadIntervalID;
  deadPlayed = false;

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
    this.loadImages(this.IMAGES_ALERT);
    this.loadImages(this.IMAGES_ATTACK);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.animate();
  }

  animate() {
    // 1) Bewegung auf den Spieler zu
    this.movementIntervalID = setInterval(() => {
      if (!this.world || this.isDead()) return;
      let bossCenter = this.x + this.width / 2;
      let charCenter = this.world.character.x + this.world.character.width / 2;
      let distX = charCenter - bossCenter;

      if (Math.abs(distX) < this.chaseRange && Math.abs(distX) > this.minDistance) {
        if (distX > 0) {
          this.otherDirection = true;
          this.moveRight();
        } else {
          this.otherDirection = false;
          this.moveLeft();
        }
      }
    }, 1000 / 60);

    // 2) Animations‑Loop
    this.animationIntervalID = setInterval(() => {
      if (this.isDead()) {
        // Tod erstmals erkennen und Dead‑Sequenz starten
        if (!this.deadPlayed) {
          this.deadPlayed = true;
          clearInterval(this.movementIntervalID);
          clearInterval(this.animationIntervalID);
          this.playDeadSequence();
        }
      } else if (this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
      } else {
        // Normaler Zustand: alert oder attack
        let bossCenter = this.x + this.width / 2;
        let charCenter = this.world.character.x + this.world.character.width / 2;
        let distX = charCenter - bossCenter;
        if (Math.abs(distX) < this.minDistance) {
          this.playAnimation(this.IMAGES_ATTACK);
        } else {
          this.playAnimation(this.IMAGES_ALERT);
        }
      }
    }, 200);
  }

  /**
   * Spielt die Dead‑Animation einmal komplett durch.
   */
  playDeadSequence() {
    let idx = 0;
    this.deadIntervalID = setInterval(() => {
      if (idx < this.IMAGES_DEAD.length) {
        // jeweiliges Dead‑Frame setzen
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
    if (this.energy > 0) {
      this.lastHit = new Date().getTime();
    }
  }

  stop() {
    clearInterval(this.moveInterval);
    clearInterval(this.animInterval);
  }
}