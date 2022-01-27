export default {
  state : {
    isMarketModalOpen : false
  },
  mutations : {
    closeMarketModal(state) {
      state.isMarketModalOpen = false;
    },
    openMarketModal(state) {
      state.isMarketModalOpen = true;
    }
  }
};
