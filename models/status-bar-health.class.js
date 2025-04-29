/**
 * Represents the health status bar of the character.
 * Inherits from DrawableObject.
 */
class StatusBar extends DrawableObject {
  IMAGES = [
    'img/7_statusbars/1_statusbar/2_statusbar_health/orange/0.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/orange/20.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/orange/40.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/orange/60.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/orange/80.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/orange/100.png',
  ];

  percentage = 100;

  /**
   * Creates a new StatusBar instance and initializes its position, size, and default image.
   */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.x = 20;
    this.y = 0;
    this.width = 180;
    this.height = 60;
    this.setPercentage(100);
  }

  /**
   * Updates the health status bar image based on the given percentage.
   * @param {number} percentage - The current health percentage (0 to 100).
   * @returns {void}
   */
  setPercentage(percentage) {
    this.percentage = percentage;
    let path = this.IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  /**
   * Resolves the correct image index based on the current percentage.
   * @returns {number} The index of the corresponding image in the IMAGES array.
   */
  resolveImageIndex() {
    if (this.percentage == 100) {
      return 5;
    } else if (this.percentage > 80) {
      return 4;
    } else if (this.percentage > 60) {
      return 3;
    } else if (this.percentage > 40) {
      return 2;
    } else if (this.percentage > 20) {
      return 1;
    } else {
      return 0;
    }
  }
}
