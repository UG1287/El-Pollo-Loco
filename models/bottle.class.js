class Bottle extends MovableObject {
    width = 60;
    height = 60;
  
    constructor(x, y) {
      super().loadImage('img/6_salsa_bottle/1_salsa_bottle_on_ground.png');
      this.x = x;
      this.y = y;
    }
  }  