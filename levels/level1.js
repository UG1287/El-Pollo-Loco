/**
 * Creates and returns the first level of the game.
 * Initializes enemies, clouds, background objects, coins, and bottles.
 * @returns {Level} The constructed Level instance.
 */
function createLevel1() {
  return new Level(
    [
      new Chicken(300),
      new Chicken(400),
      new Chicken(500),
      new SmallChicken(600),
      new Chicken(1000),
      new Chicken(1100),
      new Chicken(1400),
      new SmallChicken(1500),
      new Endboss(2500),
    ],
    [new Cloud()],
    [
      new BackgroundObject('img/5_background/layers/air.png', -719),
      new BackgroundObject('img/5_background/layers/3_third_layer/2.png', -719),
      new BackgroundObject(
        'img/5_background/layers/2_second_layer/2.png',
        -719
      ),
      new BackgroundObject('img/5_background/layers/1_first_layer/2.png', -719),

      new BackgroundObject('img/5_background/layers/air.png', 0),
      new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 0),
      new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 0),
      new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 0),

      new BackgroundObject('img/5_background/layers/air.png', 719),
      new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 719),
      new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 719),
      new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 719),

      new BackgroundObject('img/5_background/layers/air.png', 719 * 2),
      new BackgroundObject(
        'img/5_background/layers/3_third_layer/1.png',
        719 * 2
      ),
      new BackgroundObject(
        'img/5_background/layers/2_second_layer/1.png',
        719 * 2
      ),
      new BackgroundObject(
        'img/5_background/layers/1_first_layer/1.png',
        719 * 2
      ),

      new BackgroundObject('img/5_background/layers/air.png', 719 * 3),
      new BackgroundObject(
        'img/5_background/layers/3_third_layer/2.png',
        719 * 3
      ),
      new BackgroundObject(
        'img/5_background/layers/2_second_layer/2.png',
        719 * 3
      ),
      new BackgroundObject(
        'img/5_background/layers/1_first_layer/2.png',
        719 * 3
      ),

      new BackgroundObject('img/5_background/layers/air.png', 719 * 4),
      new BackgroundObject(
        'img/5_background/layers/3_third_layer/1.png',
        719 * 4
      ),
      new BackgroundObject(
        'img/5_background/layers/2_second_layer/1.png',
        719 * 4
      ),
      new BackgroundObject(
        'img/5_background/layers/1_first_layer/1.png',
        719 * 4
      ),
    ],
    [
      new Coin(200, 160),
      new Coin(400, 200),
      new Coin(600, 160),
      new Coin(800, 160),
      new Coin(1000, 160),
      new Coin(1200, 200),
      new Coin(1400, 160),
      new Coin(1600, 200),
      new Coin(1800, 160),
    ],
    [
      new Bottle(300, 370),
      new Bottle(450, 370),
      new Bottle(750, 370),
      new Bottle(850, 370),
      new Bottle(1000, 370),
      new Bottle(1100, 370),
      new Bottle(1200, 370),
    ]
  );
}
