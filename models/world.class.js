/**
 * Represents the game world, managing the main character, enemies, collectibles, sounds, and game state.
 */
class World {
  character = new Character();
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  throwableObjects = [];
  coinsCollected = 0;
  totalCoins;
  totalBottles;
  soundManager;
  gameOver = false;
  runIntervalID;
  lastThrow = 0;
  isStopped = false;

  /**
   * Creates a new World instance.
   * @param {HTMLCanvasElement} canvas - The game's canvas element.
   * @param {Object} keyboard - The keyboard input handler.
   * @param {SoundManager} soundManager - The sound manager instance.
   * @param {Object} level - The level data including enemies, clouds, coins, and bottles.
   */
  constructor(canvas, keyboard, soundManager, level) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.soundManager = soundManager;
    this.level = level;
    this.totalCoins = level.coins.length;
    this.totalBottles = level.bottles.length;
    this.level.enemies.forEach((e) => (e.world = this));
    this.setWorld();
    this.character.setWorld(this);
    this.draw();
    this.run();
    this.statusBar = new StatusBarGeneric('health', 20, 0, 100);
    this.coinStatusBar = new StatusBarGeneric('coin', 220, 0);
    this.bottleStatusBar = new StatusBarGeneric('bottle', 400, 0);
  }

  /**
   * Sets the world reference for the character and all enemies.
   * @returns {void}
   */
  setWorld() {
    this.character.world = this;
    this.level.enemies.forEach((e) => {
      e.world = this;
      if (typeof e.setWorld === 'function') e.setWorld(this);
    });
  }

  /**
   * Starts the main game loop for checking collectibles and collisions.
   * @returns {void}
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
      this.checkBottleCollisions();
    }, 60);
  }

  /**
   * Checks for collisions between the character and enemies.
   * @returns {void}
   */
  checkCollisions() {
    if (this.gameOver) return;

    this.level.enemies.forEach((enemy) => {
      if (this.shouldSkipCollision(enemy)) return;

      if (this.isStomp(enemy)) {
        this.handleStomp(enemy);
      } else {
        this.handleEnemyHit(enemy);
      }
    });
  }

  shouldSkipCollision(enemy) {
    return enemy.energy === 0 || !this.character.isColliding(enemy);
  }

  isStomp(enemy) {
    const charBottom = this.character.y + this.character.height;
    const enemyTop = enemy.y;
    const overlap = charBottom - enemyTop;
    return this.character.speedY < 0 && overlap > 0 && overlap < 40;
  }

  handleStomp(enemy) {
    this.character.speedY = 15;
    enemy.energy = 0;
    enemy.die();
  }

  handleEnemyHit(enemy) {
    if (this.character.isHurt()) return;

    this.character.energy -= enemy instanceof Endboss ? 20 : 5;
    this.character.hit();
    this.statusBar.setPercentage(this.character.energy);

    if (this.character.energy === 0 && !this.gameOver) {
      setTimeout(() => {
        this.gameOver = true;
        this.showGameOverScreen();
      }, 1500);
    }
  }

  /**
   * Attempts to throw a bottle if allowed by timing and bottle count.
   * @returns {void}
   */
  tryThrowBottle() {
    if (!this.canThrowBottle()) return;

    const bottle = this.createBottle();
    this.throwableObjects.push(bottle);
    this.character.useBottle();
    this.updateBottleStatusBar();
    this.soundManager.playSound('throw');
    this.lastThrow = Date.now();
  }

  canThrowBottle() {
    return Date.now() - this.lastThrow >= 150 && this.character.hasBottles();
  }

  createBottle() {
    const dir = this.character.otherDirection ? -1 : 1;
    return new ThrowableObject(
      this.character.x + 50 * dir,
      this.character.y + 100,
      dir
    );
  }

  updateBottleStatusBar() {
    this.bottleStatusBar.setValue(
      this.character.bottleCount,
      this.totalBottles
    );
  }

  /**
   * Checks for collisions between thrown bottles and enemies.
   * @returns {void}
   */
  checkBottleCollisions() {
    for (let i = 0; i < this.throwableObjects.length; i++) {
      let bottle = this.throwableObjects[i];

      if (this.processBottleCollision(bottle)) {
        this.throwableObjects.splice(i, 1);
        i--;
      }
    }
  }

  processBottleCollision(bottle) {
    for (let enemy of this.level.enemies) {
      if (!bottle.isColliding(enemy)) continue;

      this.resolveBottleHit(enemy);
      this.soundManager.playSound('bottle_break');
      return true;
    }
    return false;
  }

  resolveBottleHit(enemy) {
    if (enemy instanceof Endboss) {
      enemy.takeDamage();
      if (enemy.isDead() && !this.gameOver) {
        setTimeout(() => this.showVictoryScreen(), 1500);
      }
    } else {
      enemy.die();
    }
  }

  /**
   * Sets up the key listener for restarting after victory.
   * @returns {void}
   */
  setupVictoryKeyListener() {
    let t = setInterval(() => {
      if (this.keyboard.ENTER) {
        clearInterval(t);
        window.resetGame();
      }
    }, 100);
  }

  /**
   * Sets up the key listener for restarting after game over.
   * @returns {void}
   */
  setupGameOverKeyListener() {
    let t = setInterval(() => {
      if (this.keyboard.ENTER) {
        clearInterval(t);
        window.resetGame();
      }
    }, 100);
  }

  /**
   * Displays the victory screen and stops the game.
   * @returns {void}
   */
  showVictoryScreen() {
    this.prepareVictoryState();
    this.drawVictoryScreen();
    this.handleVictoryControls();
    this.setupVictoryKeyListener();
  }

  prepareVictoryState() {
    this.gameOver = true;
    this.soundManager.stopAllSounds();
    this.soundManager.playSound('victory');
    clearInterval(this.runIntervalID);
  }

  drawVictoryScreen() {
    this.ctx.fillStyle = 'rgba(0,0,0,.6)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = 'white';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Victory!',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  handleVictoryControls() {
    const btn = document.getElementById('restartButton');

    if (isTouchDevice()) {
      this.handleTouchVictory(btn);
    } else {
      this.handleDesktopVictory(btn);
    }
  }

  handleTouchVictory(btn) {
    if (!btn) return;
    btn.style.display = 'block';
    btn.onclick = () => window.resetGame();
  }

  handleDesktopVictory(btn) {
    this.ctx.font = '28px Arial';
    this.ctx.fillText(
      'Press ENTER to restart',
      this.canvas.width / 2,
      this.canvas.height / 2 + 60
    );
    if (btn) btn.style.display = 'none';
  }

  /**
   * Displays the game over screen and stops the game.
   * @returns {Promise<void>}
   */
  async showGameOverScreen() {
    this.prepareGameOverState();
    this.loadGameOverImage();
    this.setupGameOverKeyListener();
  }

  /**
   * Prepares the game over state by stopping the loop and playing the lose sound.
   * @returns {void}
   */
  prepareGameOverState() {
    this.gameOver = true;
    this.soundManager.gameOver = true;
    clearInterval(this.runIntervalID);
    this.soundManager.stopBackgroundMusic();

    setTimeout(() => {
      this.soundManager.playSound('lose');
    }, 200);
  }

  /**
   * Loads the game over image and draws it on the canvas once loaded.
   * @returns {void}
   */
  loadGameOverImage() {
    const img = new Image();
    img.src = 'img/9_intro_outro_screens/game_over/OhNo.png';
    img.onload = () => this.drawGameOverScreen(img);
  }

  /**
   * Draws the game over screen and overlay, and shows retry options.
   * @param {HTMLImageElement} img - The game over image to draw.
   * @returns {void}
   */
  drawGameOverScreen(img) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'rgba(0,0,0,.6)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);

    this.drawRetryHint();
    this.toggleRestartButton();
  }

  /**
   * Draws the retry hint text for desktop users.
   * @returns {void}
   */
  drawRetryHint() {
    if (!isTouchDevice()) {
      this.ctx.fillStyle = 'white';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        'Press ENTER to retry',
        this.canvas.width / 2,
        this.canvas.height / 2 + 100
      );
    }
  }

  /**
   * Toggles the restart button visibility and behavior depending on device type.
   * @returns {void}
   */
  toggleRestartButton() {
    const btn = document.getElementById('restartButton');
    if (!btn) return;

    if (isTouchDevice()) {
      btn.style.display = 'block';
      btn.onclick = () => window.resetGame();
    } else {
      btn.style.display = 'none';
    }
  }

  /**
   * Checks if the character collects any coins.
   * @returns {void}
   */
  checkCoinCollection() {
    if (!this.level || !this.level.coins) return;
    this.level.coins.forEach((coin, i) => {
      if (!this.isCollectableColliding(this.character, coin)) return;
      this.level.coins.splice(i, 1);
      this.coinsCollected++;
      this.soundManager.playSound('coin');
      this.coinStatusBar.setValue(this.coinsCollected, this.totalCoins);
    });
  }

  /**
   * Checks collision between a character and a collectible item.
   * @param {Character} character - The character object.
   * @param {MovableObject} item - The collectible item.
   * @param {number} [buffer=10] - Optional buffer around the collision box.
   * @returns {boolean} True if collision is detected, false otherwise.
   */
  isCollectableColliding(character, item) {
    return character.isColliding(item);
  }

  /**
   * Checks if the character collects any bottles.
   * @returns {void}
   */
  checkBottleCollection() {
    if (!this.level.bottles) return;
    this.level.bottles.forEach((bottle, i) => {
      if (!this.isCollectableColliding(this.character, bottle)) return;
      bottle.stop();
      this.level.bottles.splice(i, 1);
      this.character.collectBottle();
      this.bottleStatusBar.setValue(
        this.character.bottleCount,
        this.totalBottles
      );
    });
  }

  /**
   * Draws all objects in the world onto the canvas.
   * @returns {void}
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
    this.checkCollisions();
    this.restrictCharacterInBossArea();
    requestAnimationFrame(() => this.draw());
    this.cleanupOffscreenBottles();
  }

  /**
   * Updates the horizontal camera offset based on character position or boss area.
   * @returns {void}
   */
  updateCameraPosition() {
    if (this.lockCamera) {
      const bossAreaCenter = 2500;
      this.camera_x = -bossAreaCenter + this.canvas.width / 2;
    } else {
      this.camera_x = -this.character.x + 100;
    }
  }

  /**
   * Draws all dynamic game elements inside the camera view.
   * @returns {void}
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
   * Draws the fixed-position HUD elements (e.g., status bars).
   * @returns {void}
   */
  drawHUD() {
    this.addToMap(this.statusBar);
    this.addToMap(this.coinStatusBar);
    this.addToMap(this.bottleStatusBar);
  }

  /**
   * Restricts character movement within boss fight area bounds.
   * @returns {void}
   */
  restrictCharacterInBossArea() {
    if (!this.lockCamera) return;
    const leftLimit = 2150;
    const rightLimit = 2850;
    if (this.character.x < leftLimit) this.character.x = leftLimit;
    if (this.character.x > rightLimit) this.character.x = rightLimit;
  }

  /**
   * Removes bottles that have fallen off-screen.
   * @returns {void}
   */
  cleanupOffscreenBottles() {
    this.throwableObjects = this.throwableObjects.filter(
      (obj) => obj.y <= this.canvas.height
    );
  }

  /**
   * Draws the boss walls at the left and right boundaries of the arena.
   * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
   * @returns {void}
   */
  drawBossWalls(ctx) {
    ctx.fillStyle = 'rgba(60, 60, 60, 0.7)';
    ctx.fillRect(4000, 0, 20, this.canvas.height);
    ctx.fillRect(5300, 0, 20, this.canvas.height);
    this.drawBossSpikes(ctx, 4000);
    this.drawBossSpikes(ctx, 5300);
  }

  /**
   * Draws spikes above a vertical wall section, used for boss fight barriers.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   * @param {number} xStart - The starting x-position of the spike row.
   * @returns {void}
   */
  drawBossSpikes(ctx, xStart) {
    const spikeCount = 10;
    for (let i = 0; i < spikeCount; i++) {
      ctx.beginPath();
      ctx.moveTo(xStart + i * 2, 0);
      ctx.lineTo(xStart + i * 2 + 1, 10);
      ctx.strokeStyle = 'silver';
      ctx.stroke();
    }
  }

  /**
   * Adds an array of objects to the map.
   * @param {MovableObject[]} arr - Array of movable objects.
   * @returns {void}
   */
  addObjectsToMap(arr) {
    arr.forEach((o) => this.addToMap(o));
  }

  /**
   * Stops all game intervals and animations.
   * @returns {void}
   */
  stopAll() {
    clearInterval(this.runIntervalID);
    this.isStopped = true;
    if (this.level && this.level.enemies) {
      this.level.enemies.forEach((enemy) => {
        if (enemy.stop) enemy.stop();
      });
    }
  }

  /**
   * Adds a single object to the map and handles direction flipping if applicable.
   * @param {DrawableObject} obj - The object to add (e.g., character, enemy, status bar).
   * @returns {void}
   */
  addToMap(obj) {
    if (!obj || typeof obj.draw !== 'function') return;
    const flip = obj.otherDirection;
    if (flip) this.flipImage(obj);
    obj.draw(this.ctx);
    if (flip) this.flipImageBack(obj);
  }

  /**
   * Flips the object's image horizontally.
   * @param {MovableObject} obj - The object to flip.
   * @returns {void}
   */
  flipImage(obj) {
    this.ctx.save();
    this.ctx.translate(obj.width, 0);
    this.ctx.scale(-1, 1);
    obj.x *= -1;
  }

  /**
   * Flips the object's image back to its original direction.
   * @param {MovableObject} obj - The object to flip back.
   * @returns {void}
   */
  flipImageBack(obj) {
    obj.x *= -1;
    this.ctx.restore();
  }
}
