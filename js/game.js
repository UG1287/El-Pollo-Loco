let canvas;
let world;
let keyboard = new Keyboard();
let startScreen;
let gameStarted = false;
let soundManager = new SoundManager();

function init() {
  canvas = document.getElementById('canvas');
  startScreen = new StartScreen(canvas, startGame, keyboard);
  let touchControls = document.getElementById('touchControls');
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
  soundManager.stopBackgroundMusic();
  setTimeout(() => soundManager.playBackgroundMusic(), 150);
  clearCanvas();
  let restartBtn = document.getElementById('restartButton');
  if (restartBtn) restartBtn.style.display = 'none';
  let touchControls = document.getElementById('touchControls');
  let mobileImpressum = document.getElementById('mobileImpressumLink');
  if (isTouchDevice()) {
    touchControls.style.display = 'block';
    mobileImpressum.style.display = 'block';
  } else {
    touchControls.style.display = 'none';
    mobileImpressum.style.display = 'none';
  }
  let newLevel = createLevel1();
  world = new World(canvas, keyboard, soundManager, newLevel);
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
  if (e.code === 'KeyD'&& world) {world.tryThrowBottle();}
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
    .addEventListener('touchstart', e => {
      e.preventDefault();
      if (world) world.tryThrowBottle();
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
