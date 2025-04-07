class DrawableObject {
  img;
  imageCache = {};
  currentImage = 0;
  x = 120;
  y = 230;
  height = 150;
  width = 100;

  loadImage(path) {
    if (this.imageCache[path]) {
      this.img = this.imageCache[path]; // Falls bereits vorgeladen, direkt setzen
      console.log('✅ Bild aus Cache geladen:', path);
    } else {
      this.img = new Image();
      this.img.src = path;

      this.img.onload = () => {
        console.log('✅ Bild erfolgreich geladen:', path);
      };

      this.img.onerror = () => {
        console.error('❌ Fehler beim Laden des Bildes:', path);
      };
    }
  }

  draw(ctx) {
    if (!this.img) {
      console.warn(`${this.constructor.name}: Kein Bild definiert!`);
      return;
    }

    if (!this.img.complete) {
      // Nur Info – kein return!
      console.log(
        `${this.constructor.name}: Bild ist noch nicht fertig, zeichnen aber trotzdem...`
      );
    }

    // Zeichnung findet IMMER statt
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  drawFrame(ctx) {
    if (this instanceof Character || this instanceof Chicken) {
      ctx.beginPath();
      ctx.lineWidth = '5';
      ctx.strokeStyle = 'blue';
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.stroke();
    }
  }

  /**
   *
   * @param {Array} arr - ['img/image1.png', 'img/image2.png', ...]
   */
  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.src = path;
      img.style = 'transform: scaleX(-1)';
      this.imageCache[path] = img;
    });
  }
}
