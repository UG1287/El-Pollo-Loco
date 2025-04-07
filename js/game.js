let canvas;
let world;
let keyboard = new Keyboard();
let startScreen;
let gameStarted = false;
let soundManager = new SoundManager();

function init() {
  canvas = document.getElementById('canvas');
  startScreen = new StartScreen(canvas, startGame, keyboard);
}

function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    clearCanvas();
    let newLevel = createLevel1();
    world = new World(canvas, keyboard, soundManager, newLevel);
    setTimeout(() => soundManager.playBackgroundMusic(), 500);
    console.log('Game started');
    console.log('World:', World);
  }
}

function resetGame() {
  console.log('Neues Spiel wird gestartet (ohne StartScreen)!');
  clearCanvas();
  gameStarted = true;

  // Hier rufst du deine Fabrik-Funktion auf, die alle Gegner & Co. neu erzeugt
  let newLevel = createLevel1();

  // Neue World mit neuem Level
  world = new World(canvas, keyboard, soundManager, newLevel);

  setTimeout(() => soundManager.playBackgroundMusic(), 500);
  console.log('Reset Game fertig: Neue World & Level erstellt.');
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
  console.log('Key pressed:', e.code); // Debugging-Ausgabe
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
