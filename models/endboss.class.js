class Endboss extends MovableObject {
  y = 0;
  height = 450;
  width = 300;
  speed = 1.9;
  energy = 100;
  chaseRange = 1000;
  minDistance = 100;
  movementIntervalID;
  animationIntervalID;
  deadIntervalID;
  deadPlayed = false;
  currentAnimationImages = [];
  alertTimePassed = false;
  lastHitTime = 0;

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

  /**
   * Creates a new Endboss instance at a specific horizontal position,
   * loads all animation images, and starts movement and animation.
   * @param {number} xPos - The initial x-position of the Endboss.
   */
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

  /**
   * Starts the Endboss's movement logic based on distance to the character.
   * @returns {void}
   */
  startMovement() {
    this.alertStarted = false;
    this.alertFinished = false;

    this.movementIntervalID = setInterval(() => {
      if (!this.world || this.isDead()) return;

      const distX = this.getDistanceToCharacter();
      const bossIsVisible = this.isBossVisible();

      if (bossIsVisible) this.world.lockCamera = true;

      this.handleBossBehavior(distX, bossIsVisible);
    }, 1000 / 60);
  }

  /**
   * Calculates the horizontal distance between Endboss and character center.
   * Used for AI movement logic.
   * @returns {number} The horizontal distance (positive = character is right).
   */
  getDistanceToCharacter() {
    const bossCenter = this.x + this.width / 2;
    const charCenter = this.world.character.x + this.world.character.width / 2;
    return charCenter - bossCenter;
  }

  /**
   * Checks whether the Endboss is currently visible in the camera viewport.
   * @returns {boolean} True if boss is visible on screen.
   */
  isBossVisible() {
    return (
      this.x + this.width > -this.world.camera_x &&
      this.x < -this.world.camera_x + this.world.canvas.width
    );
  }

  /**
   * Handles movement behavior such as chasing and jumping.
   * Called each frame if Endboss is visible.
   * @param {number} distX - Horizontal distance to character.
   * @param {boolean} bossIsVisible - Whether the boss is in the viewport.
   * @returns {void}
   */
  handleBossBehavior(distX, bossIsVisible) {
    if (Math.abs(distX) >= this.chaseRange || !bossIsVisible) return;

    this.startAlertIfNeeded();

    if (this.alertFinished && Math.abs(distX) > this.minDistance) {
      this.moveTowardCharacter(distX);
    }

    if (Math.random() < 0.01 && !this.isAboveGround()) {
      this.speedY = 25;
    }
  }

  /**
   * Triggers the alert animation once, then transitions into movement readiness.
   * @returns {void}
   */
  startAlertIfNeeded() {
    if (this.alertStarted) return;

    this.alertStarted = true;
    this.currentAnimationImages = this.IMAGES_ALERT;
    this.currentImage = 0;

    setTimeout(() => {
      this.alertFinished = true;
    }, 1500);
  }

  /**
   * Moves the Endboss toward the character based on relative position.
   * @param {number} distX - Horizontal distance to character.
   * @returns {void}
   */
  moveTowardCharacter(distX) {
    if (distX > 0) {
      this.otherDirection = true;
      this.moveRight();
    } else {
      this.otherDirection = false;
      this.moveLeft();
    }
  }

  /**
   * Starts the Endboss's animation loop depending on state and distance to the character.
   * @returns {void}
   */
  startAnimation() {
    this.animationIntervalID = setInterval(() => {
      if (this.handleDeath()) return;

      const newAnimation = this.determineAnimation();
      if (this.currentAnimationImages !== newAnimation && !this.isHurt()) {
        this.currentAnimationImages = newAnimation;
        this.currentImage = 0;
      }

      this.playAnimation(this.currentAnimationImages);
    }, 120);
  }

  /**
   * Internal logic for death animation and cleanup.
   * @returns {boolean} True if death handling occurred.
   */
  handleDeath() {
    if (!this.isDead()) return false;

    if (!this.deadPlayed) {
      this.deadPlayed = true;
      clearInterval(this.movementIntervalID);
      clearInterval(this.animationIntervalID);
      this.playDeadSequence();
    }
    return true;
  }

  /**
   * Determines the correct animation based on distance and boss state.
   * @returns {string[]} The current image set to be animated.
   */
  determineAnimation() {
    if (this.isHurt()) return this.IMAGES_HURT;
    if (!this.alertTimePassed) return this.IMAGES_ALERT;

    const distX = this.getDistanceToCharacter();
    if (Math.abs(distX) < this.minDistance) return this.IMAGES_ATTACK;
    if (Math.abs(distX) < this.chaseRange) return this.IMAGES_WALK;
    return this.IMAGES_ALERT;
  }

  getDistanceToCharacter() {
    const bossCenter = this.x + this.width / 2;
    const charCenter = this.world.character.x + this.world.character.width / 2;
    return charCenter - bossCenter;
  }

  /**
   * Plays the Endboss's death animation sequence frame by frame.
   * @returns {void}
   */
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

  /**
   * Calculates the distance between the Endboss and the character.
   * @returns {number} The absolute horizontal distance.
   */
  distanceToCharacter() {
    if (!this.world || !this.world.character) return Infinity;
    return Math.abs(this.x - this.world.character.x);
  }

  /**
   * Reduces the Endboss's energy and records the last hit time if still alive.
   * @returns {void}
   */
  takeDamage() {
    const now = Date.now();
    if (now - this.lastHitTime < 1000) return; // 1 Sekunde Unverwundbarkeit
    this.lastHitTime = now;
    this.lastHit = now; // <- wichtig für isHurt()

    this.energy -= 20;
    if (this.energy < 0) this.energy = 0;

    this.currentAnimationImages = this.IMAGES_HURT;
    this.currentImage = 0;
  }

  /**
   * Sets the world context for the Endboss.
   * @param {World} world - The current game world instance.
   * @returns {void}
   */
  setWorld(world) {
    this.world = world;
  }

  /**
   * Stops all running movement and animation intervals.
   * @returns {void}
   */
  stop() {
    clearInterval(this.movementIntervalID);
    clearInterval(this.animationIntervalID);
    clearInterval(this.deadIntervalID);
  }
}
