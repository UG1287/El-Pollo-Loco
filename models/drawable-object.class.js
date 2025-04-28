class DrawableObject {
  img;
  imageCache = {};
  currentImage = 0;
  x = 120;
  y = 230;
  height = 150;
  width = 100;

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
    this.imageCache[path] = this.img;
  }

  loadImages(arr) {
    arr.forEach(path => {
      let img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  draw(ctx) {
    if (this.img) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
  }

  drawFrame(ctx) {
   /* ctx.beginPath();
    ctx.lineWidth = '3';
    
    if (this instanceof Character) {
      const shrinkTop = 20;
      const shrinkBottom = 20;
      const reducedHeight = this.height - shrinkTop - shrinkBottom;
  
      ctx.strokeStyle = 'red'; // andere Farbe für echte Hitbox
      ctx.rect(this.x, this.y + shrinkTop, this.width, reducedHeight);
    } else {
      ctx.strokeStyle = 'blue';
      ctx.rect(this.x, this.y, this.width, this.height);
    }
  
    ctx.stroke();*/
  }
  
  

  playAnimation(images) {
    if (!images || images.length === 0) return;

    let index = this.currentImage % images.length;
    let path = images[index];
    this.img = this.imageCache[path];
    this.currentImage++;
  }
}
