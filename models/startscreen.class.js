/**
 * Represents the start screen of the game.
 * Handles displaying the start image and creating the start buttons.
 */
class StartScreen {
  /**
   * Creates a new StartScreen instance.
   * @param {HTMLCanvasElement} canvas - The canvas element to draw the start screen on.
   * @param {Function} startCallback - The function to call when starting the game.
   * @param {Object} keyboard - The keyboard input handler.
   */
  constructor(canvas, startCallback, keyboard) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.startCallback = startCallback;
    this.keyboard = keyboard;
    this.startImage = new Image();
    this.startImage.src = 'img/9_intro_outro_screens/start/startscreen_2.png';

    this.showStartScreen();
  }

  /**
   * Displays the start screen image and creates the start and explanation buttons.
   * @returns {void}
   */
  showStartScreen() {
    this.startImage.onload = () => {
      this.ctx.drawImage(
        this.startImage,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.createButtons();
    };

    if (this.startImage.complete) {
      this.ctx.drawImage(
        this.startImage,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.createButtons();
    }
  }

  /**
   * Creates the start and explanation buttons and adds them to the document.
   * @returns {void}
   */
  createButtons() {
    let container = document.getElementById('startScreenButtons');
    if (!container) {
      container = document.createElement('div');
      container.id = 'startScreenButtons';
      document.body.appendChild(container);
    }

    container.innerHTML = '';

    let startButton = document.createElement('button');
    startButton.textContent = 'Spiel starten';
    startButton.className = 'explanationButton';
    startButton.addEventListener('click', () => {
      this.hideStartScreen();
      this.startCallback();
    });

    let explanationButton = document.createElement('button');
    explanationButton.textContent = 'Spielerklärung';
    explanationButton.className = 'explanationButton';
    explanationButton.addEventListener('click', () => {
      window.location.href = 'gameinstructions.html';
    });

    container.appendChild(startButton);
    container.appendChild(explanationButton);
  }

  /**
   * Hides the start screen elements and touch controls.
   * @returns {void}
   */
  hideStartScreen() {
    let container = document.getElementById('startScreenButtons');
    if (container) {
      container.parentNode.removeChild(container);
    }

    let touchControls = document.getElementById('touchControls');
    if (touchControls) {
      touchControls.style.display = 'none';
    }
  }
}
