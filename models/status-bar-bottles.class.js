class BottleStatusBar extends DrawableObject {
    IMAGES = [
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png'
    ];
  
    constructor() {
      super();
      this.loadImages(this.IMAGES);
      this.x = 400; // Position rechts neben der Coin-Statusbar
      this.y = 0;
      this.width = 180;
      this.height = 60;
      this.setBottles(3); // Startwert
    }
  
    setBottles(bottlesCollected, totalBottles = 10) {
      if (totalBottles === 0) {
          console.warn("⚠️ totalBottles ist 0 – Division durch 0 verhindert.");
          return;
      }
      let percentage = (bottlesCollected / totalBottles) * 100;
      let index = this.resolveImageIndex(percentage);
      let path = this.IMAGES[index];
  
      console.log(`Setze BottleStatusBar-Bild: ${path}`);
      this.loadImage(path); // ❗ Setzt das neue Bild
  }
  
  
    resolveImageIndex(percentage) {
      if (percentage >= 100) return 5;
      if (percentage >= 80) return 4;
      if (percentage >= 60) return 3;
      if (percentage >= 40) return 2;
      if (percentage >= 20) return 1;
      return 0;
    }
  }
  