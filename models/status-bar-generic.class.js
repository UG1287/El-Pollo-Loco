/**
 * Represents a generic status bar (health, coins, bottles) for the game UI.
 * Dynamically sets images and values based on type.
 * Inherits from DrawableObject.
 */
class StatusBarGeneric extends DrawableObject {
  static IMAGE_PATHS = {
    health: [
      'img/7_statusbars/1_statusbar/2_statusbar_health/orange/0.png',
      'img/7_statusbars/1_statusbar/2_statusbar_health/orange/20.png',
      'img/7_statusbars/1_statusbar/2_statusbar_health/orange/40.png',
      'img/7_statusbars/1_statusbar/2_statusbar_health/orange/60.png',
      'img/7_statusbars/1_statusbar/2_statusbar_health/orange/80.png',
      'img/7_statusbars/1_statusbar/2_statusbar_health/orange/100.png',
    ],
    coin: [
      'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
      'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
      'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
      'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
      'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
      'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png',
    ],
    bottle: [
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png',
    ],
  };

  /**
   * Creates a new StatusBarGeneric instance.
   * @param {string} type - One of 'health', 'coin', or 'bottle'.
   * @param {number} x - The x-position of the status bar.
   * @param {number} y - The y-position of the status bar.
   * @param {number} [initial=0] - Initial value (percentage or count).
   */
  constructor(type, x, y, initial = 0) {
    super();
    this.x = x;
    this.y = y;
    this.width = 180;
    this.height = 60;
    this.IMAGES = StatusBarGeneric.IMAGE_PATHS[type] || [];
    this.loadImages(this.IMAGES);
    this.setValue(initial, 1);
  }

  /**
   * Updates the status bar image based on the given value and total.
   * @param {number} current - Current collected or remaining amount.
   * @param {number} total - Total possible amount.
   * @returns {void}
   */
  setValue(current, total) {
    if (total === 0) return;
    const percentage = (current / total) * 100;
    this.loadImage(this.IMAGES[this.resolveImageIndex(percentage)]);
  }

  /**
   * Updates the health bar directly by percentage (0–100).
   * @param {number} percentage - Health percentage to display.
   * @returns {void}
   */
  setPercentage(percentage) {
    this.loadImage(this.IMAGES[this.resolveImageIndex(percentage)]);
  }

  /**
   * Determines the correct image index based on a percentage.
   * @param {number} percentage - Value between 0 and 100.
   * @returns {number} Index of the image to use.
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
