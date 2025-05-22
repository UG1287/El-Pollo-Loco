/**
 * Controls end‑of‑game screens (victory / game‑over) and restart interactions.
 * @class
 */
class ScreenManager {
  /**
   * @param {Object} world - Current game world instance.
   * @param {Object} keyboard - Keyboard input handler.
   */
  constructor(world, keyboard) {
    this.world = world;
    this.keyboard = keyboard;
  }

  /**
   * Waits for the ENTER key and then executes a callback.
   * @private
   * @param {Function} cb - Function to run on ENTER press.
   */
  listenEnter(cb) {
    const t = setInterval(() => {
      if (this.keyboard.ENTER) {
        clearInterval(t);
        cb();
      }
    }, 100);
  }

  /**
   * Presents the victory screen and sets up restart handling.
   * @returns {void}
   */
  showVictoryScreen() {
    this.prepareEndState('victory');
    this.drawVictory();
    this.handleRestart();
  }

  /**
   * Prepares the shared end‑of‑game state.
   * @private
   * @param {('victory'|'lose')} type - Sound key to play.
   */
  prepareEndState(type) {
    this.world.gameOver = true;
    this.world.soundManager.stopAllSounds();
    this.world.soundManager.playSound(type);
    clearInterval(this.world.runIntervalID);
  }

  /**
   * Renders the victory overlay.
   * @private
   */
  drawVictory() {
    const { ctx, canvas } = this.world;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Victory!', canvas.width / 2, canvas.height / 2);
    this.drawRestartHint(canvas, ctx);
  }

  /**
   * Draws restart hint for keyboard or touch devices.
   * @private
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   */
  drawRestartHint(canvas, ctx) {
    if (!isTouchDevice()) {
      ctx.font = '28px Arial';
      ctx.fillText(
        'Press ENTER to restart',
        canvas.width / 2,
        canvas.height / 2 + 60
      );
    } else {
      const btn = document.getElementById('restartButton');
      if (btn) {
        btn.style.display = 'block';
        btn.onclick = () => window.resetGame();
      }
    }
  }

  /**
   * Sets up ENTER‑key listener (or touch button) to restart the game.
   * @private
   */
  handleRestart() {
    this.listenEnter(() => window.resetGame());
  }

  /**
   * Presents the game‑over screen and sets up restart handling.
   * @returns {void}
   */
  showGameOverScreen() {
    this.prepareGameOverState();
    this.loadGameOverImage((img) => {
      this.drawGameOver(img);
      this.handleRestart();
    });
  }

  /**
   * Applies game‑over specific state changes (sounds, flags).
   * @private
   */
  prepareGameOverState() {
    this.world.gameOver = true;
    this.world.soundManager.gameOver = true;
    clearInterval(this.world.runIntervalID);
    this.world.soundManager.stopBackgroundMusic();
    setTimeout(() => this.world.soundManager.playSound('lose'), 200);
  }

  /**
   * Loads the game‑over splash image.
   * @private
   * @param {Function} cb - Receives the loaded Image instance.
   */
  loadGameOverImage(cb) {
    const img = new Image();
    img.src = 'img/9_intro_outro_screens/game_over/OhNo.png';
    img.onload = () => cb(img);
  }

  /**
   * Dim the screen and optionally draw a background image.
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvas
   * @param {HTMLImageElement} [img]
   * @private
   */
  clearAndDim(ctx, canvas, img) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (img) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  /**
   * Show “retry” hint (desktop) or restart button (touch).
   * @private
   */
  drawRestartHint() {
    const { ctx, canvas } = this.world;
    if (!isTouchDevice()) {
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Press ENTER to retry',
        canvas.width / 2,
        canvas.height / 2 + 100
      );
    } else {
      const btn = document.getElementById('restartButton');
      if (btn) {
        btn.style.display = 'block';
        btn.onclick = () => window.resetGame();
      }
    }
  }

  /** @param {HTMLImageElement} img */
  drawGameOver(img) {
    const { ctx, canvas } = this.world;
    this.clearAndDim(ctx, canvas, img);
    this.drawRestartHint();
  }
}
