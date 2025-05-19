let canvas;
let world;
let keyboard = new Keyboard();
let startScreen;
let gameStarted = false;
let soundManager = new SoundManager();

/**
 * Called on page load.
 * Sets up the canvas, shows the start screen and hides the touch UI.
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
 * Ensures sound playback is only triggered after user interaction.
 * Used to comply with browser autoplay policies.
 * @returns {void}
 */
function setupSoundUnlockOnClick() {
  window.addEventListener(
    'click',
    () => {
      if (soundManager && !soundManager.userInteracted && !gameStarted) {
        soundManager.userInteracted = true;
      }
    },
    { once: true }
  );
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

/**
 * Checks if the device has real touch support.
 * @returns {boolean}
 */
function hasRealTouch() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

window.addEventListener('load', () => {
  handleOrientation();
  setupTouchControls();
  setupMuteButton();
  setupHomeButton();
});

window.addEventListener('orientationchange', () => {
  handleOrientation();
  setupTouchControls();
});

window.addEventListener('resize', () => {
  handleOrientation();
  setupTouchControls();
});

/**
 * Starts the game once, called from the start-screen.
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
 * Updates UI for mobile/desktop layout.
 * @returns {void}
 */
function handleResponsiveUI() {
  const controls = document.getElementById('touchControls');
  const impressum = document.getElementById('mobileImpressumLink');

  if (isTouchDevice()) {
    controls.style.display = 'block';
  }
  impressum.style.display = 'none';
}

/**
 * Plays background music if allowed.
 * @returns {void}
 */
function handleBackgroundMusic() {
  if (!soundManager.userInteracted) {
    soundManager.userInteracted = true;
    soundManager.playBackgroundMusic();
  } else if (!soundManager.muted) {
    setTimeout(() => soundManager.playBackgroundMusic(), 500);
  }
}

/**
 * Resets game and starts a new world.
 * @returns {void}
 */
function resetGame() {
  stopCurrentWorld();
  resetUI();
  restartWorld();

  if (!soundManager.muted && soundManager.userInteracted) {
    setTimeout(() => soundManager.playBackgroundMusic(), 300);
  }
}

/**
 * Stops all game processes and clears world.
 * @returns {void}
 */
function stopCurrentWorld() {
  if (!world) return;

  world.gameOver = true;
  world.character.stop();
  world.level.enemies.forEach((e) => typeof e.stop === 'function' && e.stop());
  clearInterval(world.collisionIntervalID);
  clearInterval(world.runIntervalID);
  soundManager.reset();
  clearCanvas();
}

/**
 * Resets basic UI visibility states.
 * @returns {void}
 */
function resetUI() {
  const restartBtn = document.getElementById('restartButton');
  const touchControls = document.getElementById('touchControls');
  const mobileImpressum = document.getElementById('mobileImpressumLink');

  if (restartBtn) restartBtn.style.display = 'none';

  const show = isTouchDevice();
  touchControls.style.display = show ? 'block' : 'none';
  mobileImpressum.style.display = show ? 'block' : 'none';
}

/**
 * Creates a new world instance and sets up controls.
 * @returns {void}
 */
function restartWorld() {
  world = new World(canvas, keyboard, soundManager, createLevel1());
  gameStarted = true;
  setupTouchControls();
}

window.resetGame = resetGame;

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
 * Sets up mute button click and touch event listeners.
 * @returns {void}
 */
function setupMuteButton() {
  const mobileBtn = document.getElementById('btnMuteMobile');
  const desktopBtn = document.getElementById('btnMuteDesktop');
  const handleToggle = (e) => {
    e.preventDefault();
    soundManager.toggleMute();
  };

  registerMuteEvents(mobileBtn, handleToggle);
  registerMuteEvents(desktopBtn, handleToggle);

  soundManager.updateMuteIcon();
}

/**
 * Registers click and touch handlers on a button.
 * @param {HTMLElement|null} btn
 * @param {Function} handler
 * @returns {void}
 */
function registerMuteEvents(btn, handler) {
  if (!btn) return;
  btn.addEventListener('click', handler);
  btn.addEventListener('touchstart', handler);
}

/**
 * Sets up return to start screen buttons.
 * @returns {void}
 */
function setupHomeButton() {
  const btnHomeDesktop = document.getElementById('btnHomeDesktop');
  const btnHomeMobile = document.getElementById('btnHomeMobile');

  const handleHome = (e) => {
    e.preventDefault();
    returnToStartScreen();
  };

  if (btnHomeDesktop) btnHomeDesktop.onclick = handleHome;
  if (btnHomeMobile) btnHomeMobile.onclick = handleHome;
}

/**
 * Shows the game start screen again.
 * @returns {void}
 */
function returnToStartScreen() {
  stopWorldAndSound();
  resetUIToStartState();
  startScreen = new StartScreen(canvas, startGame, keyboard);
  setupSoundUnlockOnClick();
}

/**
 * Stops all world activity and sound.
 * Used when returning to start screen.
 * @returns {void}
 */
function stopWorldAndSound() {
  if (world) {
    world.stopAll();
    world = null;
  }
  if (soundManager) {
    soundManager.stopAllSounds();
    soundManager.userInteracted = false;
  }
  gameStarted = false;
}

/**
 * Resets all UI elements when returning to start screen.
 * @returns {void}
 */
function resetUIToStartState() {
  const restartBtn = document.getElementById('restartButton');
  if (restartBtn) {
    restartBtn.style.display = 'none';
    restartBtn.onclick = null;
  }
  document.getElementById('touchControls').style.display = 'none';
  document.getElementById('mobileImpressumLink').style.display = 'block';
}

/**
 * Returns `true` if the current device supports touch input.
 * @returns {boolean}
 */
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Binds touch controls to keyboard input flags.
 * @returns {void}
 */
function setupTouchControls() {
  const touchControls = document.getElementById('touchControls');
  touchControls.style.display = hasRealTouch() ? 'block' : 'none';

  const btnLeft = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  const btnJump = document.getElementById('btnJump');
  const btnThrow = document.getElementById('btnThrow');

  setupDirectionalTouch(btnLeft, btnRight);
  setupJumpAndThrow(btnJump, btnThrow);
}

/**
 * Sets up touch input for directional movement.
 * @param {HTMLElement|null} btnLeft
 * @param {HTMLElement|null} btnRight
 * @returns {void}
 */
function setupDirectionalTouch(btnLeft, btnRight) {
  if (!btnLeft || !btnRight) return;

  btnLeft.ontouchstart = (e) => {
    e.preventDefault();
    keyboard.LEFT = true;
  };
  btnLeft.ontouchend = (e) => {
    e.preventDefault();
    keyboard.LEFT = false;
  };
  btnRight.ontouchstart = (e) => {
    e.preventDefault();
    keyboard.RIGHT = true;
  };
  btnRight.ontouchend = (e) => {
    e.preventDefault();
    keyboard.RIGHT = false;
  };
}

/**
 * Sets up touch input for jumping and throwing.
 * @param {HTMLElement|null} btnJump
 * @param {HTMLElement|null} btnThrow
 * @returns {void}
 */
function setupJumpAndThrow(btnJump, btnThrow) {
  if (!btnJump || !btnThrow) return;

  btnJump.ontouchstart = (e) => {
    e.preventDefault();
    keyboard.SPACE = true;
  };
  btnJump.ontouchend = (e) => {
    e.preventDefault();
    keyboard.SPACE = false;
  };
  btnThrow.ontouchstart = (e) => {
    e.preventDefault();
    if (world) world.tryThrowBottle();
  };
  btnThrow.ontouchend = (e) => {
    e.preventDefault();
    keyboard.D = false;
  };
}

function openImpressum() {
  const overlay = document.getElementById('impressumOverlay');
  const content = document.getElementById('impressumContent');

  fetch('impressum.html')
    .then((res) => handleImpressumResponse(res))
    .then((html) => showImpressumContent(html, content, overlay))
    .catch((err) => showImpressumError(content, overlay, err));
}

function handleImpressumResponse(response) {
  if (!response.ok) {
    throw new Error('Impressum konnte nicht geladen werden');
  }
  return response.text();
}

function showImpressumContent(html, content, overlay) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const main = doc.querySelector('main');
  content.innerHTML = main ? main.innerHTML : html;
  overlay.style.display = 'block';
}

