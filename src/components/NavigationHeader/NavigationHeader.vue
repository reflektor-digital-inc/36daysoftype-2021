<template>
  <div :class="rootElClasses">
    <div class="NavigationHeader__left">
      <ReflektorLogo
        ref="reflektorLogo"
        class="NavigationHeader__logo"
      />
      <router-link
        to="/"
        class="NavigationHeader__link"
      >
        Home
      </router-link>
      <router-link
        to="/about"
        class="NavigationHeader__link"
      >
        About
      </router-link>
      <a
        :class="lettersLinkClasses"
        @click="handleLettersClick"
      >
        Letters
      </a>
      <router-link
        to="/market"
        class="NavigationHeader__link"
      >
        NFT Collection
      </router-link>
    </div>
    <div class="NavigationHeader__right">
      <HeaderMarket v-if="showMarketHeader" />
      <Icons
        class="NavigationHeader__icon NavigationHeader__icon-contact"
        @click="handleContactClick"
      >
        <IconContact width="20" />
      </Icons>
    </div>
  </div>
</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import ReflektorLogo from '@components/OverlayUI/ReflektorLogo.vue';
  import HeaderMarket from '@components/HeaderMarket/HeaderMarket.vue';
  import ReflektorLogoSvg from '@assets/svgs/reflektor-logo.svg';
  import Icons from '@components/Icons/Icons.vue';
  import IconContact from '@assets/svgs/icon-contact.svg';

  export default {
    name : 'NavigationHeader',
    components : { ReflektorLogo, HeaderMarket, ReflektorLogoSvg, Icons, IconContact },
    computed : {
      ...mapState({
        isLoading : state => state.loader.isLoading
      }),
      ...mapGetters({
        breakpointPhone : 'windowSize/breakpointPhone',
        breakpointTablet : 'windowSize/breakpointTablet'
      }),
      rootElClasses() {
        return [
          'NavigationHeader',
          {
            'NavigationHeader--sticky' : this.isMarket
          }
        ];
      },
      isMarket() {
        return this.$route.path.includes('market');
      },
      isLetters() {
        return this.$route.path.includes('letter');
      },
      showMarketHeader() {
        return !this.breakpointPhone &&
          !this.breakpointTablet &&
          this.$route.path.includes('market') || this.$route.path.includes('letter');
      },
      lettersLinkClasses() {
        return [
          'NavigationHeader__link',
          { 'NavigationHeader__link--current' : this.isLetters }
        ];
      }
    },
    watch : {
      isLoading(curState, prevState) {
        if (!curState && prevState) {
          this.$refs.reflektorLogo.playAnimation();
        }
      }
    },
    methods : {
      handleLettersClick() {
        if (this.isLetters) return;

        this.$router.push('/letter/a');
      },
      handleContactClick() {
        this.$router.push('/contact');
      }
    }
  };
</script>

<style lang="scss">
  .NavigationHeader {
    @include fk-grotesk-neue-regular(14, 0, math.div(22, 14));
    pointer-events: none;
    color: $white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: $nav-header-height;
    padding: $nav-padding-vertical $nav-padding-horizontal;
    padding-right: 1.9em;
    @include breakpoint($desktop-narrow) {
      padding-left: 1.9em;
    }
    z-index: $navigation-header-z;
    &--sticky {
      position: fixed;
      top: 0;
      background-color: $black;
    }
    &__logo {
      width: 50px;
      margin-right: 1rem;
      display: flex;
      & a {
        align-self: center;
        justify-self: center;
      }
    }
    &__left,
    &__right {
      display: flex;
      align-items: center;
      pointer-events: auto;
    }
    a {
      pointer-events: auto;
      cursor: pointer;
    }
    &__icon {
      margin-left: 1em;
    }
    &__link {
      padding: 1rem;
      position: relative;
      margin-left: calc(50px - 2rem);
      @include breakpoint($desktop-narrow) {
        margin-left: calc(50px - 3rem);
      }
      &::after {
        content: '';
        width: calc(100% - 2rem);
        position: absolute;
        border-bottom: 1px white solid;
        bottom: 1rem;
        left: 1rem;
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.2s;
      }
      &:hover {
        &::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      }
      &.router-link-active, &--current {
        // @include fk-grotesk-neue-bold(14, 0, math.div(22, 14));
        left: -1px;
        &::after {
          content: '';
          width: calc(100% - 2rem);
          position: absolute;
          border-bottom: 1px white solid;
          bottom: 1rem;
          left: 1rem;
          transform: scaleX(1);
          transform-origin: left;
          transition: transform 0.2s;
        }
      }
    }
  }
</style>
