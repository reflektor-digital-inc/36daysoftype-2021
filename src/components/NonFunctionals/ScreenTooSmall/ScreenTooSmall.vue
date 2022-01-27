<template>
  <div class="ScreenTooSmall">
    <div class="ScreenTooSmall__content-container">
      <div class="ScreenTooSmall__image-container">
        <!--<ImagePreloader :image="icon" />-->
      </div>
      <div class="ScreenTooSmall__heading">
        Please Resize Your Browser Window
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name : 'ScreenTooSmall'
  };
</script>

<style lang="scss">

  .ScreenTooSmall {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    background: #000;
    background-size: cover;
    background-position: center;
    z-index: 10000;
    &__content-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    &__image-container {
      height: 100%;
      width: 50%;
      margin: 0 0 20px;
    }
    &__heading {
      text-transform: uppercase;
      text-align: center;
      color: $white;
      &::after {
        content: '';
        display: block;
        height: 2px;
        width: 12px;
        margin: 1.6em auto 0;
      }
    }
  }

</style>
