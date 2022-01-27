export default {
  state : {
    isLoading : false,
    hasLoaded : false,
    isTransitioning : false,
    transitionState : {
      isTransitioning : false,
      targetPage : '',
      next : null
    }
  },
  getters : {
    getNext : state => state.transitionState.next
  },
  mutations : {
    setLoaderState(state, isLoading) {
      state.isLoading = isLoading;
    },
    setHasLoaded(state, hasLoaded) {
      state.hasLoaded = hasLoaded;
    },
    setTransitionState(state, { isTransitioning, toPage = null, next }) {
      state.transitionState.isTransitioning = isTransitioning;
      state.transitionState.targetPage = toPage;
      state.transitionState.next = next;
    }
  }
};
