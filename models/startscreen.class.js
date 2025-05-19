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
    this.startImage.onload = () => this.drawStartScreenAndButtons();
    if (this.startImage.complete) {
      this.drawStartScreenAndButtons();
    }
  }

  /**
   * Draws the start screen and creates the buttons.
   * @returns {void}
   */
  drawStartScreenAndButtons() {
    this.drawStartImage();
    this.createButtons();
  }

  /**
   * Draws the start image on the canvas.
   * @returns {void}
   */
  drawStartImage() {
    this.ctx.drawImage(
      this.startImage,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  /**
   * Creates the start and explanation buttons and adds them to the document.
   * @returns {void}
   */
  createButtons() {
    let container = this.getOrCreateButtonContainer();
    container.innerHTML = '';
    container.appendChild(
      this.createButton('Spiel starten', () => {
        this.hideStartScreen();
        this.startCallback();
      })
    );
    container.appendChild(
      this.createButton('Spielerklärung', () => {
        window.location.href = 'gameinstructions.html';
      })
    );
  }

  /**
   * Retrieves or creates the container for the start screen buttons.
   * @returns {HTMLElement} The button container element.
   */
  getOrCreateButtonContainer() {
    let container = document.getElementById('startScreenButtons');
    if (!container) {
      container = document.createElement('div');
      container.id = 'startScreenButtons';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Creates an individual button element with text and click handler.
   * @param {string} text - The button label text.
   * @param {Function} onClick - The function to execute on click.
   * @returns {HTMLButtonElement} The created button element.
   */
  createButton(text, onClick) {
    let btn = document.createElement('button');
    btn.textContent = text;
    btn.className = 'explanationButton';
    btn.addEventListener('click', onClick);
    return btn;
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
