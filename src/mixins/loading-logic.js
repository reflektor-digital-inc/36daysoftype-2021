import { nextTick } from 'vue';
import { mapMutations, mapState } from 'vuex';

export default {
  created() {
    if (!this.hasLoaded) {
      this.setLoaderState(true);
    }
  },
  data() {
    return {
      prevRoute : null
    };
  },
  provide() {
    this.loadingPromises = [];
    return {
      loadingPromises : this.loadingPromises
    };
  },
  mounted() {
    nextTick(async () => {
      await Promise.all(this.loadingPromises);
      this.setLoaderState(false);
    });
  },
  beforeUnmount() {
    this.loadingPromises = null;
  },
  computed : {
    ...mapState({ hasLoaded : state => state.loader.hasLoaded })
  },
  methods : {
    ...mapMutations({
      setLoaderState : 'loader/setLoaderState'
    }),
    createNewLoadingPromise() {
      let resolve = null;
      const promise = new Promise((res) => {
        resolve = res;
      });
      this.loadingPromises.push(promise);
      return resolve;
    }
  }
};
