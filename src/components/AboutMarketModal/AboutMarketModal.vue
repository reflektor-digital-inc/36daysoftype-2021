<template>
  <div class="AboutMarketModal">
    <div class="AboutMarketModal__backdrop" @click="closeNftModal" />
    <div ref="modal" class="AboutMarketModal__modal">
      <div class="AboutMarketModal__close" @click="closeNftModal">
        <span />
        <span />
      </div>
      <div class="AboutMarketModal__content">
        <h1>{{ title }}</h1>
        <p v-html="body1" />

        <h3>{{ heading }}</h3>
        <p v-html="body2" />
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapMutations } from 'vuex';
  import IconMatic from '@assets/svgs/icon-matic.svg';
  import copy from '@data/about-copy';
  import gsap from 'gsap';
  import PillButton from '../PillButton/PillButton.vue';

  export default {
    name : 'AboutMarketModal',
    components : { PillButton, IconMatic },
    computed : {
      ...mapGetters({
        breakpointPhone : 'windowSize/breakpointPhone',
        breakpointTablet : 'windowSize/breakpointTablet'
      }),
      ...mapState({
        walletConnected : state => state.nft.wallet.connected,
        walletNetworkUnsupported : state => state.nft.wallet.networkUnsupported,
        currentNft : state => state.nft.currentNft
      }),
      title() {
        return copy.title;
      },
      body1() {
        return copy.body1;
      },
      heading() {
        return copy.heading;
      },
      body2() {
        return copy.body2;
      }
    },
    mounted() {
      this.tl = gsap.timeline();
      this.tl.fromTo(this.$refs.modal, { scale : 0.6 }, { scale : 1, duration : 0.4, ease : 'back(1.1)' });
    },
    async beforeUnmount() {
      await this.tl?.timeScale(1.5).reverse();
      this.tl.kill();
    },
    methods : {
      ...mapMutations({
        closeNftModal : 'market/closeMarketModal'
      })
    }
  };
</script>

<style lang="scss">
  .AboutMarketModal {
    @include full-size(fixed);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 30;
    &__modal {
      transform: translate(0, 20px);
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      width: fit-content;
      width: 60vw;
      max-width: 1200px;
      padding: 50px 100px;
      background-color: $black;
      border: 1px solid;
      border-image-source: $popsicle-gradient;
      border-image-slice: 1;
      pointer-events: auto;
      z-index: 2;
      max-height: 90vh;
      @include breakpoint($mobile) {
        flex-direction: column;
        padding: 20px 40px;
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        justify-content: unset;
        align-items: unset;
        transform: translate(0, 0);
        z-index: 30;
      }
      overflow-x: hidden;
      overflow-y: auto;
    }
    &__content {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      flex-direction: column;
      max-width: 650px;

      padding-top: 50px;
      h1 {
        @include gosha(24);
      }
      h3 {
        @include fk-grotesk-neue-regular(14, 0, math.div(22, 14));
        text-transform: uppercase;
        margin-top: 1em;
      }
      p {
        @include fk-grotesk-neue-regular(14, 0, math.div(22, 14));
        span {
          @include fk-grotesk-neue-bold(14, 0, math.div(22, 14));
        }
      }
      a {
        @include animated-underline;
      }
    }
    &__close {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 18px;
      height: 18px;
      cursor: pointer;
      span:first-child {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 18px;
        height: 1px;
        background-color: $white;
        transform-origin: center;
        transform: translate(-50%, -50%) rotate(45deg);
        transition: background-color 0.2s;
      }
      span:last-child {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 18px;
        height: 1px;
        background-color: $white;
        transform-origin: center;
        transform: translate(-50%, -50%) rotate(-45deg);
        transition: background-color 0.2s;
      }
      &:hover span {
        background-color: $active-pink;
      }
    }

    &__backdrop {
      @include full-size(fixed);
      pointer-events: auto;
      z-index: 1;
      background: rgba($black, 0.7);
    }

    &__owner {
      margin-bottom: 8px;
    }

    &__etherscan {
      a {
        text-decoration: underline;
      }
    }
  }
</style>