function showImpressumError(content, overlay, error) {
  content.innerHTML = 'Fehler beim Laden des Impressums.';
  overlay.style.display = 'block';
  console.error(error);
}


function closeImpressum() {
  const overlay = document.getElementById('impressumOverlay');
  overlay.style.display = 'none';
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

const keyDownActions = {
  ArrowRight: () => keyboard.RIGHT = true,
  ArrowLeft: () => keyboard.LEFT = true,
  ArrowUp: () => keyboard.UP = true,
  ArrowDown: () => keyboard.DOWN = true,
  Space: () => keyboard.SPACE = true,
  KeyD: () => world?.tryThrowBottle(),
  Enter: () => keyboard.ENTER = true,
  KeyM: () => soundManager.toggleMute(),
  KeyF: () => toggleFullscreen()
};

const keyUpActions = {
  ArrowRight: () => keyboard.RIGHT = false,
  ArrowLeft: () => keyboard.LEFT = false,
  ArrowUp: () => keyboard.UP = false,
  ArrowDown: () => keyboard.DOWN = false,
  Space: () => keyboard.SPACE = false,
  KeyD: () => keyboard.D = false,
  Enter: () => keyboard.ENTER = false
};

function handleKeyDown(e) {
  if (!keyboard) return;
  const action = keyDownActions[e.code];
  if (action) action();
}

function handleKeyUp(e) {
  const action = keyUpActions[e.code];
  if (action) action();
}

