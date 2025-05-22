/**
 * Manages collisions between the main character and enemies.
 * @class
 */
class CollisionManager {
  /**
   * @param {Object} world - Current game world instance providing state and helpers.
   */
  constructor(world) {
    this.world = world;
  }

  /**
   * Checks and resolves collisions for all enemies in the current level.
   * - Stomps if the character hits an enemy from above.
   * - Inflicts damage on the character for side collisions.
   * @returns {void}
   */
  checkCollisions() {
    if (this.world.gameOver) return;
    this.world.level.enemies.forEach((e) => {
      if (this.shouldSkip(e)) return;
      this.handleCollision(e);
    });
  }

  /**
   * Determines whether collision checks can be skipped for a given enemy.
   * @private
   * @param {Enemy} enemy
   * @returns {boolean}
   */
  shouldSkip(enemy) {
    return enemy.energy === 0 || !this.world.character.isColliding(enemy);
  }

  /**
   * Delegates collision handling to the appropriate action (stomp / hit).
   * @private
   * @param {Enemy} enemy
   */
  handleCollision(enemy) {
    const bottom = this.world.character.y + this.world.character.height;
    const overlap = bottom - enemy.y;
    this.isStomp(overlap) ? this.doStomp(enemy) : this.doHit(enemy);
  }

  /**
   * Calculates whether the collision should be treated as a stomp.
   * @private
   * @param {number} overlap - Pixel overlap between character bottom and enemy top.
   * @returns {boolean}
   */
  isStomp(overlap) {
    return this.world.character.speedY < 0 && overlap > 0 && overlap < 40;
  }

  /**
   * Applies stomp damage: enemy dies, character bounces up.
   * @private
   * @param {Enemy} enemy
   */
  doStomp(enemy) {
    this.world.character.speedY = 15;
    enemy.energy = 0;
    enemy.die();
  }

  /**
   * Applies regular hit damage to the character.
   * @private
   * @param {Enemy} enemy
   */
  doHit(enemy) {
    if (this.world.character.isHurt()) return;
    const dmg = enemy instanceof Endboss ? 20 : 5;
    this.world.character.energy -= dmg;
    this.world.character.hit();
    this.world.statusBar.setPercentage(this.world.character.energy);
    if (this.world.character.energy === 0 && !this.world.gameOver)
      setTimeout(() => {
        this.world.gameOver = true;
        this.world.showGameOverScreen();
      }, 1500);
  }
}
