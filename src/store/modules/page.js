export default {
  state : {
    scrollTop : 0
  },
  mutations : {
    setPageScrollTop(state, top) {
      state.scrollTop = top;
    }
  }
};
