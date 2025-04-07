function createLevel1() {
  return new Level(
  [new Chicken(), new Chicken(), new Chicken(), new Endboss(2500)],
  [new Cloud()],
  [
    new BackgroundObject('img/5_background/layers/air.png', -719),
    new BackgroundObject('img/5_background/layers/3_third_layer/2.png', -719),
    new BackgroundObject('img/5_background/layers/2_second_layer/2.png', -719),
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
  ],
  [
    new Coin(200, 250),
    new Coin(400, 220),
    new Coin(600, 280),
    new Coin(800, 240),
    new Coin(1000, 300),
    new Coin(1200, 250),
    new Coin(1400, 200),
    new Coin(1600, 260),
    new Coin(1800, 230),
    new Coin(2000, 280)
  ],
  [
    new Bottle(300, 150), // Flaschen hinzugefügt
    new Bottle(700, 150),
    new Bottle(1100, 150)
  ]
)};
