<template>
  <div
    class="Home"
  >
    <PageHeading
      ref="pageHeading"
      class="Home__page-heading"
      v-bind="pageHeadingProps"
    />
    <div ref="bg" class="Home__bg" />

    <div
      v-if="breakpointMobile"
      ref="overlay"
      class="Home__bg-overlay-mobile"
    />
    <div
      v-else
      ref="overlay"
      class="Home__bg-overlay"
    />
    <DiamondEmitter ref="emitter" />
  </div>
</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import LandingGridCell from '@components/three/LandingGridCell/LandingGridCell.vue';
  import GradientText from '@components/GradientText/GradientText';
  import { MathUtils } from 'three';
  import { GRADIENTS } from '@settings/settings.colors';
  import random from 'canvas-sketch-util/random';
  import TransparentBloomPass from '@components/troisExtensions/TransparentBloomPass';
  import PageHeading from '@components/PageHeading/PageHeading';
  import DiamondEmitter from '@components/DiamondEmitter/DiamondEmitter.vue';
  import gsap from 'gsap';
  import loadingLogic from '../mixins/loading-logic';

  export default {
    name : 'Home',
    components : {
      ThreeBackground,
      LandingGridCell,
      TransparentBloomPass,
      GradientText,
      PageHeading,
      DiamondEmitter
    },
    mixins : [loadingLogic],
    data() {
      return {
        GRADIENTS,
        widthFraction : 0.5,
        transitionIn : false,
        transitionOut : false,
        exitTimeout : null,
        enterTimeout : null,
        active : false
      };
    },

    computed : {
      ...mapState({
        hasLoaded : state => state.loader.hasLoaded,
        isLoading : state => state.loader.isLoading,
        windowWidth : state => state.windowSize.width,
        windowHeight : state => state.windowSize.height
      }),
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      pageHeadingProps() {
        return {
          title : '36 Days <br><span>of Type</span>',
          subtitle : '2021',
          description : `Created by the Reflektor Digital development team, 36 Days of Type is a collection of 36 interactive WebGL experiences. Explore each letter and number, find your favourite, and claim it as an NFT on the Polygon blockchain.`,
          buttonLabel : 'View Letters',
          buttonRoute : '/letter/a'
        };
      },
      dimensions() {
        const width = this.windowWidth * this.widthFraction;
        const cols = Math.floor(MathUtils.clamp(
          MathUtils.mapLinear(width, 0, 1920, 1, 10),
          3,
          6
        ));
        // const cols = 3;
        const rows = Math.ceil(this.windowHeight / (width / cols)) + 3;
        const ratio = this.windowWidth / this.windowHeight;
        return { rows, cols, ratio };
      },
      gridStyles() {
        return {
          gridTemplateColumns : `repeat(${this.dimensions.cols},${100 / this.dimensions.cols}%)`,
          gridTemplateRows : `repeat(${this.dimensions.rows},${100 / this.dimensions.rows}%)`
        };
      }
    },
    provide() {
      random.setSeed(290);
      return {
        random
      };
    },
    watch : {
      hasLoaded : {
        immediate : true,
        handler(cur) {
          if (cur) {
            this.$nextTick(() => {
              this.loadPage();
            });
          }
        }
      }
    },
    unmounted() {
      this.tl.kill();
      clearInterval(this.interval);
    },
    methods : {
      loadPage() {
        this.tl = gsap.timeline();
        this.$refs.pageHeading?.tl?.timeScale(1);
        this.tl.add(this.$refs.pageHeading?.tl?.play());
        this.tl.to(this.$refs.bg, { autoAlpha : 1, duration : 1, onComplete : () => {this.transitionIn = true} }, 0.2);
        this.tl.to(this.$refs.overlay, { autoAlpha : 1, duration : 1 }, 0.2);
      },
      unloadPage() {
        this.transitionOut = true;
        // this.tl.clear();
        // this.tl.add(this.$refs.pageHeading?.tl?.timeScale(1.5).reverse());
        // this.tl.to(this.$refs.bg, { autoAlpha : 0, duration : 0.7, delay : 0.5 }, 0);
        // this.tl.to(this.$refs.overlay, { autoAlpha : 0, duration : 0.5, delay : 0.5 }, 0);

        return this.tl.timeScale(3).reverse();
      },
      setCellRef(el) {
        if (el) {
          this.cellRefs.push(el);
        }
      }

    },
    async beforeRouteLeave(to, from, next) {
      this.$refs.emitter.transitionOut = true;
      this.transitionOut = true;
      await this.unloadPage();
      next();
    },
    metaInfo() {
      return {
        title : 'Home',
        meta : []
      };
    }
  };
</script>

<style lang="scss">
  .Home {
    color: white;
    @include full-size;
    // background: conic-gradient(from 40.88deg at 57.47% 47.19%, #151515 -178.7deg, #4e24ed 2.5deg, #bb4bb5 69.37deg, #151515 181.3deg, #4e24ed 362.5deg);
    background: black;

    &__canvas {
      z-index: 3;
      @include full-size;
    }
    &__bg {
      pointer-events: none;
      @include full-size;
      opacity: 0;
      background: linear-gradient(350.79deg, #151515 25.15%, #4e24ed 54.73%, #bb4bb5 93.28%);
      &-overlay-mobile {
        pointer-events: none;
        @include full-size;
        background: linear-gradient(180deg, rgba(15, 15, 15, 0) 0%, #0f0f0f 80%);
        opacity: 0;
        z-index: 4;
      }
      &-overlay {
        pointer-events: none;
        @include full-size;
        background: linear-gradient(113.39deg, rgba(42, 26, 102, 0.8) 33.14%, rgba(42, 26, 102, 0) 70.91%);
        z-index: 4;
        opacity: 0;
      }
      &-grid {
        @include full-size;
        z-index: 2;
        display: grid;
      }
      &-cell {
        //
      }
    }
    &__page-heading {
      position: absolute;
      z-index: 5;
      margin-top: 7rem;
      @include breakpoint($mobile) {
        margin-top: 6rem;
      }
    }
    &__overlay {
      &-grid {
        @include full-size;
        z-index: 4;
        display: grid;
      }
      &-cell {
        position: relative;
        // background: $bg-gradient;
      }
      &-title {
        padding: 30px;
        padding-top: 100px;
        @include fk-display-regular-alt(110, 0, 1.2);
        margin-bottom: unset;
        // padding-left: 85px;
        // & h1 {
        //   @include fk-display-regular-alt(110, 0, 1);
        // }
      }
      &-bottom-title {
        position: absolute;
        right: 30px;
        bottom: 70px;
        font-size: 200px;
        line-height: 1em;
      }
    }

    &__about {
      margin-top: 100vh;
    }
  }
</style>
