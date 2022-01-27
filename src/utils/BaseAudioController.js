import { Howler } from 'howler';

class BaseAudioController {
  constructor(sound, ids) {
	  this.ids = { ...ids };
	  this.currentSoundIds = [];
    this.sound = sound;
    this.isMuted = false;
  }

  debug(message) {
	  import.meta.env.DEV && console.info(`AudioController: ${message}`);
  }

  play(soundId, endCallback = null) {
    try {
      this.debug(`playing ${soundId}`);
      const id = this.sound.play(soundId);
      this.currentSoundIds.push(id);
      if (endCallback) {
        this.sound.once(
          'end',
          endCallback,
          id
        );
      }
      return id;
    }
    catch (error) {
      console.error(error.message);
      return null;
    }
  }

  setVolume(soundId, volume) {
    this.sound.volume(volume, soundId);
  }

  fadeInAmbient(soundId, duration = 2000) {
    this.sound.volume(0.0);
    const id = this.sound.play(soundId);
    this.debug(`fading in ${soundId} (${id})`);
    this.currentSoundIds.push(id);
    this.sound.once(
      'play',
      () => {
        this.sound.fade(0.0, 0.5, duration);
      },
      id
    );
    return id;
  }

  fadeOutAmbient(id, duration = 2000) {
	  this.debug(`fading out ${id} with duration: ${duration}`);
	  this.sound.fade(this.sound.volume(), 0.0, duration, id);
	  this.sound.once(
		  'fade',
      (id) => {
		    this.sound.stop(id);
      }
    );
  }

  transitionAmbientToFrom(
    soundToString,
    soundFromId,
    duration = 2000
  ) {
    const toId = this.sound.play(soundToString);
	  this.debug(`transitioning from ${soundFromId} to ${soundToString} (${toId})`);
    this.currentSoundIds.push(toId);
    this.sound.volume(0.0, toId);
    this.sound.once(
      'play',
      () => {
        const fromVolume = this.sound.volume();
        this.sound.fade(0.0, 0.5, duration, toId);
        this.sound.fade(fromVolume, 0.0, duration, soundFromId);
      },
      toId
    );
    this.sound.once(
		  'fade',
      () => {
		    this.sound.stop(soundFromId);
      }
    );
    return toId;
  }

  setMute(setTo) {
    Howler.mute(setTo);
    this.isMuted = setTo;
  }

  setSoftMute(setSoftMute) {
    if (!this.isMuted) {
      Howler.mute(setSoftMute);
    }
  }

  toggleMute() {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  disposeAudioController() {
    Howler.unload();
    this.sound = null;
  }

  stop(soundId) {
	  this.debug(`stopping ${soundId}`);
    this.sound.stop(soundId);
  }

  get soundInstance() {
    return this.sound;
  }

  get isAudioPlaying() {
    return this.sound.playing();
  }

  stopAllSounds() {
	  this.debug('stopping all sounds');
	  this.currentSoundIds.forEach(id => this.sound.stop(id));
	  this.currentSoundIds = [];
  }
}

export default BaseAudioController;
