export default {
  state : {
    isCountdownOver : false
  },
  mutations : {
    setCountdownOver(state, isOver) {
      state.isCountdownOver = isOver;
    }
  }
};
