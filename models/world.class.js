/**
 * Represents the game world, managing the main character, enemies, collectibles, sounds, and game state.
 */
class World {
  character = new Character();
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  statusBar = new StatusBar();
  coinStatusBar = new CoinStatusBar();
  bottleStatusBar = new BottleStatusBar();
  throwableObjects = [];
  coinsCollected = 0;
  totalCoins;
  totalBottles;
  soundManager;
  gameOver = false;
  runIntervalID;
  lastThrow = 0;

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
      if (!this.lockCamera && this.character.x >= 4000) {
        this.lockCamera = true;
        this.character.x = 4100;
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
      if (enemy.energy === 0) return;
      if (!this.character.isColliding(enemy)) return;

      let charBottom = this.character.y + this.character.height;
      let enemyTop = enemy.y;
      let overlap = charBottom - enemyTop;
      let stomp = this.character.speedY < 0 && overlap > 0 && overlap < 40;

      if (stomp) {
        this.character.speedY = 15;
        enemy.energy = 0;
        enemy.die();
        return;
      }

      if (!this.character.isHurt()) {
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
    });
  }

  /**
   * Attempts to throw a bottle if allowed by timing and bottle count.
   * @returns {void}
   */
  tryThrowBottle() {
    let now = Date.now();
    if (now - this.lastThrow < 150) return;
    if (!this.character.hasBottles()) return;

    let dir = this.character.otherDirection ? -1 : 1;
    let bottle = new ThrowableObject(
      this.character.x + 50 * dir,
      this.character.y + 100,
      dir
    );
    this.throwableObjects.push(bottle);
    this.character.useBottle();
    this.bottleStatusBar.setBottles(this.character.bottleCount, this.totalBottles);
    this.soundManager.playSound('throw');
    this.lastThrow = now;
  }

  /**
   * Checks for collisions between thrown bottles and enemies.
   * @returns {void}
   */
  checkBottleCollisions() {
    for (let i = 0; i < this.throwableObjects.length; i++) {
      let bottle = this.throwableObjects[i];

      for (let j = 0; j < this.level.enemies.length; j++) {
        let enemy = this.level.enemies[j];
        if (!bottle.isColliding(enemy)) continue;

        if (enemy instanceof Endboss) {
          enemy.takeDamage();
          if (enemy.isDead() && !this.gameOver) {
            setTimeout(() => this.showVictoryScreen(), 1500);
          }
        } else {
          enemy.die();
        }

        this.soundManager.playSound('bottle_break');
        this.throwableObjects.splice(i, 1);
        i--;
        break;
      }
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
    this.gameOver = true;
    this.soundManager.stopAllSounds();
    this.soundManager.playSound('victory');
    clearInterval(this.runIntervalID);

    this.ctx.fillStyle = 'rgba(0,0,0,.6)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = 'white';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Victory!', this.canvas.width / 2, this.canvas.height / 2);

    let btn = document.getElementById('restartButton');
    if (isTouchDevice()) {
      if (btn) {
        btn.style.display = 'block';
        btn.onclick = () => window.resetGame();
      }
    } else {
      this.ctx.font = '28px Arial';
      this.ctx.fillText('Press ENTER to restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
      if (btn) btn.style.display = 'none';
    }
    this.setupVictoryKeyListener();
  }

  /**
   * Displays the game over screen and stops the game.
   * @returns {Promise<void>}
   */
  async showGameOverScreen() {
    this.gameOver = true;
    this.soundManager.gameOver = true;
    clearInterval(this.runIntervalID);

    this.soundManager.stopBackgroundMusic();

    setTimeout(() => {
      this.soundManager.playSound('lose');
    }, 200);

    let img = new Image();
    img.src = 'img/9_intro_outro_screens/game_over/OhNo.png';
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'rgba(0,0,0,.6)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);

      if (!isTouchDevice()) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Press ENTER to retry', this.canvas.width / 2, this.canvas.height / 2 + 100);
      }

      let btn = document.getElementById('restartButton');
      if (isTouchDevice()) {
        if (btn) {
          btn.style.display = 'block';
          btn.onclick = () => window.resetGame();
        }
      } else if (btn) btn.style.display = 'none';
    };

    this.setupGameOverKeyListener();
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
      this.coinStatusBar.setCoins(this.coinsCollected, this.totalCoins);
    });
  }

  /**
   * Checks collision between a character and a collectible item.
   * @param {Character} character - The character object.
   * @param {MovableObject} item - The collectible item.
   * @param {number} [buffer=10] - Optional buffer around the collision box.
   * @returns {boolean} True if collision is detected, false otherwise.
   */
  isCollectableColliding(character, item, buffer = 10) {
    return (
      character.x + buffer < item.x + item.width - buffer &&
      character.x + character.width - buffer > item.x + buffer &&
      character.y + buffer < item.y + item.height - buffer &&
      character.y + character.height - buffer > item.y + buffer
    );
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
      this.bottleStatusBar.setBottles(this.character.bottleCount, this.totalBottles);
    });
  }

  /**
   * Draws all objects in the world onto the canvas.
   * @returns {void}
   */
  draw() {
    if (this.gameOver) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.lockCamera) {
      this.camera_x = -4000 +100; // Kamera bleibt auf Bossfight-Areal fokussiert
    } else {
      this.camera_x = -this.character.x + 100;
    }
    console.log('camera_x:', this.camera_x, 'charX:', this.character.x);

    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    if (this.lockCamera) {
      this.drawBossWalls(this.ctx);
    }

    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.statusBar);
    this.addToMap(this.coinStatusBar);
    this.addToMap(this.bottleStatusBar);
    this.ctx.translate(this.camera_x, 0);

    

    this.addToMap(this.character);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.bottles);

    this.ctx.translate(-this.camera_x, 0);
    this.checkCollisions();

    requestAnimationFrame(() => this.draw());
  }

  drawBossWalls(ctx) {
    // Linke Wand bei x = 4000
    ctx.fillStyle = 'rgba(60, 60, 60, 0.7)';
    ctx.fillRect(4000, 0, 20, this.canvas.height);
  
    // Rechte Wand bei x = 5300
    ctx.fillStyle = 'rgba(60, 60, 60, 0.7)';
    ctx.fillRect(5300, 0, 20, this.canvas.height);
  
    // Optional: Stacheldraht oben auf beiden Seiten
    const spikeCount = 10;
    for (let i = 0; i < spikeCount; i++) {
      ctx.beginPath();
      ctx.moveTo(4000 + i * 2, 0);
      ctx.lineTo(4000 + i * 2 + 1, 10);
      ctx.strokeStyle = 'silver';
      ctx.stroke();
  
      ctx.beginPath();
      ctx.moveTo(5300 + i * 2, 0);
      ctx.lineTo(5300 + i * 2 + 1, 10);
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
   * Adds a single object to the map and handles direction flipping.
   * @param {MovableObject} obj - The object to add.
   * @returns {void}
   */
  addToMap(obj) {
    if (obj.otherDirection) this.flipImage(obj);
    obj.draw(this.ctx);
    obj.drawFrame(this.ctx);
    if (obj.otherDirection) this.flipImageBack(obj);
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
