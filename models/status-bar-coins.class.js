/**
 * Represents the coin collection status bar in the game UI.
 * Inherits from DrawableObject.
 */
class CoinStatusBar extends DrawableObject {
  IMAGES = [
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png',
  ];

  coinsCollected = 0;

  /**
   * Creates a new CoinStatusBar instance and initializes its position, size, and default image.
   */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.x = 220;
    this.y = 0;
    this.width = 180;
    this.height = 60;
    this.setCoins(0);
  }

  /**
   * Updates the status bar image based on the number of collected coins.
   * @param {number} coinsCollected - The number of coins collected.
   * @param {number} [totalCoins=10] - The total number of coins available (default is 10).
   * @returns {void}
   */
  setCoins(coinsCollected, totalCoins = 10) {
    if (totalCoins === 0) {
      console.warn('⚠️ totalCoins is 0 – Division by zero prevented.');
      return;
    }
    let percentage = (coinsCollected / totalCoins) * 100;
    let index = this.resolveImageIndex(percentage);
    let path = this.IMAGES[index];
    this.loadImage(path);
  }

  /**
   * Resolves the correct image index based on the percentage of coins collected.
   * @param {number} percentage - The percentage of collected coins.
   * @returns {number} The index of the corresponding image in the IMAGES array.
   */
  resolveImageIndex(percentage) {
    if (percentage >= 100) return 5;
    if (percentage >= 80) return 4;
    if (percentage >= 60) return 3;
    if (percentage >= 40) return 2;
    if (percentage >= 20) return 1;
    return 0;
  }
}
