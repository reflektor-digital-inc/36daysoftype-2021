export default {
  state : {
    isAboutModalOpen : false,
    isCongratulationsModalOpen : false
  },
  mutations : {
    closeAboutModal(state) {
      state.isAboutModalOpen = false;
    },
    openAboutModal(state) {
      state.isAboutModalOpen = true;
    },
    closeCongratulationsModal(state) {
      state.isCongratulationsModalOpen = false;
    },
    openCongratulationsModal(state) {
      state.isCongratulationsModalOpen = true;
    }
  }
};
