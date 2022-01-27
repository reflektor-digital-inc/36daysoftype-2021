import { mapState, mapMutations } from 'vuex';
import Hotkeys from 'hotkeys-js';
import _throttle from 'lodash/throttle';

export default {
  created() {
    this.throttleWindowResizeHandler = _throttle(this.handleWindowResize, 150, {
      trailing : true
    });

    this.eventListeners = [
      {
        name : 'resize',
        handler : this.throttleWindowResizeHandler,
        options : {}
      }
    ];

    if (!import.meta.env.SSR) {
      this.calculateWindowSize(window);
    }
  },
  computed : {
    ...mapState({
      walletChainId : state => state.nft.wallet.chainId,
      walletConnected : state => state.nft.wallet.connected,
      walletSupportedChainId : state => state.nft.wallet.supportedChainId
    })
  },
  watch : {
    '$route'(route) {
      this.setIframeState(route.query.iframe === '1');
    },
    walletChainId(value) {
      this.setWalletNetworkUnsupported(this.walletConnected && value !== this.walletSupportedChainId);
    }
  },
  mounted() {
    Hotkeys('t', this.handleTweakToggle);
    this.addEventListeners();
  },
  unmounted() {
    Hotkeys.unbind('t', this.handleTweakToggle);
    this.removeEventListeners();
  },
  methods : {
    ...mapMutations({
      calculateWindowSize : 'windowSize/calculateWindowSize',
      setIframeState : 'overlays/setIframeState',
      setWalletNetworkUnsupported : 'nft/setWalletNetworkUnsupported'
    }),
    addEventListeners() {
      this.eventListeners.map(({ name, handler, options }) => {
        window.addEventListener(name, handler, options);
      });
    },
    removeEventListeners() {
      this.eventListeners.map(({ name, handler, options }) => {
        window.removeEventListener(name, handler, options);
      });
    },
    handleWindowResize(event) {
      this.calculateWindowSize(event.target);
    },
    handleTweakToggle() {
      this.$tweakpane.hidden = !this.$tweakpane.hidden;
    }
  }
};
