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
 * Returns an absolute URL that never inherits any username:password part of
 * the current page address ( fixes “Request cannot be constructed from a URL
 * that includes credentials” when fetch / Audio() runs).
 * @param  {string} relPath e.g. "audio/background.mp3"
 * @returns {string}        absolute URL, same origin, no credentials
 * @static
 * @private
 */
static makeUrl(relPath) {
  return new URL(relPath, window.location.origin).href;
}

  /**
   * Saves the current mute state to local storage.
   * @returns {void}
   */
  saveMuteState() {
    localStorage.setItem('muted', this.muted);
  }

  /**
 * Loads all sounds defined in `audio/audioAssets.json`.
 * @returns {Promise<void>}
 */
async loadSounds() {
  try {
    const response  = await fetch(SoundManager.makeUrl('audio/audioAssets.json'));
    const audioData = await response.json();

    for (const [key, relPath] of Object.entries(audioData)) {
      const audio = new Audio(SoundManager.makeUrl(relPath));   // ⟵ patched
      audio.volume = this.muted ? 0 : 0.7;
      if (key === 'background') audio.loop = true;
      this.sounds[key] = audio;
    }
    this.loaded = true;
  } catch (err) {
    console.error('Error loading audio files:', err);
  }
}

  /**
   * Plays a specific sound by name, respecting mute and game over states.
   * @param {string} name - The name of the sound to play.
   * @returns {Promise<void>}
   */
  async playSound(name) {
    if (!this.shouldPlaySound(name)) return;
    if (this.isHitSoundTooSoon(name)) return;

    const sound = this.sounds[name];
    try {
      await this.routeSoundPlayback(name, sound);
    } catch (e) {
      console.warn(`Sound "${name}" could not be played:`, e);
    }
  }

  /**
   * Determines if a sound should be played based on mute and game state.
   * @param {string} name
   * @returns {boolean}
   */
  shouldPlaySound(name) {
    return !(
      this.muted ||
      !this.sounds[name] ||
      (this.gameOver && name !== 'lose')
    );
  }

  /**
   * Prevents repeated hit sounds within a short interval.
   * @param {string} name
   * @returns {boolean}
   */
  isHitSoundTooSoon(name) {
    if (name !== 'hit') return false;

    const now = Date.now();
    if (now - this.lastHitSoundTime < 400) return true;

    this.lastHitSoundTime = now;
    return false;
  }

  /**
   * Routes the playback method depending on sound type.
   * @param {string} name
   * @param {HTMLAudioElement} sound
   * @returns {Promise<void>}
   */
  async routeSoundPlayback(name, sound) {
    if (name === 'background' || name === 'lose') {
      await this.playLoopedSound(sound);
    } else {
      await this.playClonedSound(sound);
    }
  }

  /**
   * Plays a looped sound (e.g., background music).
   * @param {HTMLAudioElement} sound
   * @returns {Promise<void>}
   */
  async playLoopedSound(sound) {
    if (sound.paused && this.userInteracted) {
      await sound.play();
    }
  }

  /**
   * Plays a cloned copy of a sound for overlapping playback.
   * @param {HTMLAudioElement} sound
   * @returns {Promise<void>}
   */
  async playClonedSound(sound) {
    const clone = sound.cloneNode(true);
    clone.volume = this.muted ? 0 : 0.7;
    await clone.play();
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
    this.updateAllVolumes();
    this.updateMuteButtonUI();
    this.toggleBackgroundMusic();
  }

  /**
   * Updates the volume for all loaded sounds based on mute state.
   * @returns {void}
   */
  updateAllVolumes() {
    for (const audio of Object.values(this.sounds)) {
      if (audio instanceof HTMLAudioElement) {
        audio.volume = this.muted ? 0 : 0.7;
      }
    }
  }

  /**
   * Updates the mute icon on the mute button in the UI.
   * @returns {void}
   */
  updateMuteButtonUI() {
    const muteBtn = document.getElementById('btnMute');
    if (muteBtn) {
      muteBtn.innerText = this.muted ? '🔇' : '🔈';
    }
    this.updateMuteIcon();
  }

  /**
   * Starts or stops background music depending on mute and interaction state.
   * @returns {void}
   */
  toggleBackgroundMusic() {
    const bg = this.sounds['background'];
    if (!bg) return;

    if (this.muted) {
      bg.pause();
    } else if (this.userInteracted) {
      this.playBackgroundMusic();
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
