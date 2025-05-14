/**
 * Manages all sound effects and background music in the game.
 * Handles loading, playing, muting, and stopping of sounds.
 */
class SoundManager {
  /**
   * Creates a new SoundManager instance and initializes sounds and mute state.
   */
  constructor() {
    this.sounds = {};
    this.muted = false;
    this.loaded = false;
    this.userInteracted = false;
    this.lastHitSoundTime = 0;
    this.gameOver = false;
    this.loadMuteState();
    this.updateMuteIcon();
    this.loadSounds();
    this.listenForInteraction();
  }

  /**
   * Sets up listeners for user interaction events to enable sound playback.
   * @returns {void}
   */
  listenForInteraction() {
    window.addEventListener('click', () => (this.userInteracted = true), {
      once: true,
    });
    window.addEventListener('touchstart', () => (this.userInteracted = true), {
      once: true,
    });
  }

  /**
   * Loads the saved mute state from local storage.
   * @returns {void}
   */
  loadMuteState() {
    const saved = localStorage.getItem('muted');
    if (saved !== null) {
      this.muted = saved === 'true';
    }
  }

  /**
   * Saves the current mute state to local storage.
   * @returns {void}
   */
  saveMuteState() {
    localStorage.setItem('muted', this.muted);
  }

  /**
   * Loads all sounds defined in the external JSON file and stores them.
   * @returns {Promise<void>}
   */
  async loadSounds() {
    try {
      const response = await fetch('audio/audioAssets.json');
      const audioData = await response.json();
      for (const [key, path] of Object.entries(audioData)) {
        const audio = new Audio(path);
        audio.volume = this.muted ? 0 : 0.7;
        if (key === 'background') {
          audio.loop = true;
        }
        this.sounds[key] = audio;
      }
      this.loaded = true;
    } catch (error) {
      console.error('Error loading audio files:', error);
    }
  }

  /**
   * Plays a specific sound by name, respecting mute and game over states.
   * @param {string} name - The name of the sound to play.
   * @returns {Promise<void>}
   */
  async playSound(name) {
    if (this.muted || !this.sounds[name]) return;
    if (this.gameOver && name !== 'lose') return;

    const now = Date.now();

    if (name === 'hit') {
      if (now - this.lastHitSoundTime < 400) return;
      this.lastHitSoundTime = now;
    }

    const sound = this.sounds[name];

    try {
      if (name === 'background' || name === 'lose') {
        if (sound.paused && this.userInteracted) {
          await sound.play();
        }
      } else {
        const clone = sound.cloneNode(true);
        clone.volume = this.muted ? 0 : 0.7;
        await clone.play();
      }
    } catch (e) {
      console.warn(`Sound "${name}" could not be played:`, e);
    }
  }

  /**
   * Plays the background music if not muted and after user interaction.
   * @returns {Promise<void>}
   */
  async playBackgroundMusic() {
    const bg = this.sounds['background'];
    if (!bg || this.muted || !this.userInteracted) return;

    try {
      if (bg.paused) {
        await bg.play();
      }
    } catch (e) {
      console.warn('Background music could not be played:', e);
    }
  }

  /**
   * Toggles the mute state and updates all sound volumes accordingly.
   * @returns {void}
   */
  toggleMute() {
    this.muted = !this.muted;
    this.saveMuteState();

    for (const audio of Object.values(this.sounds)) {
      if (audio instanceof HTMLAudioElement) {
        audio.volume = this.muted ? 0 : 0.7;
      }
    }

    const muteBtn = document.getElementById('btnMute');
    if (muteBtn) {
      muteBtn.innerText = this.muted ? '🔇' : '🔈';
    }
    this.updateMuteIcon();

    const bg = this.sounds['background'];
    if (bg) {
      if (this.muted) {
        bg.pause();
      } else if (this.userInteracted) {
        this.playBackgroundMusic();
      }
    }
  }

  /**
   * Stops the background music and resets its playback time.
   * @returns {void}
   */
  stopBackgroundMusic() {
    const bg = this.sounds['background'];
    if (!bg) return;
    bg.pause();
    bg.currentTime = 0;
  }

  /**
   * Stops all currently playing sounds and resets their playback time.
   * @returns {Promise<void>}
   */
  async stopAllSounds() {
    for (const audio of Object.values(this.sounds)) {
      if (audio instanceof HTMLAudioElement) {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {
          console.warn('Error stopping a sound:', e);
        }
      }
    }
  }

  /**
   * Resets the sound manager to its initial state.
   * @returns {void}
   */
  reset() {
    this.stopAllSounds();
    this.loadMuteState();
    this.gameOver = false;
    this.updateMuteIcon();
  }

  /**
   * Updates the mute icon displayed in the UI.
   * @returns {void}
   */
  updateMuteIcon() {
    const icons = [
      document.getElementById('btnMuteMobile'),
      document.getElementById('btnMuteDesktop'),
    ];
    icons.forEach((btn) => {
      if (btn) btn.innerText = this.muted ? '🔇' : '🔈';
    });
  }
  
}
