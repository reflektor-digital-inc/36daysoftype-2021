<template>
  <div class="ReflektorLogoMobile">
    <a
      href="https://reflektor.digital"
      target="_blank"
      class="ReflektorLogoMobile__container"
    >
      <ReflektorLogoSvg ref="logo" class="ReflektorLogoMobile__svg" />
    </a>
  </div>
</template>

<script>
  import ReflektorLogoSvg from '@assets/svgs/reflektor-logo.svg';

  export default {
    name : 'ReflektorLogoMobile',
    components : {
      ReflektorLogoSvg
    },
    props : {
      showTitle : {
        type : Boolean,
        required : true
      }
    }
  };
</script>

<style lang="scss">
  $size: 50px;
  $half: calc(#{$size} / 2);
  $title-width: 150px;

  .ReflektorLogoMobile {
    z-index: 12;
    top: 20px;
    left: 20px;
    height: 50px;
    &__container {
      @include button-no-styles;
      pointer-events: auto;
      height: 50px;
    }
    &__svg {
      width: $size;
      height: $size;
    }
    &__pivot {
      position: absolute;
      right: -140px;
      top: 0;
      /* top: 5px; */
      transform: rotate(0deg);
      transform-origin: center left;
      height: $size;
      width: $title-width;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 80%, 11% 50%, 0 20.5%);
      display: flex;
      align-items: center;
    }
    &__title {
      position: absolute;
      color: $white;
      @include fk-display-regular-alt(48, 3, 1);
      left: 0;
      bottom: -9px;
      margin-bottom: 0.1em;
      transform: translateX(0%);
      pointer-events: auto;
      & span {
        position: absolute;
        @include fk-grotesk-neue-regular(12.5, -0.1, 1.3);
        left: 1px;
        top: -8px;
        transform: rotate(0deg);
      }
    }
  }
</style>
