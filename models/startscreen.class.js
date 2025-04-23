class StartScreen {
  constructor(canvas, startCallback, keyboard) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.startCallback = startCallback;
    this.keyboard = keyboard;
    this.startImage = new Image();
    this.startImage.src = 'img/9_intro_outro_screens/start/startscreen_2.png';

    this.showStartScreen();
  }

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

  createButtons() {
    let container = document.getElementById('startScreenButtons');
    if (!container) {
      container = document.createElement('div');
      container.id = 'startScreenButtons';
      container.style.position = 'absolute';
      container.style.top = '50%';
      container.style.left = '50%';
      container.style.transform = 'translate(-50%, -50%)';
      container.style.zIndex = '1001';
      document.body.appendChild(container);
    }

    container.innerHTML = '';

    const startButton = document.createElement('button');
    startButton.textContent = 'Spiel starten';
    startButton.className = 'explanationButton';
    startButton.addEventListener('click', () => {
      this.hideStartScreen();
      this.startCallback();
    });

    const explanationButton = document.createElement('button');
    explanationButton.textContent = 'Spielerklärung';
    explanationButton.className = 'explanationButton';
    explanationButton.addEventListener('click', () => {
      window.location.href = 'gameinstructions.html';
    });

    container.appendChild(startButton);
    container.appendChild(explanationButton);
  }

  hideStartScreen() {
    const container = document.getElementById('startScreenButtons');
    if (container) {
      container.parentNode.removeChild(container);
    }

    const touchControls = document.getElementById('touchControls');
    if (touchControls) {
      touchControls.style.display = 'none';
    }
  }
}
