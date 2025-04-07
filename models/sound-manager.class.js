class SoundManager {
  constructor() {
    this.sounds = {};
    this.muted = false;
    this.loadSounds();
  }

  async loadSounds() {
    try {
      const response = await fetch('audio/audioAssets.json');
      const audioData = await response.json();

      for (const [key, path] of Object.entries(audioData)) {
        this.sounds[key] = new Audio(path);
        this.sounds[key].volume = 0.7;
      }

      this.sounds['background'].loop = true;
    } catch (error) {
      console.error('Error loading audio assets:', error);
    }
  }

  playSound(name) {
    if (!this.muted && this.sounds[name]) {
      this.sounds[name].currentTime = 0;
      this.sounds[name].play();
    }
  }

  playBackgroundMusic() {
    if (!this.muted && this.sounds['background']) {
      this.sounds['background'].play();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.sounds['background'].pause();
    } else {
      this.playBackgroundMusic();
    }
  }

  stopBackgroundMusic() {
    if (this.sounds['background']) {
      this.sounds['background'].pause();
      this.sounds['background'].currentTime = 0;
    }
  }

  stopAllSounds() {
    for (const soundKey in this.sounds) {
      let audio = this.sounds[soundKey];
      audio.pause();
      audio.currentTime = 0; // Zurückspulen, falls du möchtest, dass beim nächsten Start bei 0 abgespielt wird
    }
  }
}
