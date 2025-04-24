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

  setWorld() {
    this.character.world = this;
    this.level.enemies.forEach((e) => {
      e.world = this;
      if (typeof e.setWorld === 'function') e.setWorld(this);
    });
  }

  run() {
    this.runIntervalID = setInterval(() => {
      if (this.gameOver) return;
      this.checkCoinCollection();
      this.checkBottleCollection();
      this.checkBottleCollisions();
    }, 200);
  }

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
    this.bottleStatusBar.setBottles(
      this.character.bottleCount,
      this.totalBottles
    );
    this.soundManager.playSound('throw');
    this.lastThrow = now;
  }

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

  setupVictoryKeyListener() {
    let t = setInterval(() => {
      if (this.keyboard.ENTER) {
        clearInterval(t);
        window.resetGame();
      }
    }, 100);
  }

  setupGameOverKeyListener() {
    let t = setInterval(() => {
      if (this.keyboard.ENTER) {
        clearInterval(t);
        window.resetGame();
      }
    }, 100);
  }

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
    this.ctx.fillText(
      'Victory!',
      this.canvas.width / 2,
      this.canvas.height / 2
    );

    let btn = document.getElementById('restartButton');
    if (isTouchDevice()) {
      if (btn) {
        btn.style.display = 'block';
        btn.onclick = () => window.resetGame();
      }
    } else {
      this.ctx.font = '28px Arial';
      this.ctx.fillText(
        'Press ENTER to restart',
        this.canvas.width / 2,
        this.canvas.height / 2 + 60
      );
      if (btn) btn.style.display = 'none';
    }
    this.setupVictoryKeyListener();
  }

  showGameOverScreen() {
    this.gameOver = true;
    this.soundManager.stopAllSounds();
    this.soundManager.playSound('lose');
    clearInterval(this.runIntervalID);

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
        this.ctx.fillText(
          'Press ENTER to retry',
          this.canvas.width / 2,
          this.canvas.height / 2 + img.height / 2 + 20
        );
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

  checkCoinCollection() {
    if (!this.level || !this.level.coins) return;
    this.level.coins.forEach((coin, i) => {
      if (!this.character.isColliding(coin)) return;
      this.level.coins.splice(i, 1);
      this.coinsCollected++;
      this.soundManager.playSound('coin');
      this.coinStatusBar.setCoins(this.coinsCollected, this.totalCoins);
    });
  }

  checkBottleCollection() {
    if (!this.level.bottles) return;
    this.level.bottles.forEach((bottle, i) => {
      if (!this.character.isColliding(bottle)) return;
      bottle.stop();
      this.level.bottles.splice(i, 1);
      this.character.collectBottle();
      this.bottleStatusBar.setBottles(
        this.character.bottleCount,
        this.totalBottles
      );
      this.soundManager.playSound('bottle_pickup');
    });
  }

  draw() {
    if (this.gameOver) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);

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

  addObjectsToMap(arr) {
    arr.forEach((o) => this.addToMap(o));
  }

  addToMap(obj) {
    if (obj.otherDirection) this.flipImage(obj);
    obj.draw(this.ctx);
    obj.drawFrame(this.ctx);
    if (obj.otherDirection) this.flipImageBack(obj);
  }

  flipImage(obj) {
    this.ctx.save();
    this.ctx.translate(obj.width, 0);
    this.ctx.scale(-1, 1);
    obj.x *= -1;
  }

  flipImageBack(obj) {
    obj.x *= -1;
    this.ctx.restore();
  }
}
