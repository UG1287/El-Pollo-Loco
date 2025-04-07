class ThrowableObject extends MovableObject {
    constructor(x, y, direction) {
      super().loadImage('img/6_salsa_bottle/salsa_bottle.png'); // Flaschen-Bild
      this.x = x;
      this.y = y;
      this.height = 60;
      this.width = 60;
      this.throwDirection = direction;
      this.throw();
    }
  
    throw() {
      this.speedY = 20; // Start nach oben
      this.applyGravity();
  
      let interval = setInterval(() => {
        this.x += this.throwDirection * 10; // Bewegt sich in Blickrichtung
        console.log(`Flasche bewegt sich: x=${this.x}, y=${this.y}`); // Debugging
      }, 25);
  
      setTimeout(() => clearInterval(interval), 2000); // Stoppt nach 2 Sekunden
    }
  }
  