<template>
  <div
    class="ReflektorLogo"
    @mouseover="handleMouseOver"
  >
    <a
      href="https://reflektor.digital"
      target="_blank"
      class="ReflektorLogo__container"
    >
      <ReflektorLogoSvg ref="logo" class="ReflektorLogo__svg" />
    </a>
  </div>
</template>

<script>
  import ReflektorLogoSvg from '@assets/svgs/reflektor-logo.svg';
  import gsap from 'gsap';
  import throttle from 'lodash/throttle';

  export default {
    name : 'ReflektorLogo',
    components : {
      ReflektorLogoSvg
    },
    mounted() {
      this.increment = 0;
      this.throttledAnimate = throttle(this.animateLogo, 400, { trailing : false });
    },
    methods : {
      handleMouseOver() {
        this.throttledAnimate();
      },
      animateLogo() {
        this.increment++;
        gsap.to(this.$refs.logo.$el, {
          rotateY : () => this.increment * 360,
          duration : 1.3,
          ease : 'power2.out',
          overwrite : true
        });
      }
    }

  };
</script>

<style lang="scss">
  $size: 50px;
  $half: calc(#{$size} / 2);
  $title-width: 240px;

  .ReflektorLogo {
    perspective: 80px;
    &__container {
      @include button-no-styles;
      pointer-events: auto;
      transform-style: preserve-3d;
      height: $size;
    }
    &__svg {
      width: $size;
      height: $size;
    }
  }
</style>
