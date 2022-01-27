import { mapState } from 'vuex';

export default {
  data() {
    return {
      isLandscapeView : false
    };
  },
  computed : {
    ...mapState({
      windowWidth : state => state.windowSize.width,
      windowHeight : state => state.windowSize.height
    })
  },
  mounted() {
    try {
      if (this.$data.$_device.isPhone) {
        this.mediaQueryLandscape = window.matchMedia('(orientation: landscape)');
        this.setUpEventListeners();
        this.isLandscapeView = (
          this.getScreenOrientationAngle() !== 0 &&
          this.windowHeight < 1025 &&
          this.windowWidth < 1025
        );
      }
    }
    catch (error) {
      console.error('mounted error:', error.message);
    }
  },
  beforeDestroy() {
    (this.hasAddedEventListeners && this.destroyEventListeners());
  },
  methods : {
    setUpEventListeners() {
      window.addEventListener('orientationchange', this.handleDeviceOrientationChange);

      if (this.mediaQueryLandscape.addEventListener) {
        this.mediaQueryLandscape.addEventListener('change', this.handleMediaQueryChange);
      }

      if (this.mediaQueryLandscape.addListener) {
        this.mediaQueryLandscape.addListener(this.handleMediaQueryChange);
      }

      this.hasAddedEventListeners = true;
    },
    destroyEventListeners() {
      window.removeEventListener('orientationchange', this.handleDeviceOrientationChange);

      if (this.mediaQueryLandscape.removeEventListener) {
        this.mediaQueryLandscape.removeEventListener('change', this.handleMediaQueryChange);
      }

      if (this.mediaQueryLandscape.removeListener) {
        this.mediaQueryLandscape.removeListener(this.handleMediaQueryChange);
      }
    },
    getScreenOrientationAngle() {
      return (
        ('orientation' in window && window.orientation) ||
        ('screen' in window && window.screen.orientation && window.screen.orientation.angle) ||
        0
      );
    },
    handleMediaQueryChange(event) {
      this.isLandscapeView = (
        event.matches &&
        this.windowHeight < 1025 &&
        this.windowWidth < 1025
      );
    },
    handleDeviceOrientationChange(event) {
      try {
        const screen = this.$_get(event, 'target.screen', {});
        const orientation = this.$_get(event, 'target.orientation');

        if ('orientation' in screen) {
          this.isLandscapeView = screen.orientation.angle !== 0;
          return;
        }

        if (typeof orientation === 'number') {
          this.isLandscapeView = orientation !== 0;
          return;
        }
      }
      catch (error) {
        console.error('handleDeviceOrientationChange error:', error.message);
      }
    }
  }
};
