<template>
  <div :class="rootElClasses">
    <div ref="bg" class="Loader__bg" />
    <div ref="canvasEl" class="Loader__canvas" />
    <p class="Loader__font1">
      test
    </p>
    <p class="Loader__font2">
      test
    </p>
    <p class="Loader__font3">
      test
    </p>
  </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import gsap from 'gsap';
  import LoaderCanvas from './Loader.canvas';

  export default {
    name : 'Loader',
    props : {
      isActive : {
        type : Boolean,
        required : true
      }
    },
    data() {
      return {
        canvas : null,
        isAnimating : false
      };
    },
    computed : {
      ...mapState({
        isTransitioning : state => state.loader.transitionState.isTransitioning,
        next : state => state.loader.transitionState.next,
        hasloaded : state => state.loader.hasLoaded,
        windowSize : state => state.windowSize,
        windowWidth : state => state.windowSize.width,
        windowHeight : state => state.windowSize.height,
        targetPage : state => state.loader.transitionState.targetPage
      }),
      rootElClasses() {
        return [
          'Loader',
          {
            'Loader--animating' : this.isAnimating
          }
        ];
      }
    },
    watch : {
      isActive(active) {
        if (active) {
          this.animateIn();
        }
        else {
          this.animateOut();
        }
      }
    },
    mounted() {
      this.setupCanvas();
      gsap.to(this.$refs.bg, { autoAlpha : 0, delay : 2 });
    },
    methods : {
      ...mapMutations({ setHasLoaded : 'loader/setHasLoaded' }),
      setupCanvas() {
        this.canvas = new LoaderCanvas({
          canvasEl : this.$refs.canvasEl,
          width : window.innerWidth,
          height : window.innerHeight,
          animationWatcher : this.canvasAnimationWatcher
        });
      },
      animateOut() {
        this.canvas.setLoadingState(false);
      },
      animateIn() {
        this.canvas.setLoadingState(true, this.targetPage);
        this.canvas.animateIn();
      },
      canvasAnimationWatcher(animating) {
        if (!animating) {
          this.setHasLoaded(true);
        }
        this.isAnimating = animating;
        if (!this.isAnimating) {
          gsap.to(
            this.$refs.canvasEl,
            {
              autoAlpha : 0,
              duration : 1,
              delay : 1,
              ease : 'power1.out'
            }
          );
        }
        else {
          gsap.to(
            this.$refs.canvasEl,
            {
              autoAlpha : 1,
              duration : 1,
              ease : 'power1.out'
            }
          );
        }
      }
    }
  };
</script>

<style lang="scss">
  .Loader {
    @include full-size(fixed);
    z-index: 20;
    pointer-events: none;

    &--animating {
      pointer-events: auto;
    }

    &__bg {
      @include full-size;
      // background: $black;
    }

    &__canvas {
      @include full-size;
      pointer-events: none;
    }
    &__font1 {
      @include fk-grotesk-neue-regular(14, 0, 1.57);
      opacity: 0;
    }
    &__font2 {
      @include gosha(120, 0, 1);
      opacity: 0;
    }
    &__font3 {
      @include coign-pro-semibold(269, 0, 0.7);
      opacity: 0;
    }
  }
</style>
