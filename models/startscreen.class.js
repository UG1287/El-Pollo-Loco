class StartScreen {
  constructor(canvas, startCallback, keyboard) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.startCallback = startCallback;
    this.keyboard = keyboard;
    this.startImage = new Image();
    this.startImage.src = "img/9_intro_outro_screens/start/startscreen_2.png"; // Dein Startbild

    this.showStartScreen();
    this.setupKeyListener();
  }

  showStartScreen() {
    // Zeichne das Bild erst, wenn es geladen ist
    this.startImage.onload = () => {
      // Zeichne Bild fullscreen
      this.ctx.drawImage(
        this.startImage,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      // Overlay-Text: „Enter Taste drücken + Erklärung“
      this.ctx.fillStyle = "black";
      this.ctx.font = "18px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "Press ENTER to start",
        this.canvas.width / 2,
        this.canvas.height * 0.92
      );

      // Kleinere Erklärung der Tasten
      this.ctx.font = "15px Arial";
      this.ctx.fillText(
        "\nPfeiltasten: Laufen\nSPACE: Springen\nD: Flasche werfen\nF: Fullscreen\nM: Mute Sounds",
        this.canvas.width / 2,
        this.canvas.height * 0.98
      );
    };
  }

  setupKeyListener() {
    // Prüfe alle 100ms, ob ENTER gedrückt ist
    setInterval(() => {
      if (this.keyboard && this.keyboard.ENTER) {
        this.startCallback(); // Startet das Spiel
      }
    }, 25);
  }
}
