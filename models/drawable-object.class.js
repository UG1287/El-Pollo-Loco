/**
 * Represents a drawable object in the game, handling image loading and rendering.
 */
class DrawableObject {
  img;
  imageCache = {};
  currentImage = 0;
  x = 120;
  y = 230;
  height = 150;
  width = 100;

  /**
   * Loads a single image and stores it in the image cache.
   * @param {string} path - The path to the image file.
   * @returns {void}
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
    this.imageCache[path] = this.img;
  }

  /**
   * Loads multiple images and stores them in the image cache.
   * @param {string[]} arr - Array of image file paths.
   * @returns {void}
   */
  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  /**
   * Draws the current image onto the canvas.
   * @param {CanvasRenderingContext2D} ctx - The drawing context of the canvas.
   * @returns {void}
   */
  draw(ctx) {
    if (this.img) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
  }

  /**
   * Plays an animation by cycling through an array of images.
   * @param {string[]} images - Array of image file paths for the animation frames.
   * @returns {void}
   */
  playAnimation(images) {
    if (!images || images.length === 0) return;
    let index = this.currentImage % images.length;
    let path = images[index];
    this.img = this.imageCache[path];
    this.currentImage++;
  }
}
