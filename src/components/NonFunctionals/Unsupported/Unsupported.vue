<template>
  <div class="Unsupported">
    <!--<ImagePreLoader-->
    <!--:image="backgroundImage"-->
    <!--width="100%"-->
    <!--height="100%"-->
    <!--size="fill"-->
    <!--/>-->
    <div class="Unsupported__copy">
      {{ copy }}
    </div>
  </div>
</template>

<script>
  export default {
    name : 'Unsupported',
    data() {
      return {
        copy : 'For the full experience, please visit \'PROEJCT\' on your device’s default browser app.'
      };
    }
  };
</script>

<style lang="scss">

  .component-Unsupported {
    @include full-size(fixed);
    z-index: 999999;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    background-color: $black;
    &__copy {
      color: $white;
      z-index: 2;
      width: 50%;
      text-align: center;
      @include breakpoint($phone) {
        width: 90%;
      }
    }
  }

</style>
