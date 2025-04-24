/**********************************************************************
 * Main game script
 * – Initialisation, start / reset logic, event-handlers, touch UI
 *********************************************************************/

/**
 * Canvas element (assigned in `init()`)
 * @type {HTMLCanvasElement}
 */
let canvas;
/**
 * Current game world instance
 * @type {World}
 */
let world;
/**
 * Global keyboard / touch controller
 * @type {Keyboard}
 */
let keyboard = new Keyboard();
/** Start-screen object */
let startScreen;
/** `true` while a game session is running */
let gameStarted = false;
/** Central sound manager (music & FX) */
let soundManager = new SoundManager();

/* ------------------------------------------------------------------ */
/* --- Initialisation & orientation handling ------------------------ */
/* ------------------------------------------------------------------ */

/**
 * Called on page load.  
 * Sets up the canvas, shows the start screen and hides the touch UI.
 * @returns {void}
 */
function init() {
  canvas      = document.getElementById('canvas');
  startScreen = new StartScreen(canvas, startGame, keyboard);

  let touchControls = document.getElementById('touchControls');
  if (touchControls) touchControls.style.display = 'none';

  document.getElementById('mobileImpressumLink').style.display = 'block';
  handleOrientation(); // initial check
}

/**
 * Shows or hides the orientation overlay.  
 * On touch devices: overlay is visible in portrait mode, hidden in landscape.
 * @returns {void}
 */
function handleOrientation() {
  let overlay = document.getElementById('orientationOverlay');
  if (!overlay) return;

  if (isTouchDevice()) {
    let isPortrait = window.matchMedia('(orientation:portrait)').matches;
    overlay.style.display = isPortrait ? 'flex' : 'none';
  } else {
    overlay.style.display = 'none';
  }
}

/* keep overlay state up-to-date */
window.addEventListener('load', handleOrientation);
window.addEventListener('orientationchange', handleOrientation);
window.addEventListener('resize', handleOrientation);

/* ------------------------------------------------------------------ */
/* --- start / restart game ----------------------------------------- */
/* ------------------------------------------------------------------ */

/**
 * Starts the game once, called from the start-screen.
 * @returns {void}
 */
function startGame() {
  if (gameStarted) return;

  gameStarted = true;
  clearCanvas();

  world = new World(canvas, keyboard, soundManager, createLevel1());

  if (isTouchDevice()) document.getElementById('touchControls').style.display = 'block';
  document.getElementById('mobileImpressumLink').style.display = 'none';

  if (!soundManager.muted) setTimeout(() => soundManager.playBackgroundMusic(), 500);

  setupTouchControls();
}

/**
 * Stops any running world and spawns a fresh one.
 * Triggered by restart button or ENTER key.
 * @returns {void}
 */
function resetGame() {
  // stop previous world
  if (world) {
    world.gameOver = true;
    world.character.stop();
    world.level.enemies.forEach(e => typeof e.stop === 'function' && e.stop());
    clearInterval(world.collisionIntervalID);
    clearInterval(world.runIntervalID);
  }

  // reset audio & canvas
  soundManager.reset();
  soundManager.stopBackgroundMusic();
  if (!soundManager.muted) soundManager.playBackgroundMusic();
  clearCanvas();

  // reset UI
  let restartBtn      = document.getElementById('restartButton');
  let touchControls   = document.getElementById('touchControls');
  let mobileImpressum = document.getElementById('mobileImpressumLink');

  if (restartBtn) restartBtn.style.display = 'none';

  if (isTouchDevice()) {
    touchControls.style.display   = 'block';
    mobileImpressum.style.display = 'block';
  } else {
    touchControls.style.display   = 'none';
    mobileImpressum.style.display = 'none';
  }

  // new world
  world       = new World(canvas, keyboard, soundManager, createLevel1());
  gameStarted = true;
  setupTouchControls();
}
window.resetGame = resetGame;

/* ------------------------------------------------------------------ */
/* --- helpers ------------------------------------------------------- */
/* ------------------------------------------------------------------ */

/**
 * Clears the entire canvas.
 * @returns {void}
 */
function clearCanvas() {
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Toggles full-screen mode.
 * @returns {void}
 */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

/**
 * Returns `true` if the current device supports touch input.
 * @returns {boolean}
 */
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Binds touch buttons to keyboard flags or direct actions.
 * @returns {void}
 */
function setupTouchControls() {
  let touchControls = document.getElementById('touchControls');
  touchControls.style.display = isTouchDevice() ? 'block' : 'none';

  /* left / right */
  let btnLeft  = document.getElementById('btnLeft');
  let btnRight = document.getElementById('btnRight');
  btnLeft .ontouchstart = e => { e.preventDefault(); keyboard.LEFT  = true; };
  btnLeft .ontouchend   = e => { e.preventDefault(); keyboard.LEFT  = false; };
  btnRight.ontouchstart = e => { e.preventDefault(); keyboard.RIGHT = true; };
  btnRight.ontouchend   = e => { e.preventDefault(); keyboard.RIGHT = false; };

  /* jump */
  let btnJump = document.getElementById('btnJump');
  btnJump.ontouchstart = e => { e.preventDefault(); keyboard.SPACE = true;  };
  btnJump.ontouchend   = e => { e.preventDefault(); keyboard.SPACE = false; };

  /* throw */
  let btnThrow = document.getElementById('btnThrow');
  btnThrow.ontouchstart = e => { e.preventDefault(); if (world) world.tryThrowBottle(); };
  btnThrow.ontouchend   = e => { e.preventDefault(); keyboard.D = false; };

  /* mute */
  let btnMute = document.getElementById('btnMute');
  btnMute.onclick =
  btnMute.ontouchstart = e => { e.preventDefault(); soundManager.toggleMute(); };
}

/* ------------------------------------------------------------------ */
/* --- keyboard event handlers -------------------------------------- */
/* ------------------------------------------------------------------ */
window.addEventListener('keydown', e => {
  if (!keyboard) return;

  switch (e.code) {
    case 'ArrowRight': keyboard.RIGHT = true; break;
    case 'ArrowLeft' : keyboard.LEFT  = true; break;
    case 'ArrowUp'   : keyboard.UP    = true; break;
    case 'ArrowDown' : keyboard.DOWN  = true; break;
    case 'Space'     : keyboard.SPACE = true; break;
    case 'KeyD'      : if (world) world.tryThrowBottle(); break;
    case 'Enter'     : keyboard.ENTER = true; break;
    case 'KeyM'      : soundManager.toggleMute(); break;
    case 'KeyF'      : toggleFullscreen(); break;
  }
});

window.addEventListener('keyup', e => {
  switch (e.code) {
    case 'ArrowRight': keyboard.RIGHT = false; break;
    case 'ArrowLeft' : keyboard.LEFT  = false; break;
    case 'ArrowUp'   : keyboard.UP    = false; break;
    case 'ArrowDown' : keyboard.DOWN  = false; break;
    case 'Space'     : keyboard.SPACE = false; break;
    case 'KeyD'      : keyboard.D     = false; break;
    case 'Enter'     : keyboard.ENTER = false; break;
  }
});
