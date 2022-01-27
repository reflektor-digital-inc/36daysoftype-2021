<template>
  <div class="Icons">
    <button class="Icons__icon-container">
      <slot />
    </button>
  </div>
</template>

<script>
  export default {
    name : 'Icons'
  };
</script>

<style lang="scss">
  $icon-size: 33px;

  .Icons {
    position: relative;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &__icon-container {
      box-sizing: content-box;
      margin: 0;
      padding: 5px;
      border: 1px solid $white;
      width: $icon-size;
      height: $icon-size;
      border-radius: 50%;
      background: none;
      cursor: pointer;
      opacity: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      transition: opacity 0.3s, border 0.3s;

      &:hover {
        border: 1px solid $active-pink;
      }
    }
    &__icon-svg {
      transform: scale(1);
      & .rect {
        transition: width 300ms;
      }
    }
    &__icon-share {
      position: absolute;
      top: 2px;
      left: calc(-200% + -24px);
      margin: 0 !important;
      .Icons__icon-container {
        width: $icon-size - 4px;
        height: $icon-size - 4px;
        background: white;
        &:hover {
          border: 1px solid $white;
        }
        & + & {
          margin-left: 10px;
        }
      }
      .Icons__icon-svg {
        background: white;
      }
    }
    &--active {
      & .Icons__icon-container {
        border: 1px solid;
        opacity: 1;
        border-color: $active-pink;
      }
    }
  }
</style>
