class Endboss extends MovableObject {
  y = 0;
  height = 450;
  width = 300;
  speed = 1.9; // Wie schnell läuft er?
  energy = 50; // HP
  chaseRange = 1000; // Bis zu welcher Distanz soll er den Spieler „wahrnehmen“?
  minDistance = 100; // Falls er zu nah an den Player kommt, soll er evtl. Attack machen statt weiterlaufen

  IMAGES_ALERT = [
    'img/4_enemie_boss_chicken/2_alert/G5.png',
    'img/4_enemie_boss_chicken/2_alert/G6.png',
    'img/4_enemie_boss_chicken/2_alert/G7.png',
    'img/4_enemie_boss_chicken/2_alert/G8.png',
    'img/4_enemie_boss_chicken/2_alert/G9.png',
    'img/4_enemie_boss_chicken/2_alert/G10.png',
    'img/4_enemie_boss_chicken/2_alert/G11.png',
    'img/4_enemie_boss_chicken/2_alert/G12.png',
  ];
  IMAGES_ATTACK = [
    'img/4_enemie_boss_chicken/3_attack/G13.png',
    'img/4_enemie_boss_chicken/3_attack/G14.png',
    'img/4_enemie_boss_chicken/3_attack/G15.png',
    'img/4_enemie_boss_chicken/3_attack/G16.png',
    'img/4_enemie_boss_chicken/3_attack/G17.png',
    'img/4_enemie_boss_chicken/3_attack/G18.png',
    'img/4_enemie_boss_chicken/3_attack/G19.png',
    'img/4_enemie_boss_chicken/3_attack/G20.png',
  ];
  IMAGES_HURT = [
    'img/4_enemie_boss_chicken/4_hurt/G21.png',
    'img/4_enemie_boss_chicken/4_hurt/G22.png',
    'img/4_enemie_boss_chicken/4_hurt/G23.png',
  ];
  IMAGES_DEAD = [
    'img/4_enemie_boss_chicken/5_dead/G24.png',
    'img/4_enemie_boss_chicken/5_dead/G25.png',
    'img/4_enemie_boss_chicken/5_dead/G26.png',
  ];

  constructor(xPos) {
    // Startet mit ALERT-Bild
    super().loadImage('img/4_enemie_boss_chicken/2_alert/G5.png');
    this.x = xPos; // z. B. 3000 in level1.js

    this.loadImages(this.IMAGES_ALERT);
    this.loadImages(this.IMAGES_ATTACK);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);

    this.animate();
  }

  animate() {
    setInterval(() => {
      if (!this.world || this.isDead()) return;

      // Distance in X-Richtung: center(boss) - center(character)
      let bossCenter = this.x + this.width / 2;
      let charCenter = this.world.character.x + this.world.character.width / 2;
      let distX = charCenter - bossCenter;

      // chaseRange = 1000, minDistance = 40, anpassbar
      // 1) Ist Spieler im Sichtbereich?
      if (Math.abs(distX) < this.chaseRange) {
        // 2) Greift er an, oder soll er laufen?
        // Sagen wir, bei distX < 0 => Char ist links, distX > 0 => Char ist rechts
        if (Math.abs(distX) > this.minDistance) {
          // Boss bewegt sich auf Character zu
          if (distX > 0) {
            // Charakter ist rechts => Boss guckt nach rechts
            this.otherDirection = true; // Falls dein Sprite standardmäßig nach rechts "schaut"
            this.moveRight();
          } else {
            // distX < 0 => Charakter links => Boss guckt nach links
            this.otherDirection = false;
            this.moveLeft();
          }
        } else {
          // Wir sind dicht genug (distX <= minDistance) → Attack z.B.
          // ... Hier Attack-Animation oder Stillstand ...
        }
      }
    }, 1000 / 60);

    // Genauso dein Animations-Intervall wie gehabt
    setInterval(() => {
      if (this.isDead()) {
        this.playAnimation(this.IMAGES_DEAD);
      } else if (this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
      } else {
        // Attack oder Alert, je nach Abstand
        let bossCenter = this.x + this.width / 2;
        let charCenter =
          this.world.character.x + this.world.character.width / 2;
        let distX = charCenter - bossCenter;

        if (Math.abs(distX) < this.minDistance) {
          this.playAnimation(this.IMAGES_ATTACK);
        } else {
          this.playAnimation(this.IMAGES_ALERT);
        }
      }
    }, 200);
  }

  distanceToCharacter() {
    if (!this.world || !this.world.character) return Infinity;
    return Math.abs(this.x - this.world.character.x);
  }

  takeDamage() {
    this.energy -= 20;
    console.log(`Endboss hat jetzt ${this.energy} HP`);
    if (this.energy <= 0) {
      this.energy = 0;
    } else {
      // HURT-Animation => isHurt()
      this.lastHit = new Date().getTime();
    }
  }
}
