class SoundManager {
  constructor() {
    this.sounds = {};
    this.muted = false;
    this.loaded = false;
    this.userInteracted = false;
    this.loadSounds();
    this.listenForInteraction();
  }

  listenForInteraction() {
    window.addEventListener('click', () => this.userInteracted = true, { once: true });
    window.addEventListener('touchstart', () => this.userInteracted = true, { once: true });
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
      this.loaded = true;
    } catch (error) {
      console.error('Fehler beim Laden der Audio-Dateien:', error);
    }
  }

  async playSound(name) {
    if (!this.muted && this.sounds[name]) {
      try {
        const audio = this.sounds[name];
        audio.pause();
        audio.currentTime = 0;
        await audio.play();
      } catch (e) {
        console.warn(`Sound "${name}" konnte nicht abgespielt werden:`, e);
      }
    }
  }

  async playBackgroundMusic() {
    const bg = this.sounds['background'];
    if (!bg || this.muted || !this.userInteracted) return;

    try {
      if (!bg.paused) bg.pause();
      bg.currentTime = 0;
      await bg.play();
    } catch (e) {
      console.warn('Hintergrundmusik konnte nicht abgespielt werden:', e);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    for (const audio of Object.values(this.sounds)) {
      audio.volume = this.muted ? 0 : 0.7;
    }
  }

  stopBackgroundMusic() {
    const bg = this.sounds['background'];
    if (!bg) return;
    bg.pause();
    bg.currentTime = 0;
  }

  stopAllSounds() {
    for (const audio of Object.values(this.sounds)) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {
        console.warn('Fehler beim Stoppen eines Sounds:', e);
      }
    }
  }

  reset() {
    this.stopAllSounds();
    this.muted = false;
  }
}
