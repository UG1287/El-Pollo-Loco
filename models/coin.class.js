class Coin extends MovableObject {
    width = 100;
    height = 100;
    floatingHeight = 10;
    floatingSpeed = 0.05;
    baseY;
  
    constructor(x, y) {
      super().loadImage('img/8_coin/coin_1.png');
      this.x = x;
      this.y = y;
      this.baseY = y;
      this.animate();
    }
  
    animate() {
        setInterval(() => {
          this.y = this.baseY + Math.sin(Date.now() * 0.002) * this.floatingHeight;
        }, 1000 / 60);
      }      
  }  