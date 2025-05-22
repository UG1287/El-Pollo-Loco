/**
 * @type {HTMLCanvasElement}
 * @description The canvas element where the game is rendered.
 */
let canvas;

/**
 * @type {World}
 * @description The game world instance managing game logic and rendering.
 */
let world;

/**
 * @type {Keyboard}
 * @description Tracks the current state of keyboard inputs.
 */
let keyboard = new Keyboard();

/**
 * @type {StartScreen}
 * @description The start screen overlay before the game begins.
 */
let startScreen;

/**
 * @type {boolean}
 * @description Flag indicating whether the game has started.
 */
let gameStarted = false;

/**
 * @type {SoundManager}
 * @description Manages all game sound effects and music.
 */
let soundManager = new SoundManager();

/**
 * Called on page load. Initializes canvas, UI elements, and sound unlock logic.
 * @returns {void}
 */
function init() {
  canvas = document.getElementById('canvas');
  startScreen = new StartScreen(canvas, startGame, keyboard);

  let touchControls = document.getElementById('touchControls');
  if (touchControls) touchControls.style.display = 'none';

  document.getElementById('mobileImpressumLink').style.display = 'block';
  soundManager.updateMuteIcon();
  handleOrientation();
  setupSoundUnlockOnClick();
}


/**
 * Starts the game if it hasn't already started.
 * @returns {void}
 */
function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  clearCanvas();
  world = new World(canvas, keyboard, soundManager, createLevel1());
  handleResponsiveUI();
  handleBackgroundMusic();
  setupTouchControls();
}

/**
 * Resets the game to its initial state.
 * @returns {void}
 */
function resetGame() {
  stopCurrentWorld();
  resetUI();
  restartWorld();
  if (!soundManager.muted && soundManager.userInteracted) {
    setTimeout(function () {
      soundManager.playBackgroundMusic();
    }, 300);
  }
}

/**
 * Stops the current world and clears intervals and sounds.
 * @returns {void}
 */
function stopCurrentWorld() {
  if (!world) return;
  world.gameOver = true;
  world.character.stop();
  world.level.enemies.forEach(function (e) {
    if (typeof e.stop === 'function') e.stop();
  });
  clearInterval(world.collisionIntervalID);
  clearInterval(world.runIntervalID);
  soundManager.reset();
  clearCanvas();
}

/**
 * Updates UI elements when the game is reset.
 * @returns {void}
 */
function resetUI() {
  let restartBtn = document.getElementById('restartButton');
  if (restartBtn) restartBtn.style.display = 'none';

  let show = isTouchDevice();
  document.getElementById('touchControls').style.display = show
    ? 'block'
    : 'none';
  document.getElementById('mobileImpressumLink').style.display = 'none';
}

/**
 * Restarts the world without reloading the page.
 * @returns {void}
 */
function restartWorld() {
  world = new World(canvas, keyboard, soundManager, createLevel1());
  gameStarted = true;
  setupTouchControls();
  handleResponsiveUI();
}

/**
 * Shows or hides touch controls and mobile links for responsive UI.
 * @returns {void}
 */
function handleResponsiveUI() {
  let controls = document.getElementById('touchControls');
  if (isTouchDevice()) controls.style.display = 'block';
  document.getElementById('mobileImpressumLink').style.display = 'none';
}

/**
 * Manages the playback of background music based on user interaction and mute state.
 * @returns {void}
 */
function handleBackgroundMusic() {
  if (!soundManager.userInteracted) {
    soundManager.userInteracted = true;
    soundManager.playBackgroundMusic();
  } else if (!soundManager.muted) {
    setTimeout(function () {
      soundManager.playBackgroundMusic();
    }, 500);
  }
}

/**
 * Mapping of key codes to actions for when keys are pressed down.
 * @type {Object.<string, function>}
 */
let keyDownActions = {
  ArrowRight: () => { keyboard.RIGHT = true; },
  ArrowLeft:  () => { keyboard.LEFT  = true; },
  ArrowUp:    () => { keyboard.UP    = true; },
  ArrowDown:  () => { keyboard.DOWN  = true; },
  Space:      () => { keyboard.SPACE = true; },
  KeyD:       () => { if (world) world.tryThrowBottle(); },
  Enter:      () => { keyboard.ENTER = true; },
  KeyM:       () => { soundManager.toggleMute(); },
  KeyF:       () => { toggleFullscreen(); },
};

/**
 * Mapping of key codes to actions for when keys are released.
 * @type {Object.<string, function>}
 */
let keyUpActions = {
  ArrowRight: () => { keyboard.RIGHT = false; },
  ArrowLeft:  () => { keyboard.LEFT  = false; },
  ArrowUp:    () => { keyboard.UP    = false; },
  ArrowDown:  () => { keyboard.DOWN  = false; },
  Space:      () => { keyboard.SPACE = false; },
  KeyD:       () => { keyboard.D     = false; },
  Enter:      () => { keyboard.ENTER = false; },
};

/**
 * Handles the keydown event by executing the corresponding action.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {void}
 */
function handleKeyDown(e) {
  let action = keyDownActions[e.code];
  if (action) action();
}

/**
 * Handles the keyup event by executing the corresponding action.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {void}
 */
function handleKeyUp(e) {
  let action = keyUpActions[e.code];
  if (action) action();
}

// --- Event Bindings ---
window.addEventListener('load', init);
window.addEventListener('load', handleOrientation);
window.addEventListener('load', setupTouchControls);
window.addEventListener('load', setupMuteButton);
window.addEventListener('load', setupHomeButton);
window.addEventListener('orientationchange', function () {
  handleOrientation();
  setupTouchControls();
});
window.addEventListener('resize', function () {
  handleOrientation();
  setupTouchControls();
});
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

window.resetGame = resetGame;
window.openImpressum = openImpressum;