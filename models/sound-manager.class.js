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
        const a = new Audio(path);
        a.volume = 0.7;
        a.loop = key === 'background';
        a.muted = this.muted;
        this.sounds[key] = a;
      }
    } catch (err) {
      console.error('Error loading audio assets:', err);
    }
  }

  playSound(name) {
    const a = this.sounds[name];
    if (!a) return;

    try {
      a.currentTime = 0;
      a.play().catch(e =>
        console.warn(`Sound "${name}" konnte nicht abgespielt werden:`, e)
      );
    } catch (e) {
      console.warn(`Fehler beim Start von "${name}":`, e);
    }
  }

  playBackgroundMusic() {
    const bg = this.sounds['background'];
    if (!bg) return;

    bg.pause();
    bg.currentTime = 0;
    bg.play().catch(e =>
      console.warn('Hintergrundmusik konnte nicht abgespielt werden:', e)
    );
  }

  toggleMute() {
    this.muted = !this.muted;
    Object.values(this.sounds).forEach(a => (a.muted = this.muted));
    if (!this.muted) this.playBackgroundMusic();
  }

  stopBackgroundMusic() {
    const bg = this.sounds['background'];
    if (!bg) return;
    bg.pause();
    bg.currentTime = 0;
  }

  stopAllSounds() {
    Object.values(this.sounds).forEach(a => {
      a.pause();
      a.currentTime = 0;
    });
  }

  reset() {
    this.stopAllSounds();
  }
}
