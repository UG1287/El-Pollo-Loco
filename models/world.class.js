class World {
  character = new Character();
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  statusBar = new StatusBar();
  coinStatusBar = new CoinStatusBar();
  throwableObjects = [];
  coinsCollected = 0;
  totalCoins;
  soundManager;
  bottleStatusBar = new BottleStatusBar();
  gameOver = false;
  collisionIntervalID;
  runIntervalID;
  lastThrow = 0;

  constructor(canvas, keyboard, soundManager, level) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.soundManager = soundManager;
    this.totalCoins = level.coins.length;
    this.level = level;
    this.totalBottles = level.bottles.length;

    this.level.enemies.forEach((e) => (e.world = this));
    this.setWorld();
    this.character.setWorld(this);

    this.draw();
    this.run();
    this.startCollisionCheck();
  }

  startCollisionCheck() {
    this.collisionIntervalID = setInterval(() => {
      if (this.gameOver) {
        clearInterval(this.collisionIntervalID);
        return;
      }
      this.checkCollisions();
    }, 25);
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
      if (this.gameOver) {
        clearInterval(this.runIntervalID);
        return;
      }
      console.log('run() läuft');
      this.checkCoinCollection();
      this.checkBottleCollection();
      this.checkBottleCollisions();
    }, 200);
  }

  checkCollisions() {
    if (this.gameOver) return;

    this.level.enemies.forEach((enemy, index) => {
      if (this.character.isColliding(enemy)) {
        const characterBottom = this.character.y + this.character.height;
        const enemyTop = enemy.y;
        const verticalOverlap = characterBottom - enemyTop;

        const isJumpingOnEnemy =
          this.character.speedY < 0 &&
          verticalOverlap > 0 &&
          verticalOverlap < 40;

        if (isJumpingOnEnemy) {
          console.log('✅ Charakter springt auf Gegner!');
          this.character.speedY = 15; // Rückstoß nach oben
          enemy.die();
        } else {
          /* ---------- HIER: Dead‑Animation zuerst abspielen ---------- */
          if (this.character.energy <= 0 && !this.gameOver) {
            /* 1)  Unverwundbarkeits‑Status jetzt egal – Animation darf laufen   */
            this.character.energy = 0; // sicherstellen, dass isDead() true ist

            /* 2)  Nach 1,5 s Game‑Over‑Screen anzeigen und Flag setzen          */
            setTimeout(() => {
              this.gameOver = true; // Flag erst JETZT blockieren
              this.showGameOverScreen();
            }, 1500); // Zeit für Dead‑Frames
          }

          if (!this.character.isHurt() && this.character.energy > 0) {
            this.character.hit();
            console.log('🔥 Charakter getroffen!');
            this.statusBar.setPercentage(this.character.energy);
          } else if (this.character.isHurt()) {
            console.log('🔹 Charakter ist momentan unverwundbar');
          }
        }
      }
    });
  }

  tryThrowBottle() {
    const now = Date.now();

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
      const bottle = this.throwableObjects[i];
  
      for (let j = 0; j < this.level.enemies.length; j++) {
        const enemy = this.level.enemies[j];
  
        if (bottle.isColliding(enemy)) {
  
          /* ------------- Schaden anrichten ------------- */
          if (enemy instanceof Endboss) {
            enemy.takeDamage();                // –20 HP
            if (enemy.isDead() && !this.gameOver) {
              setTimeout(() => this.showVictoryScreen(), 1500);
            }
          } else {
            enemy.die();                       // normales Huhn: sofort tot
          }
          this.soundManager.playSound('bottle_break');
          /* ------------- Flasche ENTGÜLTIG zerstören ------------- */
          this.throwableObjects.splice(i, 1);  // aus Array entfernen
          i--;                                 // Index korrigieren
          break;                               // ► bricht die innere enemies-Schleife ab
        }
      }
    }
  }
  

  setupVictoryKeyListener() {
    let checkVictory = setInterval(() => {
      if (this.keyboard.ENTER) {
        clearInterval(checkVictory);
        window.resetGame();
      }
    }, 100);
  }

  setupGameOverKeyListener() {
    let checkKey = setInterval(() => {
      if (this.keyboard.ENTER) {
        clearInterval(checkKey);
        window.resetGame();
      }
    }, 100);
  }

  showVictoryScreen() {
    this.gameOver = true;
    this.soundManager.stopAllSounds();
    this.soundManager.playSound('victory');
    clearInterval(this.collisionIntervalID);
    clearInterval(this.runIntervalID);

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = 'white';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Victory!',
      this.canvas.width / 2,
      this.canvas.height / 2
    );

    const restartBtn = document.getElementById('restartButton');

    if (isTouchDevice()) {
      if (restartBtn) {
        restartBtn.style.display = 'block';
        restartBtn.onclick = () => window.resetGame();
      }
    } else {
      this.ctx.font = '28px Arial';
      this.ctx.fillText(
        'Want to play again? Press ENTER',
        this.canvas.width / 2,
        this.canvas.height / 2 + 60
      );
      if (restartBtn) restartBtn.style.display = 'none';
    }

    this.setupVictoryKeyListener();
  }

  showGameOverScreen() {
    this.gameOver = true;
    this.soundManager.stopAllSounds();
    this.soundManager.playSound('lose');

    clearInterval(this.collisionIntervalID);
    clearInterval(this.runIntervalID);

    const ohNoImg = new Image();
    ohNoImg.src = 'img/9_intro_outro_screens/game_over/OhNo.png';

    ohNoImg.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      const imgWidth = 400;
      const imgHeight = 300;
      this.ctx.drawImage(ohNoImg, 0, 0, this.canvas.width, this.canvas.height);

      if (!isTouchDevice()) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
          'Try Again? Press ENTER',
          this.canvas.width / 2,
          this.canvas.height / 2 + imgHeight / 2 + 20
        );
      }

      const restartBtn = document.getElementById('restartButton');
      if (isTouchDevice()) {
        if (restartBtn) {
          restartBtn.style.display = 'block';
          restartBtn.onclick = () => window.resetGame();
        }
      } else {
        if (restartBtn) restartBtn.style.display = 'none';
      }
    };

    this.setupGameOverKeyListener();
  }

  checkCoinCollection() {
    if (!this.level || !this.level.coins) {
      console.warn('Coin collection ist undefined.');
      return;
    }
    this.level.coins.forEach((coin, index) => {
      if (this.character.isColliding(coin)) {
        console.log('Coin eingesammelt!');
        this.level.coins.splice(index, 1);
        this.coinsCollected++;
        this.soundManager.playSound('coin');
        this.coinStatusBar.setCoins(this.coinsCollected, this.totalCoins);
      }
    });
  }

  checkBottleCollection() {
    if (!this.level.bottles) return;
    this.level.bottles.forEach((bottle, index) => {
      if (this.character.isColliding(bottle)) {
        bottle.stop();
        this.level.bottles.splice(index, 1);
        this.character.collectBottle();
        this.bottleStatusBar.setBottles(
          this.character.bottleCount,
          this.totalBottles
        );
        if (this.soundManager) {
          this.soundManager.playSound('bottle_pickup');
        }
      }
    });
  }

  draw() {
    if (this.gameOver) {
      return;
    }
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

    requestAnimationFrame(() => {
      this.draw();
    });
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => {
      this.addToMap(o);
    });
  }

  addToMap(mo) {
    if (mo.otherDirection) {
      this.flipImage(mo);
    }
    mo.draw(this.ctx);
    mo.drawFrame(this.ctx);
    if (mo.otherDirection) {
      this.flipImageBack(mo);
    }
  }

  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  flipImageBack(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  }
}
