class CoinStatusBar extends DrawableObject {
    IMAGES = [
      'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
      'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
      'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
      'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
      'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
      'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png'
    ];
  
    coinsCollected = 0;
  
    constructor() {
      super();
      this.loadImages(this.IMAGES);
      this.x = 220; // Position rechts neben der HP-Statusbar
      this.y = 0;
      this.width = 180;
      this.height = 60;
      this.setCoins(0);
    }
  
    setCoins(coinsCollected, totalCoins = 10) {
      if (totalCoins === 0) {
          console.warn("⚠️ totalCoins ist 0 – Division durch 0 verhindert.");
          return;
      }
      let percentage = (coinsCollected / totalCoins) * 100;
      let index = this.resolveImageIndex(percentage);
      let path = this.IMAGES[index];
  
      console.log(`Setze CoinStatusBar-Bild: ${path}`);
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
  