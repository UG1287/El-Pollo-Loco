class Level {
  enemies;
  clouds;
  backgroundObjects;
  coins = [];
  level_end_x = 2700;
  bottles;

  constructor(enemies, clouds, backgroundObjects, coins, bottles) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgroundObjects = backgroundObjects;
    this.coins = coins;
    this.bottles = bottles;
  }
}
