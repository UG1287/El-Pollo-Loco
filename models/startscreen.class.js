class StartScreen {
  constructor(canvas, startCallback, keyboard) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.startCallback = startCallback;
    this.keyboard = keyboard;
    this.startImage = new Image();
    this.startImage.src = 'img/9_intro_outro_screens/start/startscreen_2.png'; // Dein Startbild

    this.showStartScreen();
    // Die Keylistener-Logik wird hier nicht mehr benötigt, da wir Buttons verwenden.
  }

  showStartScreen() {
    // Zeichne das Bild, sobald es geladen ist
    this.startImage.onload = () => {
      this.ctx.drawImage(
        this.startImage,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      // Nach dem Laden des Bildes werden die Buttons erstellt
      this.createButtons();
    };

    // Falls das Bild bereits geladen ist, gleich Buttons erzeugen
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
    // Prüfe, ob ein Container für die Buttons existiert – ansonsten neu anlegen
    let container = document.getElementById('startScreenButtons');
    if (!container) {
      container = document.createElement('div');
      container.id = 'startScreenButtons';
      // Container als Overlay über dem Canvas platzieren
      container.style.position = 'absolute';
      container.style.top = '50%';
      container.style.left = '50%';
      container.style.transform = 'translate(-50%, -50%)';
      container.style.zIndex = '1001';
      document.body.appendChild(container);
    }

    // Bestehenden Inhalt löschen (falls vorhanden)
    container.innerHTML = '';

    // Erstelle den "Spiel starten"-Button
    const startButton = document.createElement('button');
    startButton.textContent = 'Spiel starten';
    startButton.className = 'explanationButton'; // Nutze deine bestehende CSS-Klasse oder passe sie an
    startButton.addEventListener('click', () => {
      this.hideStartScreen();
      this.startCallback(); // Startet das Spiel
    });

    // Erstelle den "Spielerklärung"-Button
    const explanationButton = document.createElement('button');
    explanationButton.textContent = 'Spielerklärung';
    explanationButton.className = 'explanationButton';
    explanationButton.addEventListener('click', () => {
      window.location.href = 'gameinstructions.html';
    });

    // Füge beide Buttons dem Container hinzu
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
