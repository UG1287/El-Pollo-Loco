/**
 * Represents a collectible coin in the game.
 * Inherits from MovableObject.
 */
class Coin extends MovableObject {
  width = 80;
  height = 80;
  floatingHeight = 10;
  floatingSpeed = 0.05;
  baseY;

  /**
   * Creates a new Coin instance at the specified position
   * and starts the floating animation.
   * @param {number} x - The horizontal position of the coin.
   * @param {number} y - The vertical position of the coin.
   */
  constructor(x, y) {
    super().loadImage('img/8_coin/coin_1.png');
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.hitbox = { top: 20, bottom: 20, left: 20, right: 20 };
    this.animate();
  }

  /**
   * Animates the coin by making it float up and down smoothly.
   * @returns {void}
   */
  animate() {
    setInterval(() => {
      this.y = this.baseY + Math.sin(Date.now() * 0.002) * this.floatingHeight;
    }, 1000 / 60);
  }

  
}
