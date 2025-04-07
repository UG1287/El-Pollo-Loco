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

  constructor(canvas, keyboard, soundManager, level) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.soundManager = soundManager;
    this.totalCoins = level.coins.length;
    this.level = level;

    // Hier: Alle Gegner kriegen `this.world = this`
    this.level.enemies.forEach((e) => (e.world = this));

    // Falls du Clouds oder Sonstiges auch brauchst:
    // this.level.clouds.forEach(cloud => cloud.world = this);

    // Rest deines Codes ...

    // Character bekommt sofort sein world-Objekt
    this.setWorld();
    this.character.setWorld(this);

    // Zeichnen & Bewegungen
    this.draw();
    // Checks im 200ms-Intervall
    this.run();
    // Kollisions-Check alle 25ms
    this.startCollisionCheck();
  }

  startCollisionCheck() {
    setInterval(() => {
      this.checkCollisions();
    }, 25);
  }

  setWorld() {
    this.character.world = this;
    this.level.enemies.forEach(enemy => {
      enemy.world = this; 
    });
  }

  run() {
    setInterval(() => {
      console.log('run() läuft');
      this.checkThrowObjects();
      this.checkCoinCollection();
      this.checkBottleCollection();
      this.checkBottleCollisions();
    }, 200);
  }

  checkCollisions() {
    this.level.enemies.forEach((enemy, index) => {
      if (this.character.isColliding(enemy)) {
        // Da speedY < 0 == FALLEN in deinem Koordinatensystem
        const characterBottom = this.character.y + this.character.height;
        const enemyTop = enemy.y;
        const verticalOverlap = characterBottom - enemyTop;

        const isJumpingOnEnemy =
          // <== HIER: speedY < 0 => fallen
          this.character.speedY < 0 &&
          verticalOverlap > 0 &&
          verticalOverlap < 40;

        if (isJumpingOnEnemy) {
          console.log('✅ Charakter springt auf Gegner!');
          // Rückstoß
          this.character.speedY = 15; // => Hoch? Mach 'positiv' wenn bei dir 'hoch' = +
          enemy.die();
        } else {
          if (this.character.energy <= 0) {
            this.showGameOverScreen();
          }
          if (!this.character.isHurt()) {
            this.character.hit();
            console.log('🔥 Charakter getroffen!');
            console.log('💀 Neue HP:', this.character.energy);
            this.statusBar.setPercentage(this.character.energy);
          } else {
            console.log(
              '🔹 Charakter ist momentan unverwundbar (Hurt-Cooldown)'
            );
          }
        }
      }
    });
  }

  checkThrowObjects() {
    if (this.keyboard.D && this.character.hasBottles()) {
      console.log('Flasche wird geworfen!');
      let direction = this.character.otherDirection ? -1 : 1;
      let bottle = new ThrowableObject(
        this.character.x + 50 * direction,
        this.character.y + 100,
        direction
      );
      this.throwableObjects.push(bottle);
      this.character.useBottle();
      this.bottleStatusBar.setBottles(this.character.bottleCount);
      if (this.soundManager) {
        this.soundManager.playSound('throw');
      }
    }
  }

  checkBottleCollisions() {
    this.throwableObjects.forEach((bottle, bottleIndex) => {
      this.level.enemies.forEach((enemy, enemyIndex) => {
        if (bottle.isColliding(enemy)) {
          console.log(`Flasche trifft Gegner!`);
          enemy.takeDamage();
          this.throwableObjects.splice(bottleIndex, 1);
          if (enemy.isDead()) {
            console.log(`Gegner besiegt!`);
            this.level.enemies.splice(enemyIndex, 1);
            this.showVictoryScreen();
          }
        }
      });
    });
  }

  setupVictoryKeyListener() {
    let checkVictory = setInterval(() => {
      if (this.keyboard.ENTER) {
        clearInterval(checkVictory);
        // anstatt location.reload():
        window.resetGame();
      }
    }, 100);
  }

  showVictoryScreen() {
    console.log('Victory!');
    this.gameOver = true;
    // Anstatt: this.soundManager.stopBackgroundMusic();
    this.soundManager.stopAllSounds();

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

    this.ctx.font = '28px Arial';
    this.ctx.fillText(
      'Want to play again? Press ENTER',
      this.canvas.width / 2,
      this.canvas.height / 2 + 60
    );

    this.setupVictoryKeyListener();
  }

  showGameOverScreen() {
    // 1) Spiel anhalten
    this.gameOver = true;
    this.soundManager.stopAllSounds();

    // (Optional) Hintergrundmusik stoppen:
    // if (this.soundManager) {
    //   this.soundManager.stopBackgroundMusic(); // Du kannst hier eine stopBackgroundMusic()-Methode im SoundManager nutzen
    // }

    // 2) Bild laden und zeichnen + Overlay
    const ohNoImg = new Image();
    ohNoImg.src = 'img/9_intro_outro_screens/game_over/OhNo.png';
    ohNoImg.onload = () => {
      // Bildschirm leeren
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Halbdurchsichtiger Hintergrund
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw-Image mittig
      const imgWidth = 400;
      const imgHeight = 300;
      this.ctx.drawImage(ohNoImg, 0, 0, this.canvas.width, this.canvas.height);

      // Overlay-Text: „Try Again? Press ENTER“
      this.ctx.fillStyle = 'white';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        'Try Again? Press ENTER',
        this.canvas.width / 2,
        this.canvas.height / 2 + imgHeight / 2 + 20
      );
    };

    // 3) Setup Listener für ENTER
    this.setupGameOverKeyListener();
  }

  setupGameOverKeyListener() {
    let checkKey = setInterval(() => {
      if (this.keyboard.ENTER) {
        clearInterval(checkKey);
        window.resetGame(); // <-- ebenfalls Reset
      }
    }, 100);
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
        this.coinStatusBar.setCoins(this.coinsCollected, this.totalCoins);
      }
    });
  }

  checkBottleCollection() {
    if (!this.level.bottles) return;
    this.level.bottles.forEach((bottle, index) => {
      if (this.character.isColliding(bottle)) {
        this.level.bottles.splice(index, 1);
        this.character.collectBottle();
        this.bottleStatusBar.setBottles(this.character.bottleCount);
        if (this.soundManager) {
          this.soundManager.playSound('bottle_pickup');
        }
      }
    });
  }

  draw() {
    if (this.gameOver) {
      return; // Stoppt alle Zeichnungen
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

    let self = this;
    requestAnimationFrame(function () {
      self.draw();
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
