import { useCookies } from 'vue3-cookies';

export default {
  state : {
    letterUnlock : {}
  },
  mutations : {
    unlockEasterEgg(state, letter) {
      state.letterUnlock[letter] = true;
      const { cookies } = useCookies();

      // save cookie, expire after 6 months
      cookies.set('unlockedLetters', state.letterUnlock, 60 * 60 * 24 * 30 * 6);
    },
    updateUnlockStatus(state, value) {
      state.letterUnlock = value;
    }
  },
  getters : {
    getLetterUnlock(state) {
      return state.letterUnlock;
    }
  }
};
