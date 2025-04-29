/**
 * Represents the bottle collection status bar in the game UI.
 * Inherits from DrawableObject.
 */
class BottleStatusBar extends DrawableObject {
  IMAGES = [
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png',
  ];

  /**
   * Creates a new BottleStatusBar instance and initializes its position, size, and default image.
   */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.x = 400;
    this.y = 0;
    this.width = 180;
    this.height = 60;
    this.setBottles(0, 1);
  }

  /**
   * Updates the status bar image based on the number of collected bottles.
   * @param {number} bottlesCollected - The number of bottles collected.
   * @param {number} totalBottles - The total number of bottles available.
   * @returns {void}
   */
  setBottles(bottlesCollected, totalBottles) {
    if (totalBottles === 0) {
      console.warn('⚠️ totalBottles is 0 – Division by zero prevented.');
      return;
    }
    let percentage = (bottlesCollected / totalBottles) * 100;
    let index = this.resolveImageIndex(percentage);
    let path = this.IMAGES[index];
    this.loadImage(path);
  }

  /**
   * Resolves the correct image index based on the percentage of bottles collected.
   * @param {number} percentage - The percentage of collected bottles.
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
