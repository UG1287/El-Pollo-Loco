/**
 * Represents the main game world, including the character, level, enemies,
 * collectible items, status bars, collision and screen managers.
 */
class World {
  /**
   * Initializes the world and starts rendering and logic updates.
   * @param {HTMLCanvasElement} canvas - The game canvas.
   * @param {Keyboard} keyboard - Keyboard input handler.
   * @param {SoundManager} soundManager - Sound manager instance.
   * @param {Level} level - The level configuration and content.
   */
  constructor(canvas, keyboard, soundManager, level) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.keyboard = keyboard;
    this.soundManager = soundManager;
    this.level = level;
    this.character = new Character();
    level.enemies.forEach((e) => (e.world = this));
    this.character.setWorld(this);
    this.throwableObjects = [];
    this.coinsCollected = 0;
    this.totalCoins = level.coins.length;
    this.totalBottles = level.bottles.length;
    this.camera_x = 0;
    this.gameOver = false;
    this.lockCamera = false;
    this.isStopped = false;
    this.collisionManager = new CollisionManager(this);
    this.bottleManager = new BottleManager(this);
    this.screenManager = new ScreenManager(this, keyboard);
    this.statusBar = new StatusBarGeneric('health', 20, 0, 100);
    this.coinStatusBar = new StatusBarGeneric('coin', 220, 0);
    this.bottleStatusBar = new StatusBarGeneric('bottle', 400, 0);

    this.draw();
    this.run();
  }

  /**
   * Starts the game logic loop (coin/bottle collection, collisions).
   */
  run() {
    this.runIntervalID = setInterval(() => {
      if (this.gameOver) return;
      if (!this.lockCamera && this.character.x >= 2400) {
        this.lockCamera = true;
        this.character.x = 2400;
      }
      this.checkCoinCollection();
      this.checkBottleCollection();
      this.bottleManager.checkBottleCollisions();
    }, 60);
  }

  /**
   * Continuously draws the game frame and updates camera and collisions.
   */
  draw() {
    if (this.gameOver || this.isStopped) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.updateCameraPosition();
    this.ctx.save();
    this.ctx.translate(this.camera_x, 0);
    this.drawMapContent();
    this.ctx.restore();
    this.drawHUD();
    this.collisionManager.checkCollisions();
    this.restrictCharacterInBossArea();
    requestAnimationFrame(() => this.draw());
    this.cleanupOffscreenBottles();
  }

  /**
   * Updates the camera position depending on character location or lock.
   */
  updateCameraPosition() {
    if (this.lockCamera) {
      const center = 2500;
      this.camera_x = -center + this.canvas.width / 2;
    } else {
      this.camera_x = -this.character.x + 100;
    }
  }

  /**
   * Draws background, enemies, player, collectibles, and other world objects.
   */
  drawMapContent() {
    this.addObjectsToMap(this.level.backgroundObjects);
    if (this.lockCamera) this.drawBossWalls(this.ctx);
    this.addToMap(this.character);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.bottles);
  }

  /**
   * Draws HUD elements like health, coin and bottle status bars.
   */
  drawHUD() {
    this.addToMap(this.statusBar);
    this.addToMap(this.coinStatusBar);
    this.addToMap(this.bottleStatusBar);
  }

  /**
   * Triggers bottle throwing attempt via BottleManager.
   */
  tryThrowBottle() {
    this.bottleManager.tryThrowBottle();
  }

  /**
   * Displays the victory screen.
   */
  showVictoryScreen() {
    this.screenManager.showVictoryScreen();
  }

  /**
   * Displays the game over screen.
   */
  showGameOverScreen() {
    this.screenManager.showGameOverScreen();
  }

  /**
   * Handles logic for collecting coins.
   */
  checkCoinCollection() {
    this.level.coins.forEach((c, i) => {
      if (!this.character.isColliding(c)) return;
      this.level.coins.splice(i, 1);
      this.coinsCollected++;
      this.soundManager.playSound('coin');
      this.coinStatusBar.setValue(this.coinsCollected, this.totalCoins);
    });
  }

  /**
   * Handles logic for collecting bottles.
   */
  checkBottleCollection() {
    this.level.bottles.forEach((b, i) => {
      if (!this.character.isColliding(b)) return;
      b.stop();
      this.level.bottles.splice(i, 1);
      this.character.collectBottle();
      this.bottleStatusBar.setValue(
        this.character.bottleCount,
        this.totalBottles
      );
    });
  }

  /**
   * Prevents the character from leaving the boss fight area once locked.
   */
  restrictCharacterInBossArea() {
    if (!this.lockCamera) return;
    const L = 2150,
      R = 2850;
    if (this.character.x < L) this.character.x = L;
    if (this.character.x > R) this.character.x = R;
  }

  /**
   * Removes bottles that are no longer visible on screen.
   */
  cleanupOffscreenBottles() {
    this.throwableObjects = this.throwableObjects.filter(
      (o) => o.y <= this.canvas.height
    );
  }

  /**
   * Draws visual wall barriers for the boss area.
   * @param {CanvasRenderingContext2D} ctx - The rendering context.
   */
  drawBossWalls(ctx) {
    ctx.fillStyle = 'rgba(60, 60, 60, 0.7)';
    ctx.fillRect(4000, 0, 20, this.canvas.height);
    ctx.fillRect(5300, 0, 20, this.canvas.height);
    this.drawBossSpikes(ctx, 4000);
    this.drawBossSpikes(ctx, 5300);
  }

  /**
   * Draws spike decorations at specified X position.
   * @param {CanvasRenderingContext2D} ctx - The rendering context.
   * @param {number} xStart - X position where spikes start.
   */
  drawBossSpikes(ctx, xStart) {
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(xStart + i * 2, 0);
      ctx.lineTo(xStart + i * 2 + 1, 10);
      ctx.strokeStyle = 'silver';
      ctx.stroke();
    }
  }

  /**
   * Adds a list of drawable objects to the map.
   * @param {Array<Object>} arr - Array of drawable objects.
   */
  addObjectsToMap(arr) {
    arr.forEach((o) => this.addToMap(o));
  }

  /**
   * Adds a single drawable object to the canvas.
   * Applies image flipping if necessary.
   * @param {Object} obj - Drawable object with draw method.
   */
  addToMap(obj) {
    if (!obj || typeof obj.draw !== 'function') return;
    if (obj.otherDirection) this.flipImage(obj);
    obj.draw(this.ctx);
    if (obj.otherDirection) this.flipImageBack(obj);
  }

  /**
   * Flips image horizontally for mirrored rendering.
   * @param {Object} obj - Object to flip.
   */
  flipImage(obj) {
    this.ctx.save();
    this.ctx.translate(obj.width, 0);
    this.ctx.scale(-1, 1);
    obj.x *= -1;
  }

  /**
   * Restores flipped image to original orientation.
   * @param {Object} obj - Object to restore.
   */
  flipImageBack(obj) {
    obj.x *= -1;
    this.ctx.restore();
  }

  /**
   * Stops all running intervals and enemy animations.
   */
  stopAll() {
    clearInterval(this.runIntervalID);
    this.isStopped = true;
    this.level.enemies.forEach((e) => e.stop && e.stop());
  }
}
