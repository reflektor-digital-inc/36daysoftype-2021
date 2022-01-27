<template>
  <div :class="['BuildInformation', { 'BuildInformation--dark' : darkTheme }]">
    <div
      class="BuildInformation__build-info-toggle-button"
      @click="handleClick"
    >
      <span class="icon">
        {{ toggleSymbol }}
      </span>
    </div>
    <div :class="wrapperClasses">
      <span class="BuildInformation__label">Built On: </span>
      {{ buildDate }}
      <br>
      <span class="BuildInformation__label">Commit: </span>
      {{ commit }}
      <br>
      <span class="BuildInformation__label">Branch: </span>
      {{ branch }}
      <br>
      <span class="BuildInformation__label">Viewport: </span>
      {{ windowWidth }}px * {{ windowHeight }}px (DPR: {{ dpr }})
      <br>
      <span class="BuildInformation__label">Browser:</span>
      {{ `${device.browser.name} v${device.browser.version}` }}
      <br>
      <span class="BuildInformation__label">Device:</span>
      {{ device.isDesktop ? 'Desktop' : `${device.vendor} ${device.model}
      ${device.type}` }}
      <br>
      <span class="BuildInformation__label">OS:</span>
      {{ `${device.os.name} v${device.os.version}` }}
      <!--<br>-->
      <!--<span class="BuildInformation__label">&lt;!&ndash;{{ device.supportAudioRecording
      }}&ndash;&gt;
      </span
      >-->
      <br>
      <span class="BuildInformation__label">UA : </span>
      {{ ua }}
    </div>
  </div>
</template>

<script>
  import { mapState }    from 'vuex';
  import { getBrowser }  from '~/src/utils/query-browser-specs';
  import UserAgentParser from '~/src/utils/UserAgentParser';

  export default {
    name : 'BuildInformation',
    props : {
      darkTheme : {
        type : Boolean,
        default : false
      }
    },
    data() {
      return {
        // Globals set with webpack.DefinePlugin
        buildDate : NETLIFY_BUILD_DATE,
        commit : GIT_COMMIT,
        branch : GIT_BRANCH,
        head : GIT_HEAD,
        open : false,
        ua : window.navigator.userAgent,
        browser : getBrowser(),
        dpr : (window.devicePixelRatio || 1)
      };
    },
    computed : {
      ...mapState({
        windowWidth : state => state.windowSize.width,
        windowHeight : state => state.windowSize.height
      }),
      toggleSymbol() {
        return this.open ? '-' : '+';
      },
      wrapperClasses() {
        return `
        BuildInformation__build-info-wrapper
        BuildInformation__build-info-wrapper--${this.open ? 'open' : 'closed'}
        `;
      },
      device() {
        // Simple conditional based on window size computed values.
        // Has the same effect as creating a watcher on windowsize
        if (!this.windowWidth || !this.windowHeight) return;
        const { browser, device, os } = this.UAParser;
        const { type = 'desktop' }    = device;
        const isDesktop               = type === 'desktop';
        const supportAudioRecording   = `Device ${
          Modernizr.getusermedia ? 'SUPPORTS' : 'DOES NOT SUPPORT'
        } audio recording`;

        return {
          supportAudioRecording,
          ...device,
          os,
          browser,
          isDesktop
        };
      }
    },
    created() {
      this.UAParser = new UserAgentParser();
    },
    methods : {
      handleClick() {
        this.open = !this.open;
      }
    }
  };
</script>

<style lang="scss">

  .BuildInformation {
    position: fixed;
    z-index: 100000;
    top: 0;
    left: 0;
    font-size: 18px;
    color: $white;
    padding: 10px;
    background-color: rgba($black, 0.5);
    &--dark {
      .build-info-toggle-button {
        border: 1px solid #000;
        color: #000;
      }
      .build-info-wrapper {
        background-color: #000;
      }
    }
    @include breakpoint($phone) {
      font-size: 12px;
      padding: 5px;
    }
    &__build-info-wrapper {
      position: relative;
      line-height: 1.2em;
      pointer-events: none;
      &--open {
        display: block;
      }
      &--closed {
        display: none;
      }
    }
    &__label {
      font-weight: bold;
      font-size: 24px;
      @include breakpoint($phone) {
        font-size: 18px;
      }
    }
    &__build-info-toggle-button {
      display: inline-block;
      border: 1px solid $white;
      position: relative;
      margin-bottom: 10px;
      cursor: pointer;
      width: 22px;
      height: 22px;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      -webkit-touch-callout: none;
      user-select: none;
      outline: none;
      user-drag: none;
      opacity: 0.3;
      transition: opacity 0.1s $easeInSine;
      font-size: 20px;
      @include breakpoint($phone) {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }
      .icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      &:hover {
        opacity: 1;
      }
    }
  }

</style>
