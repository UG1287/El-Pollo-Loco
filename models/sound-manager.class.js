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
      try {
        this.sounds[name].currentTime = 0;
        this.sounds[name].play().catch((e) => {
          console.warn(`Sound "${name}" konnte nicht abgespielt werden:`, e);
        });
      } catch (e) {
        console.warn(`Fehler beim Start von "${name}":`, e);
      }
    }
  }

  playBackgroundMusic() {
    const bg = this.sounds['background'];
    if (!bg || this.muted) return;

    if (!bg.paused) bg.pause();
    bg.currentTime = 0;

    bg.play().catch((e) =>
      console.warn('Hintergrundmusik konnte nicht abgespielt werden:', e)
    );
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
    const bg = this.sounds['background'];
    if (!bg) return;
    bg.pause();
    bg.currentTime = 0;
  }

  stopAllSounds() {
    for (const soundKey in this.sounds) {
      let audio = this.sounds[soundKey];
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {
        console.warn(`Fehler beim Stoppen von "${soundKey}":`, e);
      }
    }
  }

  reset() {
    this.stopAllSounds();
    this.muted = false;
  }
}
