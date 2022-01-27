<template>
  <div :class="rootElClasses">
    <ReflektorLogoMobile
      ref="reflektorLogo"
    />
    <Hamburger ref="hamburger" @clicked="toggleOverlay" />
    <NavigationHeaderMobileOverlay
      ref="overlay"
      class="NavigationHeaderMobile__overlay"
    />
  </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import ReflektorLogoMobile from '@components/MobileView/ReflektorLogoMobile.vue';
  import Hamburger from '@components/OverlayUI/Hamburger.vue';
  import gsap from 'gsap';
  import PillButton from '@components/PillButton/PillButton.vue';
  import NavigationHeaderMobileOverlay from '@components/NavigationHeaderMobile/NavigationHeaderMobileOverlay.vue';

  export default {
    name : 'NavigationHeaderMobile',
    components : { ReflektorLogoMobile, Hamburger, PillButton, NavigationHeaderMobileOverlay },
    data() {
      return {
        showOverlay : false
      };
    },
    computed : {
      ...mapState({
        isLoading : state => state.loader.isLoading
      }),
      rootElClasses() {
        return [
          'NavigationHeaderMobile',
          {
            'NavigationHeaderMobile--sticky' : this.$route.path.includes('market')
          }
        ];
      }
    },
    watch : {
      isLoading(curState, prevState) {
        if (!curState && prevState) {
          this.$refs.reflektorLogo.playAnimation();
        }
      },
      showOverlay(val) {
        val ? this.overlaySlideOut() : this.overlayHide();
      }
    },
    mounted() {
      gsap.set(this.$refs.overlay?.$el, { x : '120%' });
    },
    methods : {
      ...mapMutations({
        openNavigationOverlay : 'overlays/openNavigationOverlay',
        closeNavigationOverlay : 'overlays/closeNavigationOverlay'
      }),
      toggleOverlay(value) {
        this.showOverlay = value;
      },
      overlaySlideOut() {
        const overlay = this.$refs.overlay?.$el;
        gsap.fromTo(
          overlay,
          {
            x : '120%'
          },
          {
            x : 0,
            duration : 0.4,
            ease : 'power2.in'
          }
        );
        this.openNavigationOverlay();
      },
      overlayHide() {
        const overlay = this.$refs.overlay?.$el;
        gsap.to(overlay, {
          x : '120%',
          duration : 0.4,
          ease : 'power2.in'
        });
        this.closeNavigationOverlay();
      }
    }
  };
</script>

<style lang="scss">
  .NavigationHeaderMobile {
    position: absolute;
    top: 0;
    overflow: hidden;
    width: 100%;
    z-index: $navigation-header-z;
    color: $white;
    display: flex;
    align-items: center;
    padding: $nav-padding-vertical-mobile $nav-padding-horizontal-mobile;
    justify-content: space-between;
    box-sizing: border-box;
    @include fk-grotesk-neue-regular(18, 0, calc(22 / 18));

    &--sticky {
      background-color: $black;
    }

    &__overlay {
      background-color: $black;
      position: fixed;
      inset: 0;
    }
  }
</style>
