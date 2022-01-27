// import AudioController from '../utils/audio-controller';
import AudioSpriteController from '../utils/AudiospriteAudioController';

export default {
  install : (app) => {
    app.config.globalProperties.$sfx = AudioSpriteController;
  }
};