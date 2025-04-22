let canvas;
let world;
let keyboard = new Keyboard();
let startScreen;
let gameStarted = false;
let soundManager = new SoundManager();

function init() {
  canvas = document.getElementById('canvas');
  startScreen = new StartScreen(canvas, startGame, keyboard);

  const touchControls = document.getElementById('touchControls');
  if (touchControls) {
    touchControls.style.display = 'none';
  }
  document.getElementById('mobileImpressumLink').style.display = 'block';
}

function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    clearCanvas();
    let newLevel = createLevel1();
    world = new World(canvas, keyboard, soundManager, newLevel);

    if (isTouchDevice()) {
      document.getElementById('touchControls').style.display = 'block';
    }
    document.getElementById('mobileImpressumLink').style.display = 'none';

    setTimeout(() => soundManager.playBackgroundMusic(), 500);
    console.log('Game started');

    setupTouchControls();
  }
}

function resetGame() {
  console.log('► Neues Spiel wird gestartet');

  /* 1) Altes Spiel sauber beenden ‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑ */
  if (world) {                     // es lief schon eine World‑Instanz
    world.gameOver = true;         // blockiert alle weiteren Aktionen

    // Charakter‑ & Gegner‑Timer stoppen
    world.character.stop();
    world.level.enemies.forEach(e => typeof e.stop === 'function' && e.stop());

    // eventuell weiterlaufende World‑Timer beenden
    clearInterval(world.collisionIntervalID);
    clearInterval(world.runIntervalID);
  }

  /* 2) Oberfläche zurücksetzen ‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑ */
  clearCanvas();

  // Restart‑Button verstecken
  const restartBtn = document.getElementById('restartButton');
  if (restartBtn) restartBtn.style.display = 'none';

  // Touch‑UI vorbereiten
  const touchControls      = document.getElementById('touchControls');
  const mobileImpressum    = document.getElementById('mobileImpressumLink');
  if (isTouchDevice()) {
    touchControls.style.display   = 'block';
    mobileImpressum.style.display = 'block';
  } else {
    touchControls.style.display   = 'none';
    mobileImpressum.style.display = 'none';
  }

  /* 3) Frische Spielwelt erzeugen ‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑ */
  const newLevel = createLevel1();                // ⬅︎ erzeugt neuen Endboss
  world          = new World(canvas, keyboard, soundManager, newLevel);

  /* 4) Musik & Touch‑Events neu starten ‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑ */
  soundManager.playBackgroundMusic();
  setupTouchControls();

  gameStarted = true;
}


window.resetGame = resetGame;

function clearCanvas() {
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

window.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.code);
  if (!keyboard) {
    console.error('keyboard object is not initialized!');
    return;
  }

  if (e.code === 'ArrowRight') keyboard.RIGHT = true;
  if (e.code === 'ArrowLeft') keyboard.LEFT = true;
  if (e.code === 'ArrowUp') keyboard.UP = true;
  if (e.code === 'ArrowDown') keyboard.DOWN = true;
  if (e.code === 'Space') keyboard.SPACE = true;
  if (e.code === 'KeyD') keyboard.D = true;
  if (e.code === 'Enter') keyboard.ENTER = true;
  if (e.code === 'KeyM') {
    soundManager.toggleMute();
  }
  if (e.code === 'KeyF') {
    toggleFullscreen();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowRight') {
    keyboard.RIGHT = false;
  }
  if (e.code === 'ArrowLeft') {
    keyboard.LEFT = false;
  }
  if (e.code === 'ArrowUp') {
    keyboard.UP = false;
  }
  if (e.code === 'ArrowDown') {
    keyboard.DOWN = false;
  }
  if (e.code === 'Space') {
    keyboard.SPACE = false;
  }
  if (e.code === 'KeyD') {
    keyboard.D = false;
  }
  if (e.code === 'Enter') keyboard.ENTER = false;
});

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function setupTouchControls() {
  const touchControls = document.getElementById('touchControls');
  if (isTouchDevice()) {
    touchControls.style.display = 'block';
  } else {
    touchControls.style.display = 'none';
  }

  document
    .getElementById('btnLeft')
    .addEventListener('touchstart', function (e) {
      e.preventDefault();
      keyboard.LEFT = true;
    });
  document.getElementById('btnLeft').addEventListener('touchend', function (e) {
    e.preventDefault();
    keyboard.LEFT = false;
  });

  document
    .getElementById('btnRight')
    .addEventListener('touchstart', function (e) {
      e.preventDefault();
      keyboard.RIGHT = true;
    });
  document
    .getElementById('btnRight')
    .addEventListener('touchend', function (e) {
      e.preventDefault();
      keyboard.RIGHT = false;
    });

  document
    .getElementById('btnJump')
    .addEventListener('touchstart', function (e) {
      e.preventDefault();
      keyboard.SPACE = true;
    });
  document.getElementById('btnJump').addEventListener('touchend', function (e) {
    e.preventDefault();
    keyboard.SPACE = false;
  });

  document
    .getElementById('btnThrow')
    .addEventListener('touchstart', function (e) {
      e.preventDefault();
      keyboard.D = true;
    });
  document
    .getElementById('btnThrow')
    .addEventListener('touchend', function (e) {
      e.preventDefault();
      keyboard.D = false;
    });

  document.getElementById('btnMute').addEventListener('click', function (e) {
    e.preventDefault();
    soundManager.toggleMute();
  });
}
