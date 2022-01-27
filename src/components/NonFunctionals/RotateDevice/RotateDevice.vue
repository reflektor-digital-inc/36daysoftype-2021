<template>
  <div class="RotateDevice">
    <div class="RotateDevice__content-container">
      <div class="RotateDevice__image-container">
        <!--<ImagePreLoader :image="icon" />-->
      </div>
      <div class="RotateDevice__heading">
        Please Rotate Your Phone
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name : 'RotateDevice'
  };
</script>

<style lang="scss">

  .RotateDevice {
    @include full-size(fixed);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
      width: 30%;
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
