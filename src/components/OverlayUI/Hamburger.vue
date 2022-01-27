<template>
  <div
    :class="['Hamburger',{ 'Hamburger--active' : overlayOpened}]"
    @click="toggleHamburger"
  >
    <span />
    <span />
    <span />
  </div>
</template>

<script>
  export default {
    name : 'Hamburger',
    data() {
      return {
        overlayOpened : false
      };
    },
    watch : {
      $route() {
        this.overlayOpened = false;
      },
      overlayOpened() {
        this.$emit('clicked', this.overlayOpened);
      }
    },
    methods : {
      toggleHamburger() {
        this.overlayOpened = !this.overlayOpened;
      }
    }
  };
</script>

<style lang="scss">

  .Hamburger {
    position: relative;
    width: 27px;
    height: 16px;
    z-index: 11;
    cursor: pointer;
    pointer-events: auto;
    & span {
      transition: transform 0.1s, width 0.1s;
      position: absolute;
      width: 100%;
      height: 2px;
      background: $white;
      &:nth-child(1) {
        top: 0;
        transform: rotate(0);
        transform-origin: top right;
      }
      &:nth-child(2) {
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
        right: 0;
      }
      &:nth-child(3) {
        bottom: 0;
        transform: rotate(0);
        transform-origin: bottom right;
      }
    }

    &--active {
      & span {
        &:nth-child(1) {
          top: 0;
          transform: rotate(-45deg);
          transform-origin: top right;
        }
        &:nth-child(2) {
          visibility: hidden;
          width: 0;
        }
        &:nth-child(3) {
          bottom: -5px;
          transform: rotate(45deg);
          transform-origin: bottom right;
        }
      }
    }
  }
</style>
