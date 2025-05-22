/**
 * Ensures sound playback is only triggered after user interaction.
 * @returns {void}
 */
function setupSoundUnlockOnClick() {
  window.addEventListener(
    'click',
    function () {
      if (soundManager && !soundManager.userInteracted && !gameStarted) {
        soundManager.userInteracted = true;
      }
    },
    { once: true }
  );
}

/**
 * Shows or hides the orientation overlay on mobile devices.
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
 * Clears the entire drawing surface of the canvas.
 * @returns {void}
 */
function clearCanvas() {
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Toggles the browser fullscreen mode for the document.
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
 * Registers both click and touch events on a button element.
 * @param {HTMLElement} btn - The button element.
 * @param {Function} handler - The event handler function.
 * @returns {void}
 */
function registerMuteEvents(btn, handler) {
  if (!btn) return;
  btn.addEventListener('click', handler);
  btn.addEventListener('touchstart', handler);
}

/**
 * Sets up the UI and events for mute buttons on mobile and desktop.
 * @returns {void}
 */
function setupMuteButton() {
  let mobileBtn = document.getElementById('btnMuteMobile');
  let desktopBtn = document.getElementById('btnMuteDesktop');
  let handleToggle = function (e) {
    e.preventDefault();
    soundManager.toggleMute();
  };
  registerMuteEvents(mobileBtn, handleToggle);
  registerMuteEvents(desktopBtn, handleToggle);
  soundManager.updateMuteIcon();
}

/**
 * Sets up the home button events for mobile and desktop.
 * @returns {void}
 */
function setupHomeButton() {
  let btnHomeDesktop = document.getElementById('btnHomeDesktop');
  let btnHomeMobile = document.getElementById('btnHomeMobile');
  let handleHome = function (e) {
    e.preventDefault();
    returnToStartScreen();
  };
  if (btnHomeDesktop) btnHomeDesktop.onclick = handleHome;
  if (btnHomeMobile) btnHomeMobile.onclick = handleHome;
}

/**
 * Initializes touch control UI, including hiding/showing and disabling context menu.
 * @returns {void}
 */
function setupTouchControls() {
  let touchControls = document.getElementById('touchControls');
  if (!touchControls) return;
  touchControls.style.display = hasRealTouch() ? 'block' : 'none';
  disableContextMenuOnButtons(
    '#touchControls button, #btnMuteMobile, #btnHomeMobile'
  );
  setupDirectionalTouch(
    document.getElementById('btnLeft'),
    document.getElementById('btnRight')
  );
  setupJumpAndThrow(
    document.getElementById('btnJump'),
    document.getElementById('btnThrow')
  );
}

/**
 * Detects if the device has true touch support.
 * @returns {boolean} True if real touch support is detected.
 */
function hasRealTouch() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Checks if the current device supports touch input.
 * @returns {boolean}
 */
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Disables the context menu on specified button selectors.
 * @param {string} selector - CSS selector for buttons.
 * @returns {void}
 */
function disableContextMenuOnButtons(selector) {
  document.querySelectorAll(selector).forEach(function (btn) {
    btn.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
  });
}

/**
 * Sets up touch start and end events for left/right directional buttons.
 * @param {HTMLElement} btnLeft - The left direction button.
 * @param {HTMLElement} btnRight - The right direction button.
 * @returns {void}
 */
function setupDirectionalTouch(btnLeft, btnRight) {
  if (!btnLeft || !btnRight) return;
  btnLeft.ontouchstart = function (e) {
    e.preventDefault();
    keyboard.LEFT = true;
  };
  btnLeft.ontouchend = function (e) {
    e.preventDefault();
    keyboard.LEFT = false;
  };
  btnRight.ontouchstart = function (e) {
    e.preventDefault();
    keyboard.RIGHT = true;
  };
  btnRight.ontouchend = function (e) {
    e.preventDefault();
    keyboard.RIGHT = false;
  };
}

/**
 * Sets up touch events for jump and throw buttons.
 * @param {HTMLElement} btnJump - The jump button.
 * @param {HTMLElement} btnThrow - The throw button.
 * @returns {void}
 */
function setupJumpAndThrow(btnJump, btnThrow) {
  if (!btnJump || !btnThrow) return;
  btnJump.ontouchstart = function (e) {
    e.preventDefault();
    keyboard.SPACE = true;
  };
  btnJump.ontouchend = function (e) {
    e.preventDefault();
    keyboard.SPACE = false;
  };
  btnThrow.ontouchstart = function (e) {
    e.preventDefault();
    world.tryThrowBottle();
  };
  btnThrow.ontouchend = function (e) {
    e.preventDefault();
    keyboard.D = false;
  };
}

/**
 * Loads and displays the Impressum overlay content.
 * @returns {void}
 */
function openImpressum() {
  let overlay = document.getElementById('impressumOverlay');
  let content = document.getElementById('impressumContent');
  fetch('impressum.html')
    .then(handleImpressumResponse)
    .then(function (html) {
      showImpressumContent(html, content, overlay);
    })
    .catch(function (err) {
      showImpressumError(content, overlay, err);
    });
}

/**
 * Handles the fetch response for the Impressum.
 * @param {Response} response - The fetch API response object.
 * @throws {Error} If the response is not OK.
 * @returns {Promise<string>} The HTML text of the Impressum page.
 */
function handleImpressumResponse(response) {
  if (!response.ok) throw new Error('Failed to load Impressum');
  return response.text();
}

/**
 * Parses and renders the Impressum HTML into the overlay.
 * @param {string} html - The raw HTML string of the Impressum.
 * @param {HTMLElement} content - The container element for the content.
 * @param {HTMLElement} overlay - The overlay element to display.
 * @returns {void}
 */
function showImpressumContent(html, content, overlay) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(html, 'text/html');
  let main = doc.querySelector('main');
  content.innerHTML = main ? main.innerHTML : html;
  overlay.style.display = 'block';
}

/**
 * Displays an error message if the Impressum cannot be loaded.
 * @param {HTMLElement} content - The container element for the content.
 * @param {HTMLElement} overlay - The overlay element to display.
 * @param {Error} error - The error encountered during fetch.
 * @returns {void}
 */
function showImpressumError(content, overlay, error) {
  content.innerHTML = 'Error loading Impressum.';
  overlay.style.display = 'block';
  console.error(error);
}

/**
 * Returns the user to the start screen, resetting world and UI state.
 * @returns {void}
 */
function returnToStartScreen() {
  stopWorldAndSound();
  resetUIToStartState();
  startScreen = new StartScreen(canvas, startGame, keyboard);
  setupSoundUnlockOnClick();
}

/**
 * Stops all world activity and sound playback.
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
 * Closes the Impressum overlay.
 * @returns {void}
 */
function closeImpressum() {
  let overlay = document.getElementById('impressumOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

/**
 * Resets UI elements back to the start screen state.
 * @returns {void}
 */
function resetUIToStartState() {
  let restartBtn = document.getElementById('restartButton');
  if (restartBtn) {
    restartBtn.style.display = 'none';
    restartBtn.onclick = null;
  }
  document.getElementById('touchControls').style.display = 'none';
  document.getElementById('mobileImpressumLink').style.display = 'block';
}