export default {
  state : {
    isInfoOverlayOpen : false,
    isNavigationOverlayOpen : false,
    isIframe : false
  },
  mutations : {
    closeInfoOverlay(state) {
      state.isInfoOverlayOpen = false;
    },
    openInfoOverlay(state) {
      state.isInfoOverlayOpen = true;
    },
    openNavigationOverlay(state) {
      state.isNavigationOverlayOpen = true;
    },
    closeNavigationOverlay(state) {
      state.isNavigationOverlayOpen = false;
    },
    setIframeState(state, value) {
      state.isIframe = value;
    }
  }
};
