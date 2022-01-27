<template>
  <div class="CongratulationsModal" @click="closeCongratulationsModal">
    <transition name="fade">
      <div
        v-if="isActive"
        ref="modal"
        class="CongratulationsModal__overlay"
      >
        <button class="CongratulationsModal__exit" @click="closeCongratulationsModal">
          <Close />
        </button>
        <p class="CongratulationsModal__title">
          You found all<br>
          the easter eggs!
        </p>
        <p class="CongratulationsModal__copy">
          You have seen what each type was hiding!<br>
          Now they are avaliable to be purchased as NFTs.
        </p>
        <PillButton label="Continue" />
      </div>
    </transition>
  </div>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import Close from '@assets/svgs/close.svg';
  import gsap from 'gsap';
  import PillButton from '../PillButton/PillButton.vue';

  export default {
    name : 'CongratulationsModal',
    components : { Close, PillButton },
    props : {
      isActive : {
        type : Boolean,
        required : true
      }
    },
    computed : {
      ...mapState({
        unlockedLetters : state => state.easterEgg.letterUnlock
      })
    },
    watch : {
      unlockedLetters : {
        deep : true,
        handler(obj) {
          const len = Object.keys(obj).length;
          if (len === 36) {
            this.openCongratulationsModal();
          }
        }
      },
      isActive() {
        this.tl.clear();
        this.tl.fromTo(this.$refs.modal, { scale : 0.6 }, { scale : 1, duration : 0.4, ease : 'back(1.1)' });
      }
    },
    mounted() {
      this.tl = gsap.timeline();
    },
    async beforeUnmount() {
      await this.tl?.timeScale(1.5).reverse();
      this.tl.kill();
    },
    methods : {
      ...mapMutations({
        closeCongratulationsModal : 'modal/closeCongratulationsModal',
        openCongratulationsModal : 'modal/openCongratulationsModal'
      })
    }
  };
</script>

<style lang="scss">

  .CongratulationsModal {
    @include full-size;
    display: flex;
    flex-flow: wrap column;
    justify-content: center;
    align-items: center;
    &__overlay {
      position: relative;
      background: black;
      color: white;
      z-index: 8;
      overflow-y: scroll;
      pointer-events: auto;
      overflow: hidden;
      display: flex;
      flex-flow: wrap column;
      justify-content: space-between;
      align-items: center;
      width: 466px;
      height: 269px;
      border-style: solid;
      text-align: center;
      padding: 30px 74px;
      border: 1px solid;
      border-image-source: $popsicle-gradient;
      border-image-slice: 1;
    }
    &__title {
      @include fk-display-regular(24, 1, math.div(28, 24));
      text-transform: uppercase;
      margin-bottom: 0;
    }
    &__copy {
      @include fk-grotesk-neue-light(14, 0, math.div(22, 14));
    }
    &__exit {
      @include button-no-styles;
      position: absolute;
      z-index: 12;
      right: 20px;
      top: 20px;

      border-radius: 50%;
      background: none;
      cursor: pointer;
      opacity: 1;
      color: white;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      transition: opacity 0.3s;
      padding: 10px;
      transform: translate(10px, -10px);
      svg {
        width: 26px;
        height: 26px;
      }
      &:hover {
        opacity: 0.5;
      }
    }
  }

</style>
