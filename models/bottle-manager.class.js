/**
 * Handles creation and collision logic for throwable bottles.
 * @class
 */
class BottleManager {
  /**
   * @param {Object} world - Current game world instance.
   */
  constructor(world) {
    this.world = world;
    this.lastThrow = 0;
  }

  /**
   * Attempts to throw a bottle if allowed by cooldown and inventory.
   * @returns {void}
   */
  tryThrowBottle() {
    if (!this.canThrow()) return;
    this.spawnBottle();
    this.afterThrow();
  }

  /**
   * Checks whether the cooldown has passed and the character still owns bottles.
   * @private
   * @returns {boolean}
   */
  canThrow() {
    return (
      Date.now() - this.lastThrow >= 150 && this.world.character.hasBottles()
    );
  }

  /**
   * Creates a new {@link ThrowableObject} and deducts one bottle from the character.
   * @private
   * @returns {void}
   */
  spawnBottle() {
    const dir = this.world.character.otherDirection ? -1 : 1;
    const bottle = new ThrowableObject(
      this.world.character.x + 50 * dir,
      this.world.character.y + 100,
      dir
    );
    this.world.throwableObjects.push(bottle);
    this.world.character.useBottle();
  }

  /**
   * Updates UI feedback, plays sound and resets the cooldown timer.
   * @private
   * @returns {void}
   */
  afterThrow() {
    this.world.bottleStatusBar.setValue(
      this.world.character.bottleCount,
      this.world.totalBottles
    );
    this.world.soundManager.playSound('throw');
    this.lastThrow = Date.now();
  }

  /**
   * Iterates over all active bottles and resolves collisions with enemies.
   * @returns {void}
   */
  checkBottleCollisions() {
    this.world.throwableObjects.forEach((b, i) => {
      if (this.handleBottleCollision(b, i)) i--;
    });
  }

  /**
   * Detects and applies effects for a single bottle–enemy collision.
   * @private
   * @param {ThrowableObject} bottle
   * @param {number} index - Array index of the bottle to potentially remove.
   * @returns {boolean} True if the bottle was removed.
   */
  handleBottleCollision(bottle, index) {
    for (const enemy of this.world.level.enemies) {
      if (!bottle.isColliding(enemy)) continue;
      this.applyBottleHit(enemy);
      this.world.throwableObjects.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Applies damage or kill logic based on the enemy type for a bottle hit.
   * @private
   * @param {Enemy} enemy
   */
  applyBottleHit(enemy) {
    if (enemy instanceof Endboss) {
      enemy.takeDamage();
      if (enemy.isDead() && !this.world.gameOver)
        setTimeout(() => this.world.showVictoryScreen(), 1500);
    } else enemy.die();
    this.world.soundManager.playSound('bottle_break');
  }
}
