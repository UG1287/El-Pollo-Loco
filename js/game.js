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
  window.addEventListener(
    'click',
    () => {
      if (soundManager && soundManager.sounds['background']) {
        soundManager.userInteracted = true;
        soundManager.playBackgroundMusic();
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
 * Ermittelt zuverlässig, ob das Gerät echte Touch-Unterstützung hat.
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

  if (isTouchDevice()) {
    document.getElementById('touchControls').style.display = 'block';
    document.getElementById('mobileImpressumLink').style.display = 'none';
  } else {
    document.getElementById('mobileImpressumLink').style.display = 'none';
  }

  if (!soundManager.muted && soundManager.userInteracted) {
    setTimeout(() => soundManager.playBackgroundMusic(), 500);
  }

  setupTouchControls();
}

/**
 * Stops any running world and spawns a fresh one.
 * Triggered by restart button or ENTER key.
 * @returns {void}
 */
function resetGame() {
  if (world) {
    world.gameOver = true;
    world.character.stop();
    world.level.enemies.forEach(
      (e) => typeof e.stop === 'function' && e.stop()
    );
    clearInterval(world.collisionIntervalID);
    clearInterval(world.runIntervalID);
  }

  soundManager.reset();
  clearCanvas();

  let restartBtn = document.getElementById('restartButton');
  let touchControls = document.getElementById('touchControls');
  let mobileImpressum = document.getElementById('mobileImpressumLink');

  if (restartBtn) restartBtn.style.display = 'none';

  if (isTouchDevice()) {
    touchControls.style.display = 'block';
    mobileImpressum.style.display = 'block';
  } else {
    touchControls.style.display = 'none';
    mobileImpressum.style.display = 'none';
  }

  world = new World(canvas, keyboard, soundManager, createLevel1());
  gameStarted = true;
  setupTouchControls();

  if (!soundManager.muted && soundManager.userInteracted) {
    setTimeout(() => {
      soundManager.playBackgroundMusic();
    }, 300);
  }
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

function setupMuteButton() {
  const mobileBtn = document.getElementById('btnMuteMobile');
  const desktopBtn = document.getElementById('btnMuteDesktop');

  const handleToggle = (e) => {
    e.preventDefault();
    soundManager.toggleMute();
  };

  if (mobileBtn) {
    mobileBtn.addEventListener('click', handleToggle);
    mobileBtn.addEventListener('touchstart', handleToggle);
  }

  if (desktopBtn) {
    desktopBtn.addEventListener('click', handleToggle);
    desktopBtn.addEventListener('touchstart', handleToggle);
  }

  soundManager.updateMuteIcon();
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

  if (hasRealTouch()) {
    touchControls.style.display = 'block';
  } else {
    touchControls.style.display = 'none';
  }

  let btnLeft = document.getElementById('btnLeft');
  let btnRight = document.getElementById('btnRight');
  let btnJump = document.getElementById('btnJump');
  let btnThrow = document.getElementById('btnThrow');
  let btnMute = document.getElementById('btnMute');

  if (btnLeft && btnRight && btnJump && btnThrow && btnMute) {
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
}

function openImpressum() {
  const overlay = document.getElementById('impressumOverlay');
  const content = document.getElementById('impressumContent');

  fetch('impressum.html')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Impressum konnte nicht geladen werden');
      }
      return response.text();
    })
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const main = doc.querySelector('main');
      content.innerHTML = main ? main.innerHTML : html;

      overlay.style.display = 'block';
    })
    .catch((error) => {
      content.innerHTML = 'Fehler beim Laden des Impressums.';
      overlay.style.display = 'block';
      console.error(error);
    });
}

function closeImpressum() {
  const overlay = document.getElementById('impressumOverlay');
  overlay.style.display = 'none';
}

window.addEventListener('keydown', (e) => {
  if (!keyboard) return;

  switch (e.code) {
    case 'ArrowRight':
      keyboard.RIGHT = true;
      break;
    case 'ArrowLeft':
      keyboard.LEFT = true;
      break;
    case 'ArrowUp':
      keyboard.UP = true;
      break;
    case 'ArrowDown':
      keyboard.DOWN = true;
      break;
    case 'Space':
      keyboard.SPACE = true;
      break;
    case 'KeyD':
      if (world) world.tryThrowBottle();
      break;
    case 'Enter':
      keyboard.ENTER = true;
      break;
    case 'KeyM':
      soundManager.toggleMute();
      break;
    case 'KeyF':
      toggleFullscreen();
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'ArrowRight':
      keyboard.RIGHT = false;
      break;
    case 'ArrowLeft':
      keyboard.LEFT = false;
      break;
    case 'ArrowUp':
      keyboard.UP = false;
      break;
    case 'ArrowDown':
      keyboard.DOWN = false;
      break;
    case 'Space':
      keyboard.SPACE = false;
      break;
    case 'KeyD':
      keyboard.D = false;
      break;
    case 'Enter':
      keyboard.ENTER = false;
      break;
  }
});
